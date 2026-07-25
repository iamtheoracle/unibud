import React from "react";

export default function EmptyState({ message }) {
  return (
    <div className="glass-card p-8 text-center">
      <p className="text-[13px] text-muted-foreground">{message}</p>
    </div>
  );
}