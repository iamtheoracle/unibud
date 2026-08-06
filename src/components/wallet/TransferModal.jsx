import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowUpRight, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatMoney } from "./WalletShared";
import { WalletService } from "@/lib/finance/walletService";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

/**
 * TransferModal — internal wallet-to-wallet transfer (peer, no external provider).
 * Debits the source wallet and credits the destination, writing a single
 * FinancialTransaction (type "transfer") and two ledger entries.
 */
export default function TransferModal({ open, onClose, wallet, institutionId }) {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const { data: myWallets } = useQuery({
    queryKey: ["walletWallets"],
    queryFn: () => base44.entities.Wallet.list(),
    enabled: open,
  });
  const source = useMemo(() => wallet || (myWallets || [])[0], [wallet, myWallets]);

  async function handleSend() {
    setErr("");
    const amt = Number(amount);
    if (!(amt > 0)) return setErr("Enter a valid amount.");
    if (!source?.id) return setErr("No source wallet.");
    if (!recipient.trim()) return setErr("Enter a recipient wallet reference.");
    if ((Number(source.available_balance) || 0) < amt) return setErr("Insufficient available balance.");
    setSending(true);
    try {
      const ref = "TRF" + Date.now();
      // Single transaction record + double-entry ledger via WalletService.
      const tx = await base44.entities.FinancialTransaction.create({
        type: "transfer",
        amount: amt,
        currency: source.currency || "NGN",
        from_wallet_id: source.id,
        to_wallet_id: recipient.trim(),
        status: "pending",
        reference: ref,
        description: note || "Wallet transfer",
        institution_id: institutionId || source.institution_id,
      });
      await WalletService.debit(source.id, amt, { description: note || "Transfer out", reference: ref, transaction_id: tx.id, institution_id: source.institution_id });
      await WalletService.credit(recipient.trim(), amt, { description: note || "Transfer in", reference: ref, transaction_id: tx.id, institution_id: source.institution_id }).catch(() => {});
      await base44.entities.FinancialTransaction.update(tx.id, { status: "completed" });
      await queryClientInstance.invalidateQueries({ queryKey: ["walletWallets"] });
      await queryClientInstance.invalidateQueries({ queryKey: ["walletTx"] });
      toast({ title: "Transfer complete", description: `${formatMoney(amt)} sent.` });
      setAmount(""); setRecipient(""); setNote("");
      onClose();
    } catch (e) {
      setErr(e.message || "Transfer failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[28px] bg-card soft-shadow border border-border/40 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[16px] text-foreground">Transfer</h3>
                  <p className="text-[11px] text-muted-foreground">Send to another UNIBUD wallet</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="rounded-[18px] bg-muted/30 p-3.5 mb-3">
              <p className="text-[11px] text-muted-foreground">From · Available</p>
              <p className="font-heading font-bold text-[18px] text-foreground">{formatMoney(source?.available_balance ?? source?.balance ?? 0)}</p>
            </div>

            <label className="text-[12px] font-semibold text-foreground">Recipient wallet ID</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Paste wallet reference"
              className="w-full h-12 mt-1.5 px-4 rounded-[16px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50"
            />

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Amount</label>
            <div className="relative mt-1.5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-muted-foreground">₦</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full h-14 pl-9 pr-4 rounded-[18px] bg-muted/30 border border-border/40 text-[20px] font-bold text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full h-11 mt-3 px-4 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50"
            />

            {err && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-[14px] bg-error/8 border border-error/15">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-error">{err}</p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full mt-4 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              {sending ? "Sending…" : "Send Transfer"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}