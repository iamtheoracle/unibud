import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Delete, LockKeyhole } from "lucide-react";

const PIN_LENGTH = 4;

function PinDots({ value }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: PIN_LENGTH }, (_, index) => (
        <div
          key={index}
          className={`flex h-14 items-center justify-center rounded-[18px] border text-[18px] font-bold transition ${
            value[index] ? "border-primary/40 bg-primary/10 text-primary" : "border-border/40 bg-muted/30 text-muted-foreground"
          }`}
        >
          {value[index] ? "•" : ""}
        </div>
      ))}
    </div>
  );
}

export default function PINSetupModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setPin("");
      setConfirmPin("");
      setError("");
      setCompleted(false);
      return;
    }
    hiddenInputRef.current?.focus();
  }, [open, step, completed]);

  const activeValue = step === 1 ? pin : confirmPin;

  const appendDigit = (digit) => {
    setError("");
    if (completed) return;
    if (step === 1) {
      if (pin.length >= PIN_LENGTH) return;
      const nextPin = `${pin}${digit}`;
      setPin(nextPin);
      if (nextPin.length === PIN_LENGTH) setStep(2);
      return;
    }

    if (confirmPin.length >= PIN_LENGTH) return;
    const nextConfirm = `${confirmPin}${digit}`;
    setConfirmPin(nextConfirm);
    if (nextConfirm.length === PIN_LENGTH) {
      if (nextConfirm === pin) {
        try {
          localStorage.setItem("wallet_pin_hash", nextConfirm);
        } catch {}
        setCompleted(true);
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setError("PINs don't match");
        setStep(1);
        setPin("");
        setConfirmPin("");
      }
    }
  };

  const removeDigit = () => {
    if (completed) return;
    if (step === 2 && confirmPin.length > 0) {
      setConfirmPin((value) => value.slice(0, -1));
      return;
    }
    if (step === 2 && confirmPin.length === 0) {
      setStep(1);
      setPin((value) => value.slice(0, -1));
      return;
    }
    setPin((value) => value.slice(0, -1));
  };

  const handleHiddenInput = (event) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) return;
    raw.split("").forEach((digit) => appendDigit(digit));
    event.target.value = "";
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
            className="w-full max-w-sm rounded-[28px] border border-border/40 bg-card p-5 soft-shadow"
          >
            <input
              ref={hiddenInputRef}
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="sr-only"
              onChange={handleHiddenInput}
            />

            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-primary/10">
                  {completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <LockKeyhole className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-heading text-[16px] font-bold text-foreground">{completed ? "PIN saved" : step === 1 ? "Create PIN" : "Confirm PIN"}</h3>
                  <p className="text-[11px] text-muted-foreground">{completed ? "Your wallet PIN is ready." : "Use a secure 4-digit wallet PIN"}</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 spring-tap">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {completed ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
                <p className="mt-3 text-[15px] font-semibold text-foreground">Wallet PIN created</p>
                <p className="mt-1 text-[11px] text-muted-foreground">You can now use your PIN for wallet verification.</p>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => hiddenInputRef.current?.focus()} className="w-full text-left">
                  <PinDots value={activeValue} />
                </button>
                {error && <p className="mt-3 text-center text-[12px] font-medium text-error">{error}</p>}

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((key) => {
                    if (key === "") return <div key="empty" />;
                    if (key === "back") {
                      return (
                        <button
                          key="back"
                          type="button"
                          onClick={removeDigit}
                          className="flex h-14 items-center justify-center rounded-[18px] border border-border/40 bg-muted/30 text-foreground spring-tap"
                        >
                          <Delete className="h-5 w-5" />
                        </button>
                      );
                    }
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => appendDigit(String(key))}
                        className="h-14 rounded-[18px] border border-border/40 bg-muted/30 text-[18px] font-semibold text-foreground spring-tap"
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
