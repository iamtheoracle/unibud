import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import BudHead from "@/components/bud/BudHead";
import { Image } from "@/components/ui/image";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1];

const LOGO_URL =
  "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";

/** Time-of-day scene definitions — drives background, palette and particle colour. */
const SCENES = {
  morning: {
    label: "morning",
    // Warm sunrise gradient: deep amber base → golden sky → soft peach horizon
    bg: "linear-gradient(180deg, #1a0a00 0%, #3d1400 18%, #8b3a00 42%, #e06b00 62%, #ff9a3c 78%, #ffd0a0 92%, #ffe8cc 100%)",
    overlay: "linear-gradient(180deg, rgba(10,4,0,0.72) 0%, rgba(10,4,0,0.30) 45%, rgba(10,4,0,0.80) 100%)",
    orb1: "rgba(255,122,0,0.28)",
    orb2: "rgba(255,180,60,0.18)",
    particleColor: "#ffb347",
    sparkColor: "#FFA64D",
    budMood: "happy",
    budGreetings: ["Good morning.", "Ready to learn?", "Let's make today count.", "Rise and shine."],
    loadingMessages: [
      "Good morning! Preparing your campus…",
      "Syncing today's timetable…",
      "Checking your assignments…",
      "Loading your communities…",
      "Getting everything ready…",
    ],
  },
  afternoon: {
    label: "afternoon",
    // Bright blue sky → warm mid-day gold
    bg: "linear-gradient(180deg, #0a1628 0%, #0d2244 18%, #1a4a7a 42%, #2e6fa8 62%, #4a9cc8 75%, #87c4e8 90%, #c8e8f5 100%)",
    overlay: "linear-gradient(180deg, rgba(5,10,20,0.65) 0%, rgba(5,10,20,0.22) 48%, rgba(5,10,20,0.75) 100%)",
    orb1: "rgba(74,156,200,0.22)",
    orb2: "rgba(255,160,60,0.14)",
    particleColor: "#87c4e8",
    sparkColor: "#60B4D8",
    budMood: "idle",
    budGreetings: ["Welcome back.", "Let's keep going.", "Your campus awaits.", "Bud is ready."],
    loadingMessages: [
      "Connecting to your institution…",
      "Loading your communities…",
      "Preparing your dashboard…",
      "Restoring your session…",
      "Almost there…",
    ],
  },
  evening: {
    label: "evening",
    // Golden hour: deep warm dusk → violet horizon
    bg: "linear-gradient(180deg, #0d0808 0%, #1e0c05 20%, #4a1a00 42%, #8b3800 58%, #c45c00 70%, #e8820a 80%, #f4a340 90%, #f8c890 100%)",
    overlay: "linear-gradient(180deg, rgba(8,4,2,0.75) 0%, rgba(8,4,2,0.28) 48%, rgba(8,4,2,0.85) 100%)",
    orb1: "rgba(196,92,0,0.30)",
    orb2: "rgba(120,60,160,0.18)",
    particleColor: "#f4a340",
    sparkColor: "#E8820A",
    budMood: "idle",
    budGreetings: ["Good evening.", "Winding down?", "Still with you.", "Evening review time."],
    loadingMessages: [
      "Preparing your evening summary…",
      "Loading your study progress…",
      "Syncing your notes…",
      "Connecting to Bud…",
      "Almost ready…",
    ],
  },
  night: {
    label: "night",
    // Deep navy → violet AI glow → near-black
    bg: "linear-gradient(180deg, #020408 0%, #050d1a 25%, #091428 50%, #0d1a35 70%, #110e22 85%, #0d0812 100%)",
    overlay: "linear-gradient(180deg, rgba(2,4,8,0.55) 0%, rgba(2,4,8,0.15) 50%, rgba(2,4,8,0.70) 100%)",
    orb1: "rgba(80,40,160,0.32)",
    orb2: "rgba(40,80,200,0.20)",
    particleColor: "#a78bfa",
    sparkColor: "#7C3AED",
    budMood: "thinking",
    budGreetings: ["Still here with you.", "Late-night study?", "You've got this.", "Bud never sleeps."],
    loadingMessages: [
      "Preparing Bud for you…",
      "Loading your study session…",
      "Restoring where you left off…",
      "Syncing your timetable…",
      "Almost there…",
    ],
  },
};

/** Derive time-of-day from the current hour. */
function getScene() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return SCENES.morning;
  if (h >= 12 && h < 17) return SCENES.afternoon;
  if (h >= 17 && h < 21) return SCENES.evening;
  return SCENES.night;
}

/* ─────────────────────────────────────────────
   Stars — only rendered at night (and evening edge-cases)
───────────────────────────────────────────── */
function StarField({ count = 60 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 55,
        size: 1 + Math.random() * 2.2,
        duration: 2.5 + Math.random() * 4,
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.7,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="splash-star absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Floating ambient particles — all scenes
───────────────────────────────────────────── */
function AmbientParticles({ color, count = 14 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        size: 2 + Math.random() * 3,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 8,
        opacity: 0.35 + Math.random() * 0.5,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="splash-particle absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: 0,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 4}px ${color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Ambient glow orbs — background depth
───────────────────────────────────────────── */
function GlowOrbs({ orb1, orb2 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="splash-orb-pulse absolute rounded-full"
        style={{
          width: "60vmax",
          height: "60vmax",
          top: "-20vmax",
          left: "50%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse at center, ${orb1}, transparent 70%)`,
          animationDuration: "5s",
        }}
      />
      <div
        className="splash-orb-pulse absolute rounded-full"
        style={{
          width: "40vmax",
          height: "40vmax",
          bottom: "-10vmax",
          right: "-10vmax",
          background: `radial-gradient(ellipse at center, ${orb2}, transparent 70%)`,
          animationDuration: "7s",
          animationDelay: "1.5s",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Cycling loading message hook
───────────────────────────────────────────── */
function useLoadingMessages(messages, intervalMs = 1400) {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
      setKey((k) => k + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  return { message: messages[index], key };
}

/* ─────────────────────────────────────────────
   Main Splash component
───────────────────────────────────────────── */
export default function Splash() {
  const navigate = useNavigate();
  const scene = useMemo(getScene, []);
  const [leaving, setLeaving] = useState(false);
  const [authed, setAuthed] = useState(null); // null=pending, true/false
  const [budGreeting, setBudGreeting] = useState("");
  const activeRef = useRef(true);

  const { message: loadingMsg, key: msgKey } = useLoadingMessages(scene.loadingMessages, 1350);

  // Pick a random Bud greeting on mount
  useEffect(() => {
    const arr = scene.budGreetings;
    setBudGreeting(arr[Math.floor(Math.random() * arr.length)]);
  }, [scene]);

  // Auth check + timed exit
  useEffect(() => {
    activeRef.current = true;
    const run = async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        if (!activeRef.current) return;
        setAuthed(ok);
        // Show splash for at least 2.4s total; auth check may take <200ms so pad the rest
        await wait(2400);
        if (!activeRef.current) return;
        setLeaving(true);
        await wait(520);
        if (!activeRef.current) return;
        navigate(ok ? "/square" : "/welcome", { replace: true });
      } catch {
        if (!activeRef.current) return;
        setAuthed(false);
        await wait(2400);
        if (!activeRef.current) return;
        setLeaving(true);
        await wait(520);
        if (!activeRef.current) return;
        navigate("/welcome", { replace: true });
      }
    };
    run();
    return () => {
      activeRef.current = false;
    };
  }, [navigate]);

  const isNight = scene.label === "night";
  const isEvening = scene.label === "evening";

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden flex flex-col items-center justify-between"
      style={{ background: scene.bg }}
      role="status"
      aria-label="UNIBUD is loading"
      aria-live="polite"
    >
      {/* ── Overlay gradient for contrast ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: scene.overlay }}
      />

      {/* ── Ambient glow orbs ── */}
      <div className="absolute inset-0 z-[2]">
        <GlowOrbs orb1={scene.orb1} orb2={scene.orb2} />
      </div>

      {/* ── Stars — night & late evening ── */}
      {(isNight || isEvening) && (
        <div className="absolute inset-0 z-[3]">
          <StarField count={isNight ? 72 : 36} />
        </div>
      )}

      {/* ── Ambient floating particles ── */}
      <div className="absolute inset-0 z-[3]">
        <AmbientParticles color={scene.particleColor} count={isNight ? 18 : 12} />
      </div>

      {/* ── Spark field (reused from existing component, scene-coloured) ── */}
      <div className="absolute inset-0 z-[3]">
        <SparkField count={isNight ? 22 : 16} color={scene.sparkColor} />
      </div>

      {/* ──────────────────────────────────
          Main content — logo + Bud + message
      ────────────────────────────────── */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-8 text-center"
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.97 : 1, y: leaving ? -8 : 0 }}
        transition={{ duration: 0.52, ease: EASE }}
      >
        {/* UNIBUD Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: EASE }}
          className="w-full max-w-[320px] mx-auto mb-10 splash-logo-glow"
        >
          {/* Shimmer sweep over the logo */}
          <div className="relative">
            <Image
              src={LOGO_URL}
              alt="UNIBUD — The University Operating System"
              fittingType="fit"
              className="w-full h-auto select-none"
            />
            <div
              className="splash-shimmer absolute inset-0 rounded-xl pointer-events-none"
              aria-hidden
            />
          </div>
        </motion.div>

        {/* Bud introduction */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
          className="flex flex-col items-center gap-3"
          aria-label={`Bud says: ${budGreeting}`}
        >
          {/* Bud head — living, animated */}
          <div className="relative">
            {/* Ambient halo behind Bud */}
            <div
              className="splash-orb-pulse absolute inset-0 -m-4 rounded-full pointer-events-none"
              style={{
                background: isNight
                  ? "radial-gradient(ellipse at center, rgba(124,58,237,0.35), transparent 70%)"
                  : "radial-gradient(ellipse at center, rgba(255,122,0,0.25), transparent 70%)",
                animationDuration: "3.5s",
              }}
              aria-hidden
            />
            <BudHead
              size={72}
              mood={scene.budMood}
              glow
              active
              className="relative z-10"
            />
          </div>

          {/* Bud name + greeting */}
          <div className="flex flex-col items-center gap-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="text-[11px] font-bold tracking-[0.22em] uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Your AI Companion
            </motion.span>
            <AnimatePresence mode="wait">
              {budGreeting && (
                <motion.p
                  key={budGreeting}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: 1.0, duration: 0.5, ease: EASE }}
                  className="text-[18px] font-semibold text-white/90 tracking-tight"
                >
                  {budGreeting}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Loading message — cycles intelligently */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3 min-h-[44px]"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={msgKey}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="text-[13px] font-medium text-white/60 text-center max-w-[260px] leading-relaxed"
            >
              {loadingMsg}
            </motion.p>
          </AnimatePresence>

          {/* Premium progress indicator — three soft pulses */}
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="stream-dot w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="stream-dot w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="stream-dot w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="relative z-10 w-full safe-area-pb px-8 pb-8"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
