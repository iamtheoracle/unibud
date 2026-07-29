import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import CompanyFooter from "@/components/foundation/CompanyFooter";

const EASE = [0.16, 1, 0.3, 1];

const FLOATERS = [
  { emoji: "🤖", pos: "top-[-10px] left-[10px]", delay: 0 },
  { emoji: "📚", pos: "top-[-5px] right-[5px]", delay: 0.8 },
  { emoji: "🌍", pos: "bottom-[10px] left-[-5px]", delay: 1.6 },
  { emoji: "💡", pos: "bottom-[5px] right-[0]", delay: 2.4 },
];

/**
 * Welcome — platform entry. Centered hero orb with floating intelligence
 * icons, gradient wordmark, and auth call-to-action. Authenticated users are
 * routed straight to Home.
 */
export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/home", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center bg-background safe-area-pt">
      {/* Ambient bloom */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(60% 50% at 50% 38%, hsl(var(--primary) / 0.06), transparent 65%)" }} />

      <div className="relative z-10 w-full max-w-[320px] flex flex-col items-center text-center px-4">
        {/* Hero orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center mb-8"
          style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.03))", border: "1px solid hsl(var(--primary) / 0.08)" }}
        >
          <div className="absolute inset-[-20px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle at 60% 40%, hsl(var(--primary) / 0.04), transparent 70%)" }} />
          <span className="text-[60px] depth-float">🎓</span>
          {FLOATERS.map((f) => (
            <motion.span
              key={f.emoji}
              className={`absolute text-[24px] ${f.pos}`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: f.delay }}
            >
              {f.emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
          className="font-display text-[32px] font-extrabold tracking-[-0.5px] leading-tight text-foreground"
        >
          Welcome to <span className="text-ice-gradient">UNIBUD OS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.6, ease: EASE }}
          className="mt-2 text-[15px] text-muted-foreground font-body max-w-[280px] leading-[1.5]"
        >
          Your university. Connected in one intelligent operating system.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.7, ease: EASE }}
          className="mt-6 w-full max-w-[280px] flex flex-col items-center"
        >
          <button
            onClick={() => navigate("/onboarding/conversation")}
            className="w-full h-[54px] rounded-full bg-primary text-primary-foreground font-heading font-bold text-[16px] spring-tap ice-glow"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="mt-3 bg-transparent border-none text-muted-foreground/60 text-[14px] font-medium spring-tap"
          >
            I already have an account
          </button>
        </motion.div>

        {/* Page dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex gap-[6px] mt-4"
        >
          <span className="h-2 w-6 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-foreground/10" />
          <span className="h-2 w-2 rounded-full bg-foreground/10" />
          <span className="h-2 w-2 rounded-full bg-foreground/10" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-0 inset-x-0 pb-6 safe-area-pb"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}