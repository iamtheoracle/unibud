import React from "react";

/**
 * Bud Orb — the official UNIBUD AI companion mark.
 * A glowing orb representing "My Realm Orbit".
 * Uses currentColor — set text color on parent to control orb color.
 */
export default function BudOrb({ className = "" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bud-orb-grad" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="bud-orb-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo glow */}
      <circle cx="24" cy="24" r="24" fill="url(#bud-orb-halo)" />
      {/* Orbit ring */}
      <ellipse
        cx="24" cy="24" rx="22" ry="7"
        fill="none" stroke="currentColor" strokeWidth="0.6"
        opacity="0.25" transform="rotate(-25 24 24)"
      />
      {/* Main orb */}
      <circle cx="24" cy="24" r="15" fill="url(#bud-orb-grad)" />
      {/* Inner highlight */}
      <ellipse cx="20" cy="18" rx="5" ry="3.5" fill="white" opacity="0.3" />
    </svg>
  );
}