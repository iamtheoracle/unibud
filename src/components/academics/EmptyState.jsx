import React from "react";

export default function EmptyState({ message }) {
  return (
    <div className="glass-card p-8 text-center flex flex-col items-center">
      <div className="w-14 h-14 radius-pill bg-primary/10 flex items-center justify-center mb-4">
        <div className="w-5 h-5 radius-pill bg-primary/30 bud-breathe" />
      </div>
      <p className="text-[13px] text-muted-foreground max-w-[260px]">{message}</p>
    </div>
  );
}