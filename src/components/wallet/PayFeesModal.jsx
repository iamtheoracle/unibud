import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, GraduationCap, ShieldCheck, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatMoney } from "./WalletShared";
import { startCardCheckout } from "@/lib/finance/cardPayment";
import { useToast } from "@/components/ui/use-toast";

const TYPE_MAP = {
  tuition: "tuition_payment",
  school: "school_fee",
  hostel: "hostel_fee",
  acceptance: "acceptance_fee",
  examination: "examination_fee",
  library: "library_fee",
  other: "school_fee",
};

/**
 * PayFeesModal — pay a school fee via card checkout.
 * Lists the institution's FeeStructure; on confirm, opens card checkout.
 * Money credits the institution's wallet; the webhook completes the ledger.
 */
export default function PayFeesModal({ open, onClose, institutionId }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  const { data: fees, isLoading } = useQuery({
    queryKey: ["payFees", institutionId],
    queryFn: () => base44.entities.FeeStructure.filter({ institution_id: institutionId }, "-amount", 50),
    enabled: open && !!institutionId,
  });

  const { data: instWallet } = useQuery({
    queryKey: ["institutionWallet", institutionId],
    queryFn: () => base44.entities.Wallet.filter({ owner_type: "institution", institution_id: institutionId }, "-created_date", 5),
    enabled: open && !!institutionId,
  });

  const destinationWalletId = (instWallet || [])[0]?.id || "";

  const list = useMemo(() => (fees || []).filter((f) => !f.waiver), [fees]);

  async function handlePay() {
    setErr("");
    if (!selected) return setErr("Select a fee to pay.");
    if (!destinationWalletId) return setErr("Institution wallet not available. Contact your administrator.");
    setPaying(true);
    try {
      const fee = (fees || []).find((f) => f.id === selected);
      const amount = Math.max(0, Number(fee?.amount || 0) - Number(fee?.discount || 0) + Number(fee?.late_fee || 0));
      await startCardCheckout({
        amount,
        currency: "NGN",
        description: fee?.name || "School Fee",
        type: TYPE_MAP[fee?.category] || "school_fee",
        to_wallet_id: destinationWalletId,
        institution_id: institutionId,
        fee_id: fee.id,
      });
      // Browser redirects to payment provider here — the line below only runs if redirect blocked.
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
            className="w-full max-w-md rounded-[28px] bg-card soft-shadow border border-border/40 p-5 max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[16px] text-foreground">Pay School Fees</h3>
                  <p className="text-[11px] text-muted-foreground">Secure card payment</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : list.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-muted-foreground">No fees available to pay right now.</p>
                <p className="text-[11px] text-muted-foreground mt-1">Your institution hasn't published any fees for this session.</p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-4">
                {list.map((f) => {
                  const net = Math.max(0, Number(f.amount || 0) - Number(f.discount || 0) + Number(f.late_fee || 0));
                  const on = selected === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelected(f.id)}
                      className={`w-full text-left p-3.5 rounded-[18px] border spring-tap transition-colors ${
                        on ? "border-primary bg-primary/8" : "border-border/40 bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{f.name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{f.category} · {f.session || "Current session"}</p>
                        </div>
                        <p className="text-[14px] font-bold text-foreground">{formatMoney(net)}</p>
                      </div>
                      {(Number(f.discount) > 0 || Number(f.late_fee) > 0) && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {Number(f.discount) > 0 && `Discount ${formatMoney(f.discount)} · `}
                          {Number(f.late_fee) > 0 && `Late fee ${formatMoney(f.late_fee)}`}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {err && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-[14px] bg-error/8 border border-error/15">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-error">{err}</p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying || !selected || !destinationWalletId}
              className="w-full mt-4 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {paying ? "Processing payment…" : "Pay with Card"}
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secured payment
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}