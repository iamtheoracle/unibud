import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import BudCharacter from "@/components/brand/BudCharacter";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { PLATFORM_IDENTITY } from "@/lib/companyIdentity";

const EASE = [0.16, 1, 0.3, 1];

const LINES = [
  "Hi! I'm Bud.",
  "I'll help you study smarter, stay organized, and make university life easier.",
  "Think of me as your academic companion throughout your journey.",
];

/**
 * MeetBud — Screen 5.
 * Bud appears as the official anime companion. Friendly, calm,
 * intelligent, and encouraging. Buttons: Let's Begin · Skip for Now.
 */
export default function MeetBud() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [visible, setVisible] = useState(0);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      setAuthed(ok);
      setChecking(false);
      if (!ok) navigate("/login", { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    if (!authed || visible >= LINES.length) return;
    const t = setTimeout(() => setVisible((n) => n + 1), 850);
    return () => clearTimeout(t);
  }, [visible, authed]);

  const begin = () => setPreparing(true);

  const signOut = () => {
    base44.auth.logout();
    navigate("/welcome", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={18} />

      <motion.div
        className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[80%] h-[55%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.18), transparent 70%)" }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="pt-6"
        >
          <BrandLogo size="sm" />
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Bud — official anime companion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative"
          >
            <div
              className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 45%, rgba(127,216,255,0.36), transparent 65%)", filter: "blur(24px)" }}
            />
            <div className="relative w-40 h-40 rounded-full glass-strong overflow-hidden ice-glow">
              <BudCharacter animate={false} glow={false} className="w-full h-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
            className="flex items-center gap-2 mt-7"
          >
            <span className="font-heading font-bold text-[22px] text-foreground">Bud</span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/12 text-primary text-[10px] font-semibold tracking-wide">
              ACADEMIC COMPANION
            </span>
          </motion.div>

          {/* Intro lines */}
          <div className="mt-6 space-y-2.5 max-w-[340px] min-h-[110px] flex flex-col items-center text-center">
            <AnimatePresence>
              {LINES.slice(0, visible).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={`text-[14px] leading-relaxed ${
                    i === 0 ? "text-foreground font-medium text-[16px]" : "text-muted-foreground"
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>

          {/* Buttons — appear after all lines */}
          {visible >= LINES.length && !preparing && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-9 w-full space-y-3"
            >
              <button
                onClick={begin}
                className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap ice-glow"
              >
                <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.2} />
                Let's Begin
                <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </button>
              <button
                onClick={begin}
                className="w-full h-[48px] rounded-2xl font-heading font-medium text-[14px] text-muted-foreground spring-tap hover:text-foreground"
              >
                Skip for Now
              </button>
            </motion.div>
          )}

          {/* Preparing state */}
          {preparing && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-9 w-full glass-card p-6 flex flex-col items-center text-center"
            >
              <Loader2 className="w-7 h-7 text-primary animate-spin mb-4" />
              <p className="text-[14px] font-medium text-foreground">Preparing your UNIBUD experience…</p>
              <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed max-w-[280px]">
                The full {PLATFORM_IDENTITY.product} operating system is loading. Your companion is ready when you are.
              </p>
              <button onClick={signOut} className="text-[12px] text-muted-foreground/70 hover:text-foreground font-medium mt-4 underline">
                Sign out
              </button>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="pb-8 safe-area-pb"
        >
          <CompanyFooter />
        </motion.div>
      </div>
    </div>
  );
}