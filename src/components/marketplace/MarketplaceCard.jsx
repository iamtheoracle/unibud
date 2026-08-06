import React from "react";

/**
 * MarketplaceCard — frosted glass section card with header (icon + title + action).
 */
export default function MarketplaceCard({ icon, title, action, onAction, children, className = "" }) {
  return (
    <div className={`crystal-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-heading font-bold text-[14px] text-foreground flex items-center gap-1.5 tracking-tight">
          {icon}{title}
        </h3>
        {action && (
          <button onClick={onAction} className="text-[12px] font-semibold text-muted-foreground hover:text-primary spring-tap">
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}