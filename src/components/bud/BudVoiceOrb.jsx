import React from "react";
import { motion } from "framer-motion";

/**
 * BudVoiceOrb — Bud as a living crystal intelligence.
 * A Deep Midnight Blue core wrapped in electric-blue ambient glow,
 * with specular reflections, crystal edge lighting, orbiting particles,
 * and distinct AI state animations.
 * States: idle | listening | thinking | speaking | searching | generating | planning | reasoning
 */
const GLOW = {
  idle: 0.5,
  listening: 0.85,
  thinking: 0.6,
  speaking: 0.95,
  searching: 0.75,
  generating: 0.8,
  planning: 0.65,
  reasoning: 0.7,
};
const WAVE = [0.1, 0.22, 0.14, 0.28, 0.12, 0.2, 0.16];
const PARTICLES = 5;

export default function BudVoiceOrb({ size = 96, state = "idle", className = "" }) {
  const g = GLOW[state] || GLOW.idle;
  const particleSize = size * 0.045;
  const ringSize = size * 1.12;
  const active = state !== "idle";
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* outer ambient glow — breathing */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: "radial-gradient(circle, hsl(221 83% 53% / 0.38), transparent 65%)" }}
        animate={{ scale: [1, 1.16, 1], opacity: [g * 0.5, g, g * 0.5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* searching — rotating scan ring */}
      {state === "searching" && (
        <div
          className="absolute rounded-full border-2 border-transparent ai-searching"
          style={{
            width: ringSize,
            height: ringSize,
            borderTopColor: "hsl(221 83% 53% / 0.6)",
            borderRightColor: "hsl(221 83% 53% / 0.2)",
          }}
        />
      )}

      {/* reasoning — dual counter-rotating rings */}
      {state === "reasoning" && (
        <>
          <div
            className="absolute rounded-full border border-primary/30 ai-searching"
            style={{ width: ringSize, height: ringSize, animationDuration: "3s" }}
          />
          <div
            className="absolute rounded-full border border-primary/20 ai-searching"
            style={{ width: size * 1.24, height: size * 1.24, animationDuration: "4.5s", animationDirection: "reverse" }}
          />
        </>
      )}

      {/* orbiting particles — subtle spark life (idle + planning) */}
      {(state === "idle" || state === "planning") &&
        Array.from({ length: PARTICLES }).map((_, i) => {
          const angle = (i / PARTICLES) * Math.PI * 2;
          const radius = size * 0.42;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: particleSize,
                height: particleSize,
                background: "radial-gradient(circle, rgba(96,165,250,0.9), transparent 70%)",
                left: "50%",
                top: "50%",
                marginLeft: -particleSize / 2,
                marginTop: -particleSize / 2,
              }}
              animate={{
                x: state === "planning" ? [px, px * 0.5, px] : [px, px * 0.7, px],
                y: state === "planning" ? [py, py * 0.5, py] : [py, py * 0.7, py],
                opacity: [0, 0.7, 0],
                scale: [0.6, 1, 0.6],
              }}
              transition={{
                duration: state === "planning" ? 2.4 + i * 0.2 : 3.6 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * (state === "planning" ? 0.2 : 0.5),
              }}
            />
          );
        })}

      {/* white halo — crystal sheen */}
      <div className="absolute rounded-full" style={{ inset: size * 0.06, background: "radial-gradient(circle at 42% 32%, rgba(255,255,255,0.50), transparent 60%)" }} />

      {/* midnight core — living crystal */}
      <motion.div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: size * 0.2,
          background: "radial-gradient(circle at 38% 30%, hsl(222 75% 34%), hsl(222 82% 14%))",
          boxShadow:
            "inset 0 2px 12px rgba(255,255,255,0.40), inset 0 -6px 20px rgba(0,0,0,0.50), inset 0 0 24px rgba(37,99,235,0.18), 0 8px 36px rgba(11,31,77,0.40)",
        }}
        animate={
          state === "speaking"
            ? { scale: [1, 1.06, 0.97, 1.04, 1] }
            : state === "thinking"
            ? { scale: [1, 0.96, 1.02, 1] }
            : state === "generating"
            ? { scale: [1, 1.03, 0.99, 1.03, 1] }
            : { scale: [1, 1.035, 1] }
        }
        transition={{ duration: state === "speaking" ? 0.55 : state === "thinking" ? 2.6 : state === "generating" ? 1.2 : 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* generating — shimmer sweep inside core */}
        {state === "generating" && (
          <div
            className="absolute inset-0 ai-generating rounded-full"
            style={{ mixBlendMode: "screen" }}
          />
        )}
      </motion.div>

      {/* specular highlight — crystal reflection */}
      <div className="absolute rounded-full" style={{ inset: size * 0.24, background: "radial-gradient(circle at 34% 26%, rgba(255,255,255,0.72), transparent 44%)" }} />
      {/* bottom rim light — edge lighting for depth */}
      <div className="absolute rounded-full" style={{ inset: size * 0.2, boxShadow: "inset 0 -2px 8px rgba(96,165,250,0.15)" }} />

      {/* waveform — listening + speaking */}
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