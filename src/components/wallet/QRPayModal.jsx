import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Camera, Copy, Send } from "lucide-react";
import { SectionCard, formatMoney } from "./WalletShared";
import { useToast } from "@/components/ui/use-toast";

function QRPlaceholder({ walletId }) {
  const cells = useMemo(
    () =>
      Array.from({ length: 49 }, (_, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        const filled = row === 0 || col === 0 || row === 6 || col === 6 || (row + col) % 2 === 0 || (row === 3 && col === 3);
        return filled;
      }),
    []
  );

  return (
    <div className="rounded-[24px] border border-border/40 bg-card p-4">
      <div className="mx-auto grid w-40 grid-cols-7 gap-1 rounded-[18px] bg-white p-3 shadow-sm">
        {cells.map((filled, index) => (
          <div key={index} className={`aspect-square rounded-[2px] ${filled ? "bg-black" : "bg-white"}`} />
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">Show this code to receive payment</p>
      <p className="mt-1 text-center font-heading text-[14px] font-bold text-foreground break-all">{walletId || "Wallet ID unavailable"}</p>
    </div>
  );
}

export default function QRPayModal({ open, onClose, wallet, user }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("my-qr");
  const [amount, setAmount] = useState("");
  const [paymentCode, setPaymentCode] = useState("");

  const walletId = wallet?.id || "";
  const walletBalance = wallet?.available_balance ?? wallet?.balance ?? 0;
  const displayName = user?.full_name || wallet?.owner_name?.split("·")?.[0]?.trim() || "UNIBUD User";

  const shareLink = async () => {
    const link = `unibud://pay?wallet=${walletId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Payment link copied", description: "Share it to receive funds quickly." });
    } catch {
      toast({ title: "Copy failed", description: link, variant: "destructive" });
    }
  };

  const handlePay = () => {
    toast({ title: "Demo mode", description: "QR payment not yet available in demo mode" });
    setPaymentCode("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[28px] border border-border/40 bg-card p-5 soft-shadow"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-warning/10">
                  <QrCode className="h-5 w-5 text-warning" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-heading text-[16px] font-bold text-foreground">QR Pay</h3>
                  <p className="text-[11px] text-muted-foreground">Send or receive with wallet QR</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 spring-tap">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-[18px] bg-muted/30 p-1">
              {[
                { key: "my-qr", label: "My QR Code" },
                { key: "scan", label: "Scan QR" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`rounded-[14px] px-3 py-2 text-[12px] font-semibold transition ${tab === item.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "my-qr" ? (
              <div className="space-y-3">
                <QRPlaceholder walletId={walletId} />
                <SectionCard className="bg-muted/20">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Wallet owner</p>
                        <p className="text-[13px] font-semibold text-foreground">{displayName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Balance</p>
                        <p className="text-[13px] font-bold text-foreground">{formatMoney(walletBalance)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-foreground">Request amount (optional)</label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-muted-foreground">₦</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="h-12 w-full rounded-[16px] border border-border/40 bg-background/70 pl-9 pr-4 text-[13px] text-foreground focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
                <button
                  onClick={shareLink}
                  disabled={!walletId}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-primary py-3.5 text-[14px] font-semibold text-primary-foreground spring-tap disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  Share Payment Link
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-border/60 bg-muted/25 text-center spring-tap"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-muted">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Tap to scan</p>
                    <p className="text-[11px] text-muted-foreground">Camera support coming soon</p>
                  </div>
                </button>

                <div>
                  <label className="text-[12px] font-semibold text-foreground">Enter Payment Code</label>
                  <input
                    value={paymentCode}
                    onChange={(e) => setPaymentCode(e.target.value)}
                    placeholder="Paste or type code"
                    className="mt-1.5 h-12 w-full rounded-[16px] border border-border/40 bg-muted/30 px-4 text-[13px] text-foreground focus:border-primary/50 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handlePay}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-primary py-3.5 text-[14px] font-semibold text-primary-foreground spring-tap"
                >
                  <Send className="h-4 w-4" />
                  Pay
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
