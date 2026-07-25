import React from "react";

/**
 * BudCharacter — neutral placeholder.
 * The official Bud visual will be added here once provided.
 * Renders a calm glass circle so existing layouts stay intact.
 */
export default function BudCharacter({ variant = "portrait", className = "", animate = true, glow = true }) {
  return (
    <div
      className={`relative rounded-full glass-strong ${className}`}
      style={{ background: "radial-gradient(circle at 50% 40%, hsl(196 100% 74% / 0.10), transparent 70%)" }}
      aria-label="Bud"
    />
  );
}