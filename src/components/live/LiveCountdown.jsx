import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * LiveCountdown — animated countdown timer for upcoming live events.
 *
 * Props:
 *  - targetDate: ISO string or Date
 *  - onComplete: () => void
 *  - className: extra
 */
export default function LiveCountdown({ targetDate, onComplete, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft(targetDate);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-destructive"
        />
        <span className="text-[11px] font-bold text-destructive uppercase tracking-wider">Starting now</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ].filter((u) => u.label !== "Days" || u.value > 0);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {units.map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <motion.span
              key={unit.value}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="font-heading font-extrabold text-[16px] text-foreground tabular-nums leading-none"
            >
              {String(unit.value).padStart(2, "0")}
            </motion.span>
            <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{unit.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-[14px] text-muted-foreground/40 font-bold mb-3">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function getTimeLeft(targetDate) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}