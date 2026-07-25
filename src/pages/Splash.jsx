import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/foundation/BrandLogo";
import BudCharacter from "@/components/brand/BudCharacter";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { PLATFORM_IDENTITY, COMPANY_IDENTITY } from "@/lib/companyIdentity";

/**
 * Splash — the first impression of UNIBUD.
 * Mountain mark · Bud · spark particles · "The Future Starts Together."
 * Auto-resolves to the right next screen.
 */
export default function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;
    const resolve = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!active) return;
        await new Promise((r) => setTimeout(r, 2600));
        if (!active) return;
        setLeaving(true);
        await new Promise((r) => setTimeout(r, 450));
        if (!active) return;
        navigate(authed ? "/meet-bud" : "/welcome", { replace: true });
      } catch {
        if (!active) return;
        await new Promise((r) => setTimeout(r, 2600));
        if (!active) return;
        navigate("/welcome", { replace: true });
      }
    };
    resolve();
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        className="absolute top-[-20%] left-[10%] w-[70%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.10), transparent 70%)" }}
        animate={{ x: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[45%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)" }}
        animate={{ x: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <SparkField count={22} />

      <motion.div
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.96 : 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center px-8 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <BrandLogo size="lg" showWord={false} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-bold text-[32px] tracking-tight text-foreground mt-7"
        >
          UNIBUD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-[13px] text-muted-foreground font-medium tracking-widest uppercase mt-1"
        >
          {PLATFORM_IDENTITY.product} · {PLATFORM_IDENTITY.core}
        </motion.p>

        {/* Bud character in Liquid Glass vessel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10"
        >
          <div className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 45%, rgba(127,216,255,0.28), transparent 65%)", filter: "blur(20px)" }} />
          <div className="relative w-36 h-36 rounded-full glass-strong overflow-hidden ice-glow">
            <BudCharacter animate={false} glow={false} className="w-full h-full" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-[19px] font-medium text-foreground/95 mt-8 max-w-[280px]"
        >
          The Future Starts Together.
        </motion.p>

        {/* Loading line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-9 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 safe-area-pb px-8 pb-8 z-10"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}