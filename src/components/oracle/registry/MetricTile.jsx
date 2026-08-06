import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * MetricTile — a single live metric crystal tile.
 * `tone` controls emphasis; `critical` flags immediately-visible bad states.
 */
const TONE = {
  primary: "text-primary",
  info: "text-information",
  success: "text-success",
  warn: "text-warning",
  danger: "text-destructive",
  gold: "text-gold",
};

export default function MetricTile({ icon: Icon, label, value, sub, tone, critical, loading, suffix }) {
  const t = TONE[tone] || TONE.primary;
  return (
    <div
      className={cn(
        "crystal-card radius-lg p-3.5 relative overflow-hidden card-hover",
        critical && "ring-1 ring-destructive/40"
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0", t)} />}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</span>
        {critical && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-destructive live-pulse shrink-0" />}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <span className="display-number text-[22px] text-foreground leading-none">{value}</span>
        )}
        {suffix && !loading && <span className="text-[11px] text-muted-foreground font-medium">{suffix}</span>}
      </div>
      {sub && <p className="text-[10.5px] text-muted-foreground mt-1 truncate">{sub}</p>}
    </div>
  );
}