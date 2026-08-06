import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * AcademicPulseWidget — compact sparkline of the student's weekly study
 * rhythm. Detects intensity peaks and surfaces them.
 */
export default function AcademicPulseWidget({ sessions }) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
  }, []);

  const pulse = useMemo(() => {
    return days.map((d) =>
      (sessions || [])
        .filter((s) => s.session_date && s.session_date.split("T")[0] === d)
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    );
  }, [days, sessions]);

  const max = Math.max(...pulse, 60);
  const total = pulse.reduce((a, b) => a + b, 0);
  const peakIdx = pulse.indexOf(Math.max(...pulse));
  const peakDay = ["S", "M", "T", "W", "T", "F", "S"][new Date(days[peakIdx]).getDay()];

  const w = 140;
  const h = 48;
  const step = w / (pulse.length - 1);
  const points = pulse.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * (h - 6) - 3;
    return [x, y];
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;
  const gradId = "pulse-grad";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass rounded-[20px] p-4 w-full"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Activity className="w-3.5 h-3.5 text-primary" strokeWidth={2.4} />
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Weekly Pulse</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: h }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(221 83% 53%)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="hsl(221 83% 53%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <motion.path
          d={path}
          fill="none"
          stroke="hsl(221 83% 53%)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={i === peakIdx ? 3 : 1.5}
            fill={i === peakIdx ? "hsl(222 75% 17%)" : "hsl(221 83% 53%)"}
          />
        ))}
      </svg>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-muted-foreground">
          {Math.round(total / 60 * 10) / 10}h this week
        </span>
        {total > 0 && (
          <span className="text-[10px] font-semibold text-primary">
            Peak {peakDay}
          </span>
        )}
      </div>
    </motion.div>
  );
}