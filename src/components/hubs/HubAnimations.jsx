import React from "react";

/** EqualizerBars — animated music equalizer for the Music hub. */
export function EqualizerBars({ color, height = 14 }) {
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="eq-bar w-0.5 h-full rounded-full"
          style={{ background: `hsl(${color})`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

/** LiveIndicator — pulsing "LIVE" badge for Sports hub. */
export function LiveIndicator() {
  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-pulse" />
      <span className="text-[8px] font-bold text-red-500 uppercase tracking-wide">Live</span>
    </span>
  );
}

/** BreakingBadge — pulsing "BREAKING" badge for News hub. */
export function BreakingBadge() {
  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-pulse" />
      <span className="text-[8px] font-bold text-red-500 uppercase tracking-wide">Breaking</span>
    </span>
  );
}

/** CinematicGlow — shimmering overlay for Movies hub cards. */
export function CinematicGlow() {
  return <div className="absolute inset-0 pointer-events-none cinematic-shimmer rounded-[inherit]" />;
}

/** OrbitSearchingBars — animated bars for loading states. */
export function OrbitSearchingBars({ color, height = 20 }) {
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="eq-bar w-1 h-full rounded-full"
          style={{ background: `hsl(${color})`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}