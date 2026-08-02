import React from "react";
import { motion } from "framer-motion";

const ORB_STATES = {
  idle: {
    scale: [1, 1.04, 1],
    opacity: [0.7, 0.9, 0.7],
    glow: "hsl(0 0% 100% / 0.12)",
    duration: 4,
  },
  listening: {
    scale: [1, 1.15, 1],
    opacity: [0.8, 1, 0.8],
    glow: "hsl(217 91% 60% / 0.25)",
    duration: 1.2,
  },
  thinking: {
    scale: [1, 1.08, 0.96, 1],
    opacity: [0.6, 0.9, 0.6],
    glow: "hsl(280 65% 60% / 0.20)",
    duration: 2.5,
  },
  searching: {
    scale: [1, 1.12, 1],
    opacity: [0.7, 1, 0.7],
    glow: "hsl(200 80% 55% / 0.22)",
    duration: 1.5,
  },
  reading: {
    scale: [1, 1.03, 1],
    opacity: [0.8, 0.95, 0.8],
    glow: "hsl(46 74% 55% / 0.15)",
    duration: 3,
  },
  generating: {
    scale: [1, 1.1, 0.98, 1.1, 1],
    opacity: [0.6, 1, 0.6, 1, 0.6],
    glow: "hsl(251 90% 67% / 0.25)",
    duration: 1.8,
  },
  speaking: {
    scale: [1, 1.12, 0.95, 1.1, 1],
    opacity: [0.8, 1, 0.8, 1, 0.8],
    glow: "hsl(142 71% 45% / 0.22)",
    duration: 0.9,
  },
  learning: {
    scale: [1, 1.06, 1],
    opacity: [0.7, 0.95, 0.7],
    glow: "hsl(160 70% 45% / 0.18)",
    duration: 3.5,
  },
  celebrating: {
    scale: [1, 1.25, 0.9, 1.15, 1],
    opacity: [0.8, 1, 0.7, 1, 0.8],
    glow: "hsl(46 74% 55% / 0.30)",
    duration: 1.2,
  },
  warning: {
    scale: [1, 1.05, 0.97, 1.05, 1],
    opacity: [0.7, 0.9, 0.7],
    glow: "hsl(0 84% 60% / 0.20)",
    duration: 1.5,
  },
  success: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    glow: "hsl(142 71% 45% / 0.25)",
    duration: 2,
  },
};

/**
 * BudStateOrb — the living AI orb that reacts to 10 Bud states.
 *
 * Props:
 *  - state: "idle" | "listening" | "thinking" | "searching" | "reading" | "generating" | "speaking" | "learning" | "celebrating" | "warning" | "success"
 *  - size: number (px)
 *  - onClick: () => void
 *  - showPulse: boolean — show orbiting particles
 */
export default function BudStateOrb({ state = "idle", size = 56, onClick, showPulse = false }) {
  const config = ORB_STATES[state] || ORB_STATES.idle;
  const px = size;
  const innerSize = px * 0.6;
  const coreSize = px * 0.35;

  return (
    <motion.div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer"
      style={{ width: px, height: px }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Outer glow */}
      <motion.div
        animate={{ scale: config.scale, opacity: config.opacity }}
        transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: config.glow }}
      />

      {/* Ambient ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute rounded-full"
        style={{
          width: px * 0.85,
          height: px * 0.85,
          background: `conic-gradient(from 0deg, transparent, ${config.glow}, transparent, ${config.glow}, transparent)`,
          mask: "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
          WebkitMask: "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
        }}
      />

      {/* Inner orb */}
      <motion.div
        animate={{ scale: config.scale, opacity: config.opacity }}
        transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          width: innerSize,
          height: innerSize,
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
          border: "1px solid hsl(var(--primary) / 0.20)",
          boxShadow: `0 0 ${px * 0.3}px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
        }}
      >
        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          className="absolute inset-y-0 w-1/2"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />

        {/* Core */}
        <motion.div
          animate={{
            scale: config.scale,
          }}
          transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-full"
          style={{
            width: coreSize,
            height: coreSize,
            background: "radial-gradient(circle at 35% 35%, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.2))",
          }}
        />
      </motion.div>

      {/* Orbiting particles for active states */}
      {showPulse && state !== "idle" && (
        <>
          {[0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3,
                height: 3,
                background: config.glow.replace(/[\d.]+\)$/, "0.8)"),
                top: "50%",
                left: "50%",
              }}
              animate={{
                rotate: angle,
                x: [0, Math.cos((angle * Math.PI) / 180) * px * 0.5],
                y: [0, Math.sin((angle * Math.PI) / 180) * px * 0.5],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

export { ORB_STATES };