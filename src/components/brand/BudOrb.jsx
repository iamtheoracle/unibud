import React from "react";

/**
 * Bud Orb — the official UNIBUD AI companion mark.
 * "My Realm Orbit" — a living, animated orb with pulsing glow and orbiting ring.
 * Not a robot. Not a human. A luminous intelligence.
 * Uses currentColor — set text color on parent to control orb color.
 */
export default function BudOrb({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Pulsing outer glow */}
      <div
        className="absolute inset-0 rounded-full bud-glow pointer-events-none"
        style={{ background: "radial-gradient(circle, currentColor 0%, transparent 65%)", opacity: 0.22 }}
      />
      {/* Orbiting ring with particle */}
      <div className="absolute inset-0 bud-orbit-spin pointer-events-none">
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
          <ellipse cx="24" cy="24" rx="22" ry="7" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" transform="rotate(-25 24 24)" />
          <circle cx="46" cy="24" r="1.5" fill="currentColor" opacity="0.6" />
        </svg>
      </div>
      {/* Main orb */}
      <svg viewBox="0 0 48 48" className="relative w-full h-full" fill="none">
        <defs>
          <radialGradient id="bud-orb-grad" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.82" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="15" fill="url(#bud-orb-grad)" />
        <ellipse cx="20" cy="18" rx="5" ry="3.5" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}