import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialDivider — subtle horizontal rule for editorial rhythm.
 *
 * Replaces card boundaries with whitespace + typography + dividers.
 * Thin, low-opacity, spans content width.
 *
 * Phase 5 — Editorial Layout System
 */
export default function EditorialDivider({ className, label }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3 my-6", className)}>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-micro text-muted-foreground">{label}</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>
    );
  }
  return <div className={cn("h-px bg-border/40 my-6", className)} />;
}