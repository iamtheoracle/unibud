import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowDownLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { formatMoney } from "./WalletShared";
import { startStripeCheckout } from "@/lib/finance/stripeCheckout";
import { useToast } from "@/components/ui/use-toast";

const QUICK = [1000, 5000, 10000, 25000];

/**
 * FundWalletModal — add money to your own wallet via real Stripe card checkout.
 * The webhook credits the student wallet; the redirect polls until reconciled.
 */
export default function FundWalletModal({ open, onClose, wallet, institutionId }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  async function handlePay() {
    setErr("");
    const amt = Number(amount);
    if (!(amt > 0)) return setErr("Enter a valid amount.");
    if (!wallet?.id) return setErr("No wallet found to fund.");
    setPaying(true);
    try {
      await startStripeCheckout({
        amount: amt,
        currency: "NGN",
        description: "Add money to UNIBUD wallet",
        type: "deposit",
        to_wallet_id: wallet.id,
        institution_id: institutionId || wallet.institution_id,
      });
    } catch (e) {
      setPaying(false);
      setErr(e.message || "Payment could not start.");
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
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
                <div className="w-9 h-9 rounded-[14px] bg-success/10 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-success" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[16px] text-foreground">Add Money</h3>
                  <p className="text-[11px] text-muted-foreground">Fund your wallet with a card</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="rounded-[18px] bg-muted/30 p-3.5 mb-3">
              <p className="text-[11px] text-muted-foreground">Current balance</p>
              <p className="font-heading font-bold text-[20px] text-foreground">{formatMoney(wallet?.available_balance ?? wallet?.balance ?? 0)}</p>
            </div>

            <label className="text-[12px] font-semibold text-foreground">Amount</label>
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

            <div className="grid grid-cols-4 gap-2 mt-3">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className="py-2 rounded-[12px] bg-muted/40 border border-border/40 text-[12px] font-semibold text-foreground spring-tap"
                >
                  {formatMoney(q, "")}
                </button>
              ))}
            </div>

            {err && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-[14px] bg-error/8 border border-error/15">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-error">{err}</p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full mt-4 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {paying ? "Redirecting to Stripe…" : `Add ${amount ? formatMoney(amount) : "Money"}`}
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secured by Stripe · Test mode
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}