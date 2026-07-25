import React from "react";
import { motion } from "framer-motion";

/**
 * BudVoiceOrb — Bud's living visual: a Deep Midnight Blue core wrapped in a
 * soft white glow that breathes. States: idle | listening | thinking | speaking.
 * No cartoon faces, no generic microphones — just a calm living orb.
 */
const GLOW = { idle: 0.5, listening: 0.85, thinking: 0.6, speaking: 0.95 };
const WAVE = [0.1, 0.22, 0.14, 0.28, 0.12, 0.2, 0.16];

export default function BudVoiceOrb({ size = 96, state = "idle", className = "" }) {
  const g = GLOW[state] || GLOW.idle;
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: "radial-gradient(circle, hsl(221 83% 53% / 0.40), transparent 65%)" }}
        animate={{ scale: [1, 1.14, 1], opacity: [g * 0.55, g, g * 0.55] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* white halo */}
      <div className="absolute rounded-full" style={{ inset: size * 0.06, background: "radial-gradient(circle at 42% 34%, rgba(255,255,255,0.55), transparent 62%)" }} />
      {/* midnight core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: size * 0.2,
          background: "radial-gradient(circle at 38% 32%, hsl(222 75% 32%), hsl(222 82% 15%))",
          boxShadow: "inset 0 2px 10px rgba(255,255,255,0.45), inset 0 -6px 18px rgba(0,0,0,0.45), 0 8px 32px rgba(11,31,77,0.35)",
        }}
        animate={
          state === "speaking"
            ? { scale: [1, 1.06, 0.97, 1.04, 1] }
            : state === "thinking"
            ? { scale: [1, 0.97, 1] }
            : { scale: [1, 1.035, 1] }
        }
        transition={{ duration: state === "speaking" ? 0.55 : 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* specular highlight */}
      <div className="absolute rounded-full" style={{ inset: size * 0.24, background: "radial-gradient(circle at 34% 27%, rgba(255,255,255,0.7), transparent 46%)" }} />
      {/* waveform */}
      {(state === "listening" || state === "speaking") && (
        <div className="absolute flex items-center justify-center gap-[3px]" style={{ inset: 0 }}>
          {WAVE.map((h, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-white/85"
              animate={{ height: [size * 0.08, size * h, size * 0.08] }}
              transition={{ duration: 0.55 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}