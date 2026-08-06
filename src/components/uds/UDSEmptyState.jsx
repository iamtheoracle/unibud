import React from "react";
import { cn } from "@/lib/utils";

/**
 * UDSEmptyState — custom empty states with illustration, explanation,
 * and a primary action. Pass a custom illustration node or use the default orb.
 */
export default function UDSEmptyState({ title = "Nothing here yet", message, action, illustration, className }) {
  return (
    <div className={cn("glass-card radius-xl p-8 text-center flex flex-col items-center", className)}>
      <div className="w-16 h-16 radius-pill bg-primary/10 flex items-center justify-center mb-4">
        {illustration || <div className="w-6 h-6 radius-pill bg-primary/30 bud-breathe" />}
      </div>
      <p className="text-subtitle font-heading font-semibold text-foreground">{title}</p>
      {message && <p className="text-body text-muted-foreground mt-1.5 max-w-[280px]">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}