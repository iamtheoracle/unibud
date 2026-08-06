import React from "react";

/**
 * DiscoverCard — frosted glass card with a header (icon + title + action)
 * used across the redesigned Discover feed.
 */
export default function DiscoverCard({ icon, title, action, onAction, children, className = "" }) {
  return (
    <div className={`crystal-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-[15px] text-foreground flex items-center gap-1.5 tracking-tight">
          {icon}{title}
        </h3>
        {action && (
          <button onClick={onAction} className="text-[12px] font-semibold text-primary spring-tap hover:underline">
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}