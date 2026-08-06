import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Circle, CircleCheck, CreditCard, Landmark, Loader2, Wallet as WalletIcon, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function getWalletBalance(user) {
  return Number(
    user?.wallet_balance ??
    user?.wallet?.balance ??
    user?.wallet?.available_balance ??
    user?.balance ??
    0
  );
}

function formatDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "";
  }
}

const METHODS = [
  {
    key: "wallet",
    label: "Pay from Wallet",
    icon: WalletIcon,
    description: "Use your UNIBUD wallet balance for instant checkout.",
  },
  {
    key: "bank_transfer",
    label: "Bank Transfer",
    icon: Landmark,
    description: "Transfer directly and share proof with the seller.",
  },
  {
    key: "cash_on_pickup",
    label: "Cash on Pickup",
    icon: CreditCard,
    description: "Meet the seller in person and pay on collection.",
  },
];

export default function CheckoutModal({ open, onClose, listing, user }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const [submitting, setSubmitting] = useState(false);

  const walletBalance = getWalletBalance(user);
  const walletSufficient = walletBalance >= Number(listing?.price || 0);
  const selected = METHODS.find((m) => m.key === selectedMethod) || METHODS[0];

  const sellerContact = useMemo(
    () => listing?.contact || listing?.seller_handle || listing?.seller_contact || "Seller contact will be shared after order.",
    [listing]
  );

  const close = () => {
    if (submitting) return;
    setStep(0);
    setSelectedMethod("wallet");
    onClose?.();
  };

  const nextStep = () => {
    if (step === 1 && selectedMethod === "wallet" && !walletSufficient) {
      toast({ title: "Insufficient wallet balance", description: "Choose another payment method or fund your wallet.", variant: "destructive" });
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const placeOrder = async () => {
    if (!listing?.id || !user?.id) {
      toast({ title: "Unable to place order", description: "Missing buyer or listing details.", variant: "destructive" });
      return;
    }
    if (selectedMethod === "wallet" && !walletSufficient) {
      toast({ title: "Insufficient wallet balance", description: "Choose another payment method or fund your wallet.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.MarketplaceOrder.create({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.created_by_id,
        amount: listing.price,
        payment_method: selectedMethod,
        status: "pending",
      });
      toast({ title: "Order placed!", description: "Contact seller to arrange pickup." });
      close();
    } catch {
      toast({ title: "Could not place order", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && listing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm safe-area-px"
          onClick={close}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb"
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="font-heading font-bold text-[18px] text-foreground">Checkout</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {["Review Order", "Payment Method", "Confirm"][step]}
                </p>
              </div>
              <button onClick={close} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= step ? "bg-foreground" : "bg-muted/40"}`} />
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div className="glass-card rounded-[22px] p-4">
                  <p className="text-[18px] font-bold text-foreground">{listing.title}</p>
                  <p className="text-[20px] font-bold text-primary mt-1">{formatPrice(listing.price)}</p>
                  <div className="mt-3 space-y-2 text-[12px] text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span>Seller</span>
                      <span className="font-semibold text-foreground">{listing.seller_name || "Student Seller"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Condition</span>
                      <span className="font-semibold text-foreground capitalize">{listing.condition?.replaceAll("_", " ") || "Not specified"}</span>
                    </div>
                    {listing.location && (
                      <div className="flex items-center justify-between gap-3">
                        <span>Location</span>
                        <span className="font-semibold text-foreground">{listing.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={nextStep} className="w-full py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap">
                  Proceed to Payment
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                {METHODS.map((method) => {
                  const Icon = method.icon;
                  const active = selectedMethod === method.key;
                  const disabled = method.key === "wallet" && !walletSufficient;
                  return (
                    <button
                      key={method.key}
                      onClick={() => !disabled && setSelectedMethod(method.key)}
                      className={`w-full text-left rounded-[22px] p-4 border transition-all spring-tap ${
                        active ? "border-foreground/60 glass-card" : "border-border/30 bg-background/40"
                      } ${disabled ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-[16px] glass grid place-items-center shrink-0">
                          <Icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[14px] font-semibold text-foreground">{method.label}</p>
                            {active ? <CircleCheck className="w-4.5 h-4.5 text-primary" /> : <Circle className="w-4.5 h-4.5 text-muted-foreground/50" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{method.description}</p>
                          {method.key === "wallet" && (
                            <p className={`text-[11px] mt-2 font-medium ${walletSufficient ? "text-success" : "text-warning"}`}>
                              Balance: {formatPrice(walletBalance)} {!walletSufficient && "· Insufficient"}
                            </p>
                          )}
                          {method.key === "bank_transfer" && (
                            <p className="text-[11px] mt-2 text-foreground/80">Seller contact: {sellerContact}</p>
                          )}
                          {method.key === "cash_on_pickup" && listing.location && (
                            <p className="text-[11px] mt-2 text-foreground/80">Pickup at {listing.location}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-[16px] glass-card text-foreground font-semibold text-[13px] spring-tap">
                    Back
                  </button>
                  <button onClick={nextStep} className="flex-1 py-3 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="glass-card rounded-[22px] p-4 space-y-3">
                  <Row label="Item" value={listing.title} />
                  <Row label="Amount" value={formatPrice(listing.price)} />
                  <Row label="Payment method" value={selected.label} />
                  <Row label="Seller" value={listing.seller_name || "Student Seller"} />
                  <Row label="Contact" value={sellerContact} />
                  <Row label="Date" value={formatDate(new Date())} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-[16px] glass-card text-foreground font-semibold text-[13px] spring-tap">
                    Back
                  </button>
                  <button onClick={placeOrder} disabled={submitting} className="flex-1 py-3 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Confirm Order
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
