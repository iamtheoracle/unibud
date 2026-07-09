import React from "react";

export default function LoadingState({ className = "", count = 3 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-[24px] border border-border/50 p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-2.5 bg-muted rounded w-1/3" />
            </div>
          </div>
          <div className="h-2.5 bg-muted rounded w-full mb-2" />
          <div className="h-2.5 bg-muted rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}