import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/foundation/BrandLogo";
import BudCharacter from "@/components/brand/BudCharacter";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { PLATFORM_IDENTITY } from "@/lib/companyIdentity";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Splash — Screen 1.
 * Official UNIBUD logo with Bud standing beside it, spark particles
 * flowing around Bud, "The Future Starts Together" tagline.
 */
export default function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;
    const resolve = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        await wait(2600);
        if (!active) return;
        setLeaving(true);
        await wait(450);
        if (!active) return;
        navigate(authed ? "/home" : "/welcome", { replace: true });
      } catch {
        await wait(2600);
        if (!active) return;
        navigate("/welcome", { replace: true });
      }
    };
    resolve();
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient orbs */}
      <motion.div
        className="absolute top-[-20%] left-[8%] w-[70%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.12), transparent 70%)" }}
        animate={{ x: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[45%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(127,216,255,0.06), transparent 70%)" }}
        animate={{ x: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <SparkField count={24} />

      <motion.div
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.96 : 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative z-10 flex flex-col items-center px-8 text-center w-full max-w-[420px]"
      >
        {/* Logo + Bud beside each other */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center justify-center gap-4"
        >
          <BrandLogo size="lg" showWord={false} />

          {/* Bud — standing beside the logo, gently waving */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
            className="relative"
          >
            <div
              className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 45%, rgba(127,216,255,0.32), transparent 65%)", filter: "blur(18px)" }}
            />
            <div className="relative w-24 h-24 rounded-full glass-strong overflow-hidden ice-glow bud-wave">
              <BudCharacter animate={false} glow={false} className="w-full h-full" />
            </div>
          </motion.div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
          className="font-heading font-bold text-[34px] tracking-tight text-foreground mt-9"
        >
          UNIBUD
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
          className="font-heading text-[17px] font-medium text-foreground/90 mt-2.5 max-w-[300px]"
        >
          The Future Starts Together.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.5 }}
          className="text-[11px] text-muted-foreground font-medium tracking-widest uppercase mt-2"
        >
          {PLATFORM_IDENTITY.product} · {PLATFORM_IDENTITY.core}
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
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 safe-area-pb px-8 pb-8 z-10"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));