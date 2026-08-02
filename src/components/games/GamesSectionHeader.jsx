import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * GamesSectionHeader — section title with optional "See All" action.
 */
export default function GamesSectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-[15px] font-bold text-foreground tracking-tight">{title}</h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground spring-tap">
          {action}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}