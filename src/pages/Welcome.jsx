import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, LogIn, Compass } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import LiquidGlass from "@/components/foundation/LiquidGlass";

const EASE = [0.16, 1, 0.3, 1];

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/meet-bud", { replace: true });
    });
  }, [navigate]);

  const actions = [
    { label: "Create Account", icon: ArrowRight, path: "/register", primary: true },
    { label: "Login", icon: LogIn, path: "/login", primary: false },
    { label: "Explore UNIBUD", icon: Compass, path: "/register", primary: false },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[80%] h-[55%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.12), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[50%] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)" }}
        animate={{ x: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <SparkField count={14} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="pt-14 px-6 safe-area-pt z-10"
      >
        <BrandLogo size="md" />
      </motion.div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-6 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="font-heading font-bold text-[34px] leading-[1.1] tracking-tight text-foreground"
        >
          Welcome to <span className="text-ice-gradient">UNIBUD</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          className="text-[16px] text-muted-foreground font-medium mt-3 max-w-[300px] leading-relaxed"
        >
          Learn smarter. Grow faster. Achieve more.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[13px] text-muted-foreground/70 mt-2 max-w-[300px] leading-relaxed"
        >
          Your intelligent academic companion — from your first day to graduation and beyond.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7, ease: EASE }}
          className="mt-10 space-y-3"
        >
          {actions.map((a, i) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`w-full h-[54px] rounded-2xl flex items-center justify-center gap-2.5 font-heading font-semibold text-[15px] spring-tap ${
                a.primary
                  ? "bg-primary text-primary-foreground ice-glow"
                  : "glass text-foreground"
              }`}
            >
              <a.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
              {a.label}
            </button>
          ))}
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
        className="px-6 pb-8 safe-area-pb z-10"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}