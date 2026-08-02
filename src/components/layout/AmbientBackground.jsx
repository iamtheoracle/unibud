import React from "react";
import { motion } from "framer-motion";

/**
 * AmbientBackground — the signature atmosphere behind every screen.
 * Large blurred gradient orbs in brand colors that slowly drift,
 * giving UNIBUD a living, three-dimensional depth. Never flat.
 * Respects prefers-reduced-motion (static orbs).
 */
export default function AmbientBackground() {
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const orbs = [
    {
      className: "absolute -top-40 -left-32 w-[460px] h-[460px] ambient-orb",
      style: { background: "radial-gradient(circle, hsl(var(--primary) / 0.10), transparent 70%)" },
      animate: { x: [0, 36, 0], y: [0, 24, 0], opacity: [0.25, 0.38, 0.25] },
      transition: { duration: 20, repeat: Infinity, ease: "easeInOut" },
    },
    {
      className: "absolute top-1/4 -right-40 w-[520px] h-[520px] ambient-orb",
      style: { background: "radial-gradient(circle, hsl(var(--accent) / 0.08), transparent 70%)" },
      animate: { x: [0, -30, 0], y: [0, 34, 0], opacity: [0.18, 0.28, 0.18] },
      transition: { duration: 24, repeat: Infinity, ease: "easeInOut" },
    },
    {
      className: "absolute -bottom-32 left-1/4 w-[400px] h-[400px] ambient-orb",
      style: { background: "radial-gradient(circle, hsl(var(--information) / 0.06), transparent 70%)" },
      animate: { x: [0, 44, 0], y: [0, -22, 0], opacity: [0.15, 0.24, 0.15] },
      transition: { duration: 28, repeat: Infinity, ease: "easeInOut" },
    },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) =>
        reduceMotion ? (
          <div key={i} className={o.className} style={{ ...o.style, opacity: 0.5 }} />
        ) : (
          <motion.div key={i} className={o.className} style={o.style} animate={o.animate} transition={o.transition} />
        )
      )}
    </div>
  );
}