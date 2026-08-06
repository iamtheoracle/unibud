import React from "react";

export default function TaskProgress({ percent, overdue }) {
  const pct = Math.max(0, Math.min(100, percent || 0));
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground">Overall progress</span>
        <span className={`text-[22px] font-heading font-bold tabular-nums ${overdue ? "text-destructive" : "text-primary"}`}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${overdue ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}