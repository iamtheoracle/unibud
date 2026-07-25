import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, LogIn, Compass } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import BudCharacter from "@/components/brand/BudCharacter";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Welcome — Screen 2.
 * "Welcome to UNIBUD / Learn smarter. Stay organized. Achieve more."
 * Bud appears with a warm smile.
 */
export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/home", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* Ambient background */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[80%] h-[55%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.14), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[50%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.06), transparent 70%)" }}
        animate={{ x: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <SparkField count={16} />

      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="pt-6"
        >
          <BrandLogo size="sm" />
        </motion.div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Bud with a warm smile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
            className="flex justify-center mb-7"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 45%, rgba(127,216,255,0.30), transparent 65%)", filter: "blur(20px)" }}
              />
              <div className="relative w-32 h-32 rounded-full glass-strong overflow-hidden ice-glow">
                <BudCharacter animate={false} glow={false} className="w-full h-full" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
            className="font-heading font-bold text-[32px] leading-[1.1] tracking-tight text-foreground text-center"
          >
            Welcome to <span className="text-ice-gradient">UNIBUD</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
            className="mt-3 text-center"
          >
            <p className="text-[17px] text-foreground/90 font-medium leading-relaxed">Learn smarter.</p>
            <p className="text-[17px] text-foreground/90 font-medium leading-relaxed">Stay organized.</p>
            <p className="text-[17px] text-foreground/90 font-medium leading-relaxed">Achieve more.</p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7, ease: EASE }}
            className="mt-9 space-y-3"
          >
            <button
              onClick={() => navigate("/register")}
              className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2.5 font-heading font-semibold text-[15px] bg-primary text-primary-foreground spring-tap ice-glow"
            >
              Create Account <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2.5 font-heading font-semibold text-[15px] glass text-foreground spring-tap"
            >
              <LogIn className="w-[18px] h-[18px]" strokeWidth={2.2} /> Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full h-[48px] rounded-2xl flex items-center justify-center gap-2 font-heading font-medium text-[14px] text-primary spring-tap hover:opacity-80"
            >
              <Compass className="w-[16px] h-[16px]" strokeWidth={2} /> Explore UNIBUD
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="text-center text-[11px] text-muted-foreground/60 mt-6 leading-relaxed"
          >
            By continuing, you agree to UNIBUD's Terms of Service and Privacy Policy.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="pb-8 safe-area-pb"
        >
          <CompanyFooter />
        </motion.div>
      </div>
    </div>
  );
}