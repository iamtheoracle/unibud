import React from "react";
import { motion } from "framer-motion";
import { useAdaptiveTheme } from "@/lib/theme/AdaptiveThemeContext";

/**
 * AmbientBackground — dynamic ambient lighting that adapts to context.
 * Renders floating gradient orbs that subtly tint the background.
 *
 * Props:
 *  - variant: "default" | "calm" | "energetic" | "focus"
 *  - orbs: number — how many ambient orbs to render
 */
export default function AmbientBackground({ variant = "default", orbs = 3 }) {
  const { theme } = useAdaptiveTheme();

  const orbConfigs = [
    { size: 300, top: "-10%", left: "60%", duration: 18, delay: 0 },
    { size: 240, top: "60%", left: "-5%", duration: 22, delay: 2 },
    { size: 200, top: "30%", left: "80%", duration: 16, delay: 4 },
    { size: 180, top: "70%", left: "50%", duration: 20, delay: 1 },
    { size: 160, top: "10%", left: "20%", duration: 24, delay: 3 },
  ];

  const intensity = variant === "energetic" ? 0.12 : variant === "calm" ? 0.04 : variant === "focus" ? 0.06 : 0.08;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 70% at 50% -12%, ${theme.glow}, transparent 55%)`,
        }}
      />

      {/* Ambient orbs */}
      {orbConfigs.slice(0, orbs).map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, hsl(${theme.primary} / ${intensity}), transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.4, 0.7, 0.3, 0.4],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}