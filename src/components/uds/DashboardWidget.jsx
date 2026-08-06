import React from "react";
import { cn } from "@/lib/utils";

/**
 * DashboardWidget — standard widget surface: title, optional KPI, accent,
 * and a body slot. Used by every role dashboard for consistency.
 */
export default function DashboardWidget({ title, kpi, kpiLabel, accent = false, children, className }) {
  return (
    <div className={cn("glass-card radius-lg p-5", className)}>
      {(title || kpi != null) && (
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          {kpi != null && (
            <div className="text-right">
              <p className="text-display font-heading font-bold text-foreground leading-none">{kpi}</p>
              {kpiLabel && <p className="text-micro text-muted-foreground mt-1">{kpiLabel}</p>}
            </div>
          )}
        </div>
      )}
      {accent && <div className="h-1 w-10 bg-primary rounded-full mb-3" />}
      {children}
    </div>
  );
}