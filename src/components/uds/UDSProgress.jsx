import React from "react";
import { cn } from "@/lib/utils";

/** UDSProgress — animated progress bound to 0–100. */
export default function UDSProgress({ value = 0, className }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full h-2 bg-muted rounded-full overflow-hidden", className)}>
      <div className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}