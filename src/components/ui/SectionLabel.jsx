import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * SectionLabel — the single consistent section header across UNIBUD OS.
 * Uppercase, muted, tracking-wider. Optional action link on the right.
 * Used on Home, Campus, Square, Marketplace, Wallet, Me — everywhere.
 */
export default function SectionLabel({ children, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {children}
      </h2>
      {action && (
        <button
          onClick={onAction}
          className="text-[12px] font-medium text-foreground/60 flex items-center gap-0.5 spring-tap hover:text-foreground transition-colors"
        >
          {action}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}