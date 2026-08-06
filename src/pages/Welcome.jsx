import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

const BG_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/73b30d148_generated_image.png";
const LOGO_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";

/**
 * Welcome — the official UNIBUD first-run experience.
 * Three sections: Logo + Tagline → Cinematic Illustration → Welcome Text + Actions.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [showWhiteFade, setShowWhiteFade] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/square", { replace: true });
    });
    const t = setTimeout(() => setShowWhiteFade(false), 50);
    return () => clearTimeout(t);
  }, [navigate]);

  const d = reduceMotion
    ? { white: 0, logo: 0.1, tag: 0.3, art: 0.2, heading: 0.4, sub: 0.5, signup: 0.6, login: 0.7 }
    : { white: 0, logo: 0.4, tag: 0.8, art: 0.2, heading: 1.4, sub: 1.6, signup: 1.9, login: 2.1 };

  return (
    <div
      className="fixed inset-0 w-full overflow-hidden flex flex-col items-center justify-between bg-black"
      role="main"
      aria-label="UNIBUD welcome screen"
    >
      {/* ── Cinematic background illustration ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.06 }}
        animate={{ opacity: 1, scale: reduceMotion ? 1 : 1 }}
        transition={{ opacity: { duration: 1.8, ease: EASE, delay: d.art }, scale: { duration: reduceMotion ? 0 : 24, ease: "easeInOut", repeat: reduceMotion ? 0 : Infinity, repeatType: "reverse" } }}
      >
        <Image src={BG_URL} alt="Students facing the mountain — the journey ahead" fittingType="fill" focalPointX={0.5} focalPointY={0.45} className="w-full h-full" />
      </motion.div>

      {/* ── Gradient overlays for legibility ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.55) 18%, rgba(0,0,0,0.15) 42%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.75) 80%, #000 100%)" }} />

      {/* ── Ambient light — sunburst glow behind the mountains ── */}
      <motion.div
        className="absolute inset-0 z-[2] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: EASE, delay: d.art + 0.3 }}
        style={{ background: "radial-gradient(55% 30% at 50% 40%, rgba(255,220,150,0.10), transparent 65%)" }}
      />

      {/* ── White fade-in overlay ── */}
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

      {/* ════ Header: Logo + Tagline ════ */}
      <motion.div
        className="relative z-10 flex flex-col items-center pt-[7vh] px-6 w-full"
        initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: EASE, delay: d.logo }}
      >
        <div className="w-[120px] sm:w-[130px] md:w-[140px]">
          <Image src={LOGO_URL} alt="UNIBUD — University Buddy" fittingType="fit" className="w-full h-auto" />
        </div>

        {/* Tagline with horizontal lines */}
        <motion.div
          className="flex items-center gap-3 w-full max-w-[280px] mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: d.tag }}
        >
          <div className="flex-1 h-px bg-white/25" />
          <span className="text-white text-[11px] font-medium tracking-wide whitespace-nowrap">The Future Starts Together.</span>
          <div className="flex-1 h-px bg-white/25" />
        </motion.div>
      </motion.div>

      {/* ════ Center spacer (illustration shows through) ════ */}
      <div className="flex-1" />

      {/* ════ Footer: Welcome text + Action buttons ════ */}
      <div className="relative z-10 w-full max-w-[340px] md:max-w-[360px] px-6 pb-[max(3vh,env(safe-area-inset-bottom))] flex flex-col items-center">
        {/* Welcome heading */}
        <motion.h1
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: d.heading }}
          className="font-serif text-[26px] sm:text-[28px] text-white text-center tracking-tight"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Welcome to Unibud
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: d.sub }}
          className="text-white/65 text-[13px] sm:text-[14px] text-center mt-1.5 mb-7 leading-relaxed"
        >
          Empowering students to reach their fullest potential.
        </motion.p>

        {/* Sign Up — dark blue gradient with inner glow */}
        <motion.button
          onClick={() => navigate("/register")}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.4, ease: EASE, delay: d.signup } : { type: "spring", stiffness: 400, damping: 30, delay: d.signup }}
          className="relative w-full h-[52px] rounded-full font-semibold text-[15px] text-white spring-tap overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{ background: "linear-gradient(135deg, #FF7A00 0%, #4A2C1D 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 20px rgba(255,122,0,0.30)" }}
          aria-label="Sign up for UNIBUD"
        >
          <span className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent rounded-full" />
          Sign Up
        </motion.button>

        {/* Log In — transparent outline */}
        <motion.button
          onClick={() => navigate("/login")}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.4, ease: EASE, delay: d.login } : { type: "spring", stiffness: 380, damping: 30, delay: d.login }}
          className="relative w-full h-[52px] rounded-full font-semibold text-[15px] text-white spring-tap mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.35)" }}
          aria-label="Log in to UNIBUD"
        >
          Log In
        </motion.button>
      </div>
    </div>
  );
}