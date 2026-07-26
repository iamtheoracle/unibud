import React from "react";

/** VisualProgress — reusable visual progress components so students
 *  understand what needs attention without reading long lists.
 *  Tones use literal class maps so Tailwind keeps them. */

const TONE_BG = { accent: "bg-accent", success: "bg-success", error: "bg-error", warning: "bg-warning", primary: "bg-primary", information: "bg-information" };
const TONE_BG15 = { accent: "bg-accent/15", success: "bg-success/15", error: "bg-error/15", warning: "bg-warning/15", primary: "bg-primary/15", information: "bg-information/15" };
const TONE_TXT = { accent: "text-accent", success: "text-success", error: "text-error", warning: "text-warning", primary: "text-primary", information: "text-information" };

export function CircularProgress({ value, size = 48, stroke = 4, label, tone = "accent" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`hsl(var(--${tone === "accent" ? "accent" : tone}))`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">{pct}%</span>
      {label && <span className="absolute -bottom-4 text-[9px] text-muted-foreground whitespace-nowrap">{label}</span>}
    </div>
  );
}

export function CompletionBar({ value, label, tone = "accent" }) {
  return (
    <div>
      {label && <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-foreground">{value}%</span></div>}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={TONE_BG[tone] || "bg-accent"} style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", borderRadius: "9999px", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

export function TaskCompletionBar({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return <CompletionBar value={pct} label={`${done}/${total} done`} tone="success" />;
}

export function Countdown({ target, label, tone = "primary" }) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) {
    return (
      <div className="glass-card p-3 flex items-center gap-2 border border-error/20">
        <div className="w-9 h-9 rounded-xl bg-error/15 flex items-center justify-center text-error text-xs font-bold">!</div>
        <div><p className="text-xs font-semibold text-error">Overdue</p><p className="text-[10px] text-muted-foreground">{label}</p></div>
      </div>
    );
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const big = days > 0 ? days : hours > 0 ? hours : mins;
  const unit = days > 0 ? "d" : hours > 0 ? "h" : "m";
  return (
    <div className="glass-card p-3 flex items-center gap-2">
      <div className={`w-9 h-9 rounded-xl ${TONE_BG15[tone] || "bg-primary/15"} flex items-center justify-center`}>
        <span className={`text-sm font-bold ${TONE_TXT[tone] || "text-primary"}`}>{big}{unit}</span>
      </div>
      <div className="min-w-0"><p className="text-xs font-semibold text-foreground truncate">{label}</p><p className="text-[10px] text-muted-foreground">{days}d {hours}h {mins}m</p></div>
    </div>
  );
}

export function MilestoneTracker({ milestones }) {
  if (!milestones?.length) return null;
  return (
    <div className="relative pl-4">
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
      {milestones.map((m, i) => (
        <div key={i} className="relative mb-3">
          <div className={`absolute -left-4 top-0.5 w-2.5 h-2.5 rounded-full ${m.done ? "bg-success" : "bg-muted border-2 border-border"}`} />
          <p className={`text-xs font-semibold ${m.done ? "text-foreground" : "text-foreground/80"}`}>{m.title}</p>
          {m.date && <p className="text-[10px] text-muted-foreground">{m.date}</p>}
        </div>
      ))}
    </div>
  );
}

export function SemesterTracker({ value, startDate, endDate }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div><p className="text-sm font-semibold text-foreground">Semester progress</p><p className="text-[10px] text-muted-foreground">{startDate} → {endDate}</p></div>
        <CircularProgress value={value} size={44} />
      </div>
      <CompletionBar value={value} tone="information" />
    </div>
  );
}

export function ModuleCompletionTracker({ modules = [] }) {
  return (
    <div className="space-y-2">
      {modules.map((m, i) => (
        <CompletionBar key={i} value={m.pct} label={m.type || m.label} tone={m.pct === 100 ? "success" : "accent"} />
      ))}
    </div>
  );
}