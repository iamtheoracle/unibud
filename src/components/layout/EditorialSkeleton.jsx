import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialSkeleton — loading placeholder matching editorial layout.
 *
 * Uses the shimmer animation from index.css. Monochrome,
 * subtle, no jarring colors.
 *
 * Variants:
 * - text: single line of text
 * - title: large title placeholder
 * - avatar: circular avatar
 * - rect: rectangular block
 * - card: full card skeleton
 *
 * Phase 2 — Design System / Loading States
 */
const VARIANTS = {
  text: "h-4 rounded-md",
  title: "h-7 rounded-lg",
  avatar: "h-12 w-12 rounded-full",
  rect: "rounded-2xl",
  card: "h-20 rounded-2xl",
};

export default function EditorialSkeleton({ variant = "text", className, count = 1 }) {
  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={cn("shimmer", VARIANTS[variant], className)} />
        ))}
      </div>
    );
  }
  return <div className={cn("shimmer", VARIANTS[variant], className)} />;
}