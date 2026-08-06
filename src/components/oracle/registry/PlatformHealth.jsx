import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, Activity, AlertTriangle, AlertOctagon, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const LEVELS = {
  excellent: { label: "Excellent", icon: ShieldCheck, color: "text-success", bar: "bg-success", ring: "ring-success/40", glow: "shadow-[0_8px_48px_-12px_rgba(34,197,94,0.45)]", bg: "from-success/20" },
  healthy: { label: "Healthy", icon: Activity, color: "text-information", bar: "bg-information", ring: "ring-information/40", glow: "shadow-[0_8px_48px_-12px_rgba(14,165,233,0.4)]", bg: "from-information/20" },
  warning: { label: "Warning", icon: AlertTriangle, color: "text-warning", bar: "bg-warning", ring: "ring-warning/40", glow: "shadow-[0_8px_48px_-12px_rgba(245,158,11,0.4)]", bg: "from-warning/20" },
  critical: { label: "Critical", icon: AlertOctagon, color: "text-destructive", bar: "bg-destructive", ring: "ring-destructive/50", glow: "shadow-[0_8px_48px_-12px_rgba(239,68,68,0.5)]", bg: "from-destructive/25" },
};

const SIGNAL_TONE = { critical: "text-destructive", warning: "text-warning", info: "text-information" };

export default function PlatformHealth({ health, loading }) {
  const lvl = LEVELS[health?.status] || LEVELS.healthy;
  const Icon = lvl.icon;
  const score = health?.score ?? 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn("crystal-card radius-xl p-5 edge-light relative overflow-hidden", lvl.ring, lvl.glow)}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-50 pointer-events-none", lvl.bg)} />
      <div className="relative flex items-center gap-5">
        <div className="shrink-0">
          <div className={cn("w-16 h-16 rounded-2xl glass-strong grid place-items-center", lvl.color)}>
            {loading ? <span className="w-7 h-7 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" /> : <Icon className="w-8 h-8" />}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Platform Health</p>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className={cn("font-heading font-extrabold text-[26px] leading-none", lvl.color)}>{lvl.label}</h2>
            <span className="display-number text-[18px] text-foreground/80">{score}<span className="text-[12px] text-muted-foreground font-medium">/100</span></span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1.5">Computed live from registry signals — updates automatically.</p>
        </div>
        <div className="hidden md:block shrink-0 w-40">
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, ease: EASE }}
              className={cn("h-full rounded-full", lvl.bar)}
            />
          </div>
        </div>
      </div>

      {health?.signals?.length > 0 && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {health.signals.map((s, i) => (
            <span key={i} className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-[11px] font-medium", SIGNAL_TONE[s.tone] || "text-muted-foreground")}>
              <ChevronRight className="w-3 h-3" />
              {s.label}
              <span className="display-number text-foreground/80">{s.value}</span>
            </span>
          ))}
        </div>
      )}
    </motion.section>
  );
}