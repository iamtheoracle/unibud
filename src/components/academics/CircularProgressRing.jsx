import React from "react";
import { motion } from "framer-motion";

export default function CircularProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = "hsl(var(--primary))",
  trackColor = "hsl(var(--muted))",
  label,
  sublabel,
  delay = 0,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - percentage * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={trackColor}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span
            className="font-heading font-bold text-foreground leading-none"
            style={{ fontSize: size * 0.24 }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            className="text-muted-foreground leading-tight mt-0.5"
            style={{ fontSize: size * 0.1 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}