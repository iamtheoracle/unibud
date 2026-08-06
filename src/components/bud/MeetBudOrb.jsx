import React from "react";

/**
 * MeetBudOrb — a self-contained living Bud presence for the intro screen.
 * Layered glass orb: ambient bloom, pulsing glow ring, breathing glass body,
 * and a luminous core. All animations are prefers-reduced-motion safe.
 */
export default function MeetBudOrb() {
  return (
    <div className="relative w-[128px] h-[128px] grid place-items-center" aria-hidden="true">
      {/* Ambient bloom */}
      <div
        className="absolute inset-[-45%] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.24), transparent 65%)",
          filter: "blur(28px)",
        }}
      />
      {/* Pulsing glow ring */}
      <div
        className="absolute inset-0 rounded-full glow-pulse"
        style={{ boxShadow: "0 0 0 1px hsl(var(--primary) / 0.28), 0 12px 54px hsl(var(--primary) / 0.38)" }}
      />
      {/* Glass body */}
      <div
        className="relative w-[96px] h-[96px] rounded-full glass-strong grid place-items-center bud-breathe"
        style={{
          boxShadow:
            "inset 0 2px 12px rgba(255,255,255,0.20), inset 0 -8px 22px hsl(var(--primary) / 0.34)",
        }}
      >
        {/* Luminous core */}
        <div
          className="w-10 h-10 rounded-full ai-thinking"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, hsl(var(--accent) / 0.95), hsl(var(--primary)) 72%)",
            boxShadow: "0 0 26px hsl(var(--accent) / 0.65)",
          }}
        />
      </div>
    </div>
  );
}