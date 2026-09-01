import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint, ScanFace, ChevronRight, Check } from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { hapticImpact, hapticTap } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

export default function BiometricSetup() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);

  const handleEnable = () => {
    hapticImpact();
    setEnabled(true);
    localStorage.setItem("unibud_biometric", "true");
    setTimeout(() => navigate("/onboarding/permissions"), 800);
  };

  const handleSkip = () => {
    hapticTap();
    localStorage.setItem("unibud_biometric", "false");
    navigate("/onboarding/permissions");
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease, type: "spring", stiffness: 200, damping: 18 }}
          className={`w-28 h-28 rounded-[32px] flex items-center justify-center mb-6 ${
            enabled ? "bg-success/10" : "bg-primary/8"
          }`}
        >
          {enabled ? (
            <Check className="w-14 h-14 text-success" strokeWidth={2.5} />
          ) : (
            <div className="flex flex-col items-center">
              <ScanFace className="w-12 h-12 text-primary" strokeWidth={1.5} />
              <Fingerprint className="w-8 h-8 text-primary -mt-2" strokeWidth={1.5} />
            </div>
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease }}
          className="font-heading font-extrabold text-[22px] tracking-tight text-foreground text-center mb-2"
        >
          {enabled ? "Biometric Enabled" : "Enable Biometric Login"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease }}
          className="text-[13px] text-muted-foreground text-center max-w-[300px] leading-relaxed"
        >
          {enabled
            ? "You can now sign in quickly and securely with Face ID or Touch ID."
            : "Use Face ID or Touch ID for fast, secure access to your UNIBUD account. Your biometric data never leaves your device."}
        </motion.p>
      </div>

      {/* Footer */}
      <div
        className="px-6 pb-2 pt-3 relative z-10 bg-gradient-to-t from-background via-background/95 to-transparent"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      >
        {!enabled ? (
          <div className="space-y-2.5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleEnable}
              className="w-full h-[52px] rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_6px_24px_hsl(var(--primary)/0.3)]"
            >
              Enable Biometric
              <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </motion.button>
            <button
              onClick={handleSkip}
              className="w-full h-11 flex items-center justify-center text-[13px] font-medium text-muted-foreground spring-tap"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate("/onboarding/permissions")}
            className="w-full h-[52px] rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_6px_24px_hsl(var(--primary)/0.3)]"
          >
            Continue
            <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </motion.button>
        )}
      </div>
    </div>
  );
}