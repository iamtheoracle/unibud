import React from "react";
import { cn } from "@/lib/utils";

/**
 * MetricSection — a crystal panel grouping related live metrics,
 * with an accent strip and responsive tile grid.
 */
const ACCENTS = {
  primary: "from-primary/30 to-transparent",
  info: "from-information/30 to-transparent",
  success: "from-success/30 to-transparent",
  warn: "from-warning/30 to-transparent",
  danger: "from-destructive/30 to-transparent",
  gold: "from-gold/30 to-transparent",
};

export default function MetricSection({ title, icon: Icon, accent = "primary", children, count }) {
  return (
    <section className="crystal-card radius-xl p-4 edge-light">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-xl grid place-items-center bg-gradient-to-br", ACCENTS[accent] || ACCENTS.primary)}>
          {Icon && <Icon className="w-4 h-4 text-foreground" />}
        </div>
        <div className="min-w-0">
          <h2 className="font-heading font-bold text-[15px] text-foreground leading-none">{title}</h2>
          {typeof count === "number" && <p className="text-[11px] text-muted-foreground mt-1">{count} metrics · live</p>}
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />auto
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">{children}</div>
    </section>
  );
}