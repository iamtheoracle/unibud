import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import BudCharacter from "@/components/brand/BudCharacter";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { PLATFORM_IDENTITY } from "@/lib/companyIdentity";

const EASE = [0.16, 1, 0.3, 1];

const introLines = [
  "Hi, I'm Bud — your academic companion.",
  "I'll help you learn smarter, stay organised, and grow through every moment of university life.",
  "Think of me as a trusted tutor, mentor, and friend — always here, always on your side.",
];

export default function MeetBud() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [visibleLines, setVisibleLines] = useState(0);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      setAuthed(ok);
      setChecking(false);
      if (!ok) navigate("/login", { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    if (!authed) return;
    if (visibleLines >= introLines.length) return;
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [visibleLines, authed]);

  const handleBegin = () => {
    setPreparing(true);
  };

  const handleSignOut = () => {
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <SparkField count={16} />

      {/* Ambient glow */}
      <motion.div
        className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[80%] h-[55%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.16), transparent 70%)" }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="pt-14 px-6 safe-area-pt z-10"
      >
        <BrandLogo size="sm" />
      </motion.div>

      {/* Bud hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative"
        >
          <div
            className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 45%, rgba(127,216,255,0.35), transparent 65%)", filter: "blur(24px)" }}
          />
          <div className="relative w-44 h-44 rounded-full glass-strong overflow-hidden ice-glow">
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

        {/* Typed intro lines */}
        <div className="mt-6 space-y-2.5 max-w-[340px] min-h-[96px] flex flex-col items-center text-center">
          {introLines.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`text-[14px] leading-relaxed ${
                i === 0 ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* CTA — appears after all lines */}
        {visibleLines >= introLines.length && !preparing && (
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            onClick={handleBegin}
            className="mt-9 w-full max-w-[320px] h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap ice-glow"
          >
            <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.2} />
            Let's Begin
            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </motion.button>
        )}

        {/* Preparing state — Sprint 2 pending */}
        {preparing && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-9 w-full max-w-[320px] glass-card p-6 flex flex-col items-center text-center"
          >
            <Loader2 className="w-7 h-7 text-primary animate-spin mb-4" />
            <p className="text-[14px] font-medium text-foreground">Preparing your campus experience…</p>
            <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
              The full UNIBUD operating system is being assembled. {PLATFORM_IDENTITY.product} Sprint 2 loads next.
            </p>
            <button onClick={handleSignOut} className="text-[12px] text-muted-foreground/70 hover:text-foreground font-medium mt-4 underline">
              Sign out
            </button>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="px-6 pb-8 safe-area-pb z-10"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}