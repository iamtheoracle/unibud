import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import CompanyFooter from "@/components/foundation/CompanyFooter";

const EASE = [0.16, 1, 0.3, 1];
const CAMPUS_URL =
  "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/73b30d148_generated_image.png";

/**
 * Welcome — multi-tenant platform entry.
 * Atmospheric campus composition, brand header, and auth call-to-action.
 */
export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/home", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col bg-[#0a0d14]">
      {/* Campus backdrop */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={CAMPUS_URL}
          alt="Campus courtyard at golden hour"
          fittingType="fill"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Tonal overlays — midnight top → warm mid → dark bottom for legibility */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#0a0d14] via-[#0a0d14]/35 to-[#0a0d14]/85" />
      <div className="absolute inset-x-0 bottom-0 z-[1] pointer-events-none h-[45%] bg-gradient-to-t from-[#0a0d14] to-transparent" />

      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="pt-7 flex flex-col items-center text-center"
        >
          <Mountain className="w-9 h-9 text-white/95 mb-3" strokeWidth={1.6} />
          <h1 className="font-display font-bold tracking-[0.04em] text-[38px] leading-none text-white">
            UNIBUD
          </h1>
          <p className="mt-2 text-[11px] font-semibold tracking-[0.34em] text-white/55">
            — UNIVERSITY BUDDY —
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-px w-8 bg-white/45" />
            <p className="font-body text-[15px] text-white/95 italic">The Future Starts Together.</p>
            <span className="h-px w-8 bg-white/45" />
          </div>
        </motion.div>

        <div className="flex-1" />

        {/* ── Welcome copy + CTAs ── */}
        <div className="flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            className="font-display text-[30px] font-semibold text-white leading-tight"
          >
            Welcome to Unibud
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6, ease: EASE }}
            className="mt-2 text-[14px] text-white/80 font-body"
          >
            Empowering students to reach their fullest potential.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            className="mt-7 w-full space-y-4"
          >
            <button
              onClick={() => navigate("/onboarding/conversation")}
              className="w-full h-[54px] rounded-full flex items-center justify-center font-heading font-semibold text-[15px] tracking-wide text-primary-foreground spring-tap bg-primary ice-glow"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-[54px] rounded-full flex items-center justify-center font-heading font-semibold text-[15px] tracking-wide text-white spring-tap glass border border-white/20"
            >
              Log In
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95, duration: 0.6 }}
            className="text-[11px] text-white/55 mt-6 leading-relaxed"
          >
            By continuing, you agree to UNIBUD's Terms of Service and Privacy Policy.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.6 }}
          className="pb-7 safe-area-pb"
        >
          <CompanyFooter />
        </motion.div>
      </div>
    </div>
  );
}