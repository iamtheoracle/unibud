import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];
const SPRING = { type: "spring", stiffness: 400, damping: 32, mass: 0.8 };

const BG_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/73b30d148_generated_image.png";
const LOGO_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";

/**
 * Welcome — the official UNIBUD first-run experience.
 *
 * Cinematic sequence:
 *   1. Fade in from white
 *   2. Mountain artwork slowly reveals with subtle cinematic movement
 *   3. Soft ambient light rises behind the mountains
 *   4. UNIBUD logo gently fades into place
 *   5. Tagline appears with a smooth fade
 *   6. Sign Up button springs upward
 *   7. Log In button appears
 *
 * Uses the UNIBUD Ambient Lighting System — no heavy shadows.
 * Fully adaptive across phones, tablets, foldables, laptops, and desktops.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [showWhiteFade, setShowWhiteFade] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/home", { replace: true });
    });
    const t = setTimeout(() => setShowWhiteFade(false), 50);
    return () => clearTimeout(t);
  }, [navigate]);

  // Animation delays — reduced motion skips movement, keeps gentle fades
  const d = reduceMotion
    ? { white: 0, art: 0, light: 0, logo: 0.1, tag: 0.3, signup: 0.5, login: 0.6 }
    : { white: 0, art: 0.2, light: 0.6, logo: 1.0, tag: 1.4, signup: 1.7, login: 1.9 };

  return (
    <div
      className="fixed inset-0 w-full overflow-hidden flex flex-col items-center justify-between bg-[#0B0B0B] adaptive-safe"
      role="main"
      aria-label="UNIBUD welcome screen"
    >
      {/* ── 1. Mountain artwork — slowly reveals with cinematic movement ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
        animate={{ opacity: 1, scale: reduceMotion ? 1 : 1 }}
        transition={{ opacity: { duration: 1.5, ease: EASE, delay: d.art }, scale: { duration: reduceMotion ? 0 : 20, ease: "easeInOut", repeat: reduceMotion ? 0 : Infinity, repeatType: "reverse" } }}
      >
        <Image
          src={BG_URL}
          alt="Students facing the mountain — the journey from admission to graduation"
          fittingType="fill"
          focalPointX={0.5}
          focalPointY={0.4}
          className="w-full h-full"
        />
      </motion.div>

      {/* ── Gradient overlay for text legibility ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(11,11,11,0.55) 0%, rgba(11,11,11,0.20) 30%, rgba(11,11,11,0.55) 62%, rgba(11,11,11,0.95) 100%)" }}
      />

      {/* ── 2. Ambient light — soft white glow rising behind the mountains ── */}
      <motion.div
        className="absolute inset-0 z-[2] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: d.light }}
        style={{
          background: `
            radial-gradient(70% 45% at 50% 42%, rgba(255,255,255,0.10), transparent 65%),
            radial-gradient(60% 30% at 50% 55%, rgba(255,180,100,0.06), transparent 60%),
            radial-gradient(80% 25% at 50% 100%, rgba(255,122,0,0.08), transparent 55%),
            radial-gradient(50% 20% at 50% 100%, rgba(74,44,29,0.10), transparent 60%)
          `,
        }}
      />

      {/* ── Sky reflection — gentle sky-tinted light catch on glass ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(135,180,230,0.04) 0%, transparent 30%, transparent 70%, rgba(135,180,230,0.02) 100%)",
        }}
      />

      {/* ── 3. White fade-in overlay (fades out to reveal artwork) ── */}
      <AnimatePresence>
        {showWhiteFade && (
          <motion.div
            className="absolute inset-0 z-[20] bg-white pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: d.white }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ── 4. UNIBUD logo — gently fades into place ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center pt-[12vh] px-6 w-full"
        initial={{ opacity: 0, scale: 0.94, filter: reduceMotion ? "none" : "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.0, ease: EASE, delay: d.logo }}
      >
        <div className="w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px]">
          <Image src={LOGO_URL} alt="UNIBUD — The University Operating System" fittingType="fit" className="w-full h-auto" />
        </div>
      </motion.div>

      {/* ── 5. Tagline + welcome message ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 text-center w-full max-w-[380px] md:max-w-[420px] lg:max-w-[460px]"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: d.tag }}
      >
        <h1 className="font-heading font-bold text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] leading-tight text-white tracking-tight adaptive-type">
          The Future Starts Together.
        </h1>
        <p className="mt-2.5 text-[14px] sm:text-[15px] md:text-[16px] text-white/65 font-body leading-relaxed max-w-[320px] md:max-w-[360px]">
          Your journey from admission to graduation, guided by Bud — your intelligent campus companion.
        </p>
      </motion.div>

      {/* ── 6 & 7. Sign Up + Log In buttons ── */}
      <motion.div
        className="relative z-10 w-full max-w-[340px] md:max-w-[380px] px-6 pb-[max(2vh,env(safe-area-inset-bottom))] flex flex-col gap-3"
      >
        {/* Sign Up — primary: deep black surface, orange accent, glass, ambient under-light */}
        <motion.button
          onClick={() => navigate("/register")}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.4, ease: EASE, delay: d.signup } : { ...SPRING, delay: d.signup }}
          className="relative w-full h-[54px] rounded-2xl font-heading font-bold text-[16px] text-white spring-tap overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            background: "linear-gradient(135deg, #1A1A1A 0%, #0B0B0B 50%, #1A1208 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          aria-label="Sign up for UNIBUD"
        >
          {/* Orange accent edge light */}
          <span className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {/* Soft ambient under-light */}
          <span className="absolute -bottom-8 left-[10%] right-[10%] h-16 rounded-full bg-primary/15 blur-2xl" />
          {/* Glass reflection */}
          <span className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
          <span className="relative flex items-center justify-center gap-2">
            Sign Up
            <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
          </span>
        </motion.button>

        {/* Log In — secondary: white glass outline, thin border, frosted glass */}
        <motion.button
          onClick={() => navigate("/login")}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.4, ease: EASE, delay: d.login } : { ...SPRING, delay: d.login, stiffness: 380 }}
          className="relative w-full h-[54px] rounded-2xl font-heading font-bold text-[16px] text-white spring-tap overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          }}
          aria-label="Log in to UNIBUD"
        >
          {/* Edge highlight */}
          <span className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="relative flex items-center justify-center">
            Log In
          </span>
        </motion.button>
      </motion.div>

      {/* ── Accessibility: skip to content (keyboard nav) ── */}
      <a
        href="#welcome-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-30 focus:px-4 focus:py-2 focus:rounded-full focus:bg-white focus:text-black focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
    </div>
  );
}