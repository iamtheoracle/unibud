import React from "react";

/** BudThinking — loading indicator while Spark processes a request. */
export default function BudThinking({ label = "Bud is thinking…" }) {
  return (
    <div className="flex items-center gap-2.5 p-3">
      <span className="bud-breathe w-2.5 h-2.5 rounded-full bg-primary" />
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}