import React, { useMemo } from "react";

/**
 * SparkField — ambient spark particle animation.
 * Ice-blue particles rise softly, evoking the invisible Spark kernel.
 * Pure CSS animation for smooth 60-120fps with zero JS overhead.
 */
export default function SparkField({ count = 18, className = "", color = "#2563EB" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 5 + Math.random() * 6,
        delay: Math.random() * 6,
        opacity: 0.4 + Math.random() * 0.5,
      })),
    [count]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="spark-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
        />
      ))}
    </div>
  );
}