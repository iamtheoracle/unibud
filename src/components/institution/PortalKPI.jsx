import React from "react";
import { cn } from "@/lib/utils";

export default function PortalKPI({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className={cn("glass-card radius-lg p-4 flex flex-col gap-1", accent && "border-primary/40")}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-primary" />}
      </div>
      <span className="text-[26px] font-heading font-bold leading-none mt-1">{value}</span>
      {sub && <span className="text-[12px] text-muted-foreground">{sub}</span>}
    </div>
  );
}