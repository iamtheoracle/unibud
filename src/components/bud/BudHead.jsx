import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Mood configurations — each mood drives Bud's eye shape, mouth curve,
 * pupil direction, head tilt, and optional bounce.
 */
const MOOD_CONFIGS = {
  idle: {
    mouthD: "M 38 62 Q 50 70 62 62",
    pupilOffset: { x: 0, y: 0 },
    headTilt: 0,
    eyeArc: false,
    bounce: false,
  },
  thinking: {
    mouthD: "M 42 65 L 58 65",
    pupilOffset: { x: 3, y: -4 },
    headTilt: -5,
    eyeArc: false,
    bounce: false,
  },
  happy: {
    mouthD: "M 36 60 Q 50 74 64 60",
    pupilOffset: { x: 0, y: 0 },
    headTilt: 0,
    eyeArc: true,
    bounce: false,
  },
  concerned: {
    mouthD: "M 40 66 Q 50 60 60 66",
    pupilOffset: { x: 0, y: 2 },
    headTilt: 4,
    eyeArc: false,
    bounce: false,
  },
  celebrating: {
    mouthD: "M 34 58 Q 50 78 66 58",
    pupilOffset: { x: 0, y: 0 },
    headTilt: 0,
    eyeArc: true,
    bounce: true,
  },
  listening: {
    mouthD: "M 38 62 Q 50 68 62 62",
    pupilOffset: { x: 0, y: 0 },
    headTilt: 3,
    eyeArc: false,
    bounce: false,
  },
  lookingRight: {
    mouthD: "M 38 62 Q 50 70 62 62",
    pupilOffset: { x: 4, y: 0 },
    headTilt: 0,
    eyeArc: false,
    bounce: false,
  },
  lookingLeft: {
    mouthD: "M 38 62 Q 50 70 62 62",
    pupilOffset: { x: -4, y: 0 },
    headTilt: 0,
    eyeArc: false,
    bounce: false,
  },
};

/**
 * BudHead — Bud's living, animated face.
 *
 * Renders a minimalist SVG face with:
 *  • Random blinking (every 2.5–5.5s)
 *  • Subtle pupil drift (every 2–4s)
 *  • Gentle breathing (4.5s scale cycle)
 *  • Mood-driven expressions (eyes, mouth, tilt)
 *  • Optional active glow ring
 *
 * Moods: idle | thinking | happy | concerned | celebrating | listening | lookingRight | lookingLeft
 *
 * @param {number}  size   — pixel diameter of the head
 * @param {string}  mood   — current expression mood
 * @param {boolean} active — show the soft glow ring
 * @param {boolean} glow   — enable glow effects
 */
export default function BudHead({
  size = 44,
  mood = "idle",
  active = false,
  glow = true,
  className = "",
}) {
  const config = MOOD_CONFIGS[mood] || MOOD_CONFIGS.idle;
  const [blink, setBlink] = useState(false);
  const [pupilDrift, setPupilDrift] = useState({ x: 0, y: 0 });

  // Random blinking
  useEffect(() => {
    let timer;
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  // Subtle pupil drift — natural eye movement
  useEffect(() => {
    let timer;
    const scheduleDrift = () => {
      const delay = 2000 + Math.random() * 2000;
      timer = setTimeout(() => {
        setPupilDrift({
          x: (Math.random() - 0.5) * 2.5,
          y: (Math.random() - 0.5) * 1.5,
        });
        scheduleDrift();
      }, delay);
    };
    scheduleDrift();
    return () => clearTimeout(timer);
  }, []);

  const pupilX = pupilDrift.x + config.pupilOffset.x;
  const pupilY = pupilDrift.y + config.pupilOffset.y;
  const gradId = useMemo(() => `bud-head-${size}`, [size]);

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={{
        rotate: config.headTilt,
        y: config.bounce ? [0, -3, 0] : 0,
      }}
      transition={{
        rotate: { duration: 0.6, ease: EASE },
        y: config.bounce
          ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 },
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id={gradId} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.82)" />
          </radialGradient>
        </defs>

        {/* Active glow ring — soft pulsing halo when selected */}
        {active && glow && (
          <motion.circle
            cx="50" cy="50" r="47"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.4, 0.15], r: [46, 48, 46] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Head — gentle breathing */}
        <motion.circle
          cx="50" cy="50" r="40"
          fill={`url(#${gradId})`}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 50%" }}
        />

        {/* Left eye — arc (happy) or ellipse (neutral) */}
        {config.eyeArc ? (
          <motion.path
            d="M 31 44 Q 38 37 45 44"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <motion.ellipse
            cx="38" cy="44"
            rx="5"
            animate={{ ry: blink ? 0.8 : 7 }}
            transition={{ duration: blink ? 0.08 : 0.15, ease: EASE }}
            fill="hsl(var(--primary-foreground))"
          />
        )}

        {/* Right eye */}
        {config.eyeArc ? (
          <motion.path
            d="M 55 44 Q 62 37 69 44"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <motion.ellipse
            cx="62" cy="44"
            rx="5"
            animate={{ ry: blink ? 0.8 : 7 }}
            transition={{ duration: blink ? 0.08 : 0.15, ease: EASE }}
            fill="hsl(var(--primary-foreground))"
          />
        )}

        {/* Pupils — only when eyes are open and circular */}
        {!blink && !config.eyeArc && (
          <>
            <motion.circle
              r="2.2"
              fill="hsl(var(--primary))"
              animate={{ cx: 38 + pupilX, cy: 44 + pupilY }}
              transition={{ duration: 0.5, ease: EASE }}
            />
            <motion.circle
              r="2.2"
              fill="hsl(var(--primary))"
              animate={{ cx: 62 + pupilX, cy: 44 + pupilY }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </>
        )}

        {/* Mouth */}
        <motion.path
          key={config.mouthD}
          d={config.mouthD}
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Cheek blush for happy / celebrating */}
        {(mood === "happy" || mood === "celebrating") && (
          <>
            <circle cx="26" cy="58" r="4" fill="hsl(var(--primary-foreground) / 0.12)" />
            <circle cx="74" cy="58" r="4" fill="hsl(var(--primary-foreground) / 0.12)" />
          </>
        )}
      </svg>
    </motion.div>
  );
}