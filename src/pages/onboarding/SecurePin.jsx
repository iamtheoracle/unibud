import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete } from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { hapticTap, hapticImpact } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

export default function SecurePin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phase, setPhase] = useState("create"); // create → confirm
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const currentPin = phase === "create" ? pin : confirmPin;

  const handlePress = useCallback((digit) => {
    hapticTap();
    setError("");
    if (phase === "create") {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 4) {
          setTimeout(() => {
            setPhase("confirm");
          }, 200);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + digit;
        setConfirmPin(newConfirm);
        if (newConfirm.length === 4) {
          setTimeout(() => {
            if (newConfirm === pin) {
              hapticImpact();
              localStorage.setItem("unibud_pin_set", "true");
              navigate("/onboarding/biometric-setup");
            } else {
              setError("PINs don't match. Try again.");
              setShake(true);
              setTimeout(() => {
                setShake(false);
                setConfirmPin("");
                setError("");
              }, 600);
            }
          }, 200);
        }
      }
    }
  }, [pin, confirmPin, phase, navigate]);

  const handleDelete = useCallback(() => {
    hapticTap();
    setError("");
    if (phase === "create") {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  }, [pin, confirmPin, phase]);

  const handleSkip = () => {
    hapticTap();
    navigate("/onboarding/biometric-setup");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-[60%] h-[35%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-center gap-2 px-6 pt-4 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)" }}
      >
        <span className="text-foreground"><UnibudMark className="w-5 h-5" /></span>
        <span className="font-heading font-extrabold text-[14px] text-foreground">UNIBUD</span>
      </div>

      {/* Lock icon + title */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease }}
          className="w-16 h-16 rounded-[22px] bg-primary/8 flex items-center justify-center mb-5"
        >
          <Lock className="w-7 h-7 text-primary" strokeWidth={1.8} />
        </motion.div>

        <motion.div
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground text-center mb-1">
            {phase === "create" ? "Create a Secure PIN" : "Confirm Your PIN"}
          </h2>
          <p className="text-[13px] text-muted-foreground text-center max-w-[280px] mb-6">
            {phase === "create"
              ? "This PIN protects your account. Use 4 digits you'll remember."
              : "Enter the same PIN to confirm."}
          </p>

          {/* PIN dots */}
          <div className="flex items-center justify-center gap-4 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: currentPin.length === i ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 rounded-full border-2 ${
                  i < currentPin.length
                    ? "bg-primary border-primary"
                    : "bg-transparent border-border"
                }`}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[12px] text-destructive font-medium mt-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Numeric keypad */}
      <div
        className="px-8 pb-4 relative z-10"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <motion.button
              key={digit}
              whileTap={{ scale: 0.92 }}
              onClick={() => handlePress(String(digit))}
              className="h-16 rounded-2xl bg-card border border-border/30 flex items-center justify-center text-[24px] font-heading font-semibold text-foreground spring-tap"
            >
              {digit}
            </motion.button>
          ))}
          <button
            onClick={handleSkip}
            className="h-16 rounded-2xl flex items-center justify-center text-[12px] font-semibold text-muted-foreground spring-tap"
          >
            Skip
          </button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handlePress("0")}
            className="h-16 rounded-2xl bg-card border border-border/30 flex items-center justify-center text-[24px] font-heading font-semibold text-foreground spring-tap"
          >
            0
          </motion.button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl flex items-center justify-center spring-tap"
            aria-label="Delete"
          >
            <Delete className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}