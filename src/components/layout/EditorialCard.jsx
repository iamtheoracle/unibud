import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialCard — the minimal card primitive.
 *
 * Lighter and thinner than traditional cards. Used only where
 * visual containment is necessary (not for every section).
 *
 * Characteristics:
 * - Subtle glass background
 * - Thin border
 * - Minimal shadow
 * - Rounded corners
 * - No heavy elevation
 *
 * Phase 5 — Editorial Layout System
 */
export default function EditorialCard({ children, className, onClick, hover = true }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "glass-card p-4 text-left w-full",
        hover && "card-hover",
        onClick && "spring-tap cursor-pointer",
        className
      )}
    >
      {children}
    </Tag>
  );
}