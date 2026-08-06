import React, { useId } from "react";
import { motion } from "framer-motion";

/**
 * LearningProgressRing — circular progress with a Midnight→Electric gradient
 * stroke and a spring-animated fill. Center shows the percentage.
 */
export default function LearningProgressRing({ progress = 0, size = 96, stroke = 6, label, sublabel }) {
  const id = useId().replace(/:/g, "");
  const r = 50 - stroke;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress));
  const offset = circ * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(222 75% 17%)" />
            <stop offset="100%" stopColor="hsl(221 83% 53%)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} opacity="0.5" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="display-number text-foreground" style={{ fontSize: size * 0.22 }}>
          {Math.round(pct * 100)}<span className="text-[0.5em] font-heading font-semibold text-muted-foreground">%</span>
        </span>
        {label && <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">{label}</span>}
        {sublabel && <span className="text-[9px] text-muted-foreground/70">{sublabel}</span>}
      </div>
    </div>
  );
}