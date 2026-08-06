import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialSection — a content section with consistent vertical rhythm.
 *
 * Uses generous whitespace instead of cards. Sections are separated
 * by the spacing scale, creating an editorial flow.
 *
 * Variants:
 * - default: mt-6 (24px) — standard section gap
 * - tight: mt-4 (16px) — grouped items
 * - spacious: mt-8 (32px) — major sections
 * - expansive: mt-12 (48px) — hero breaks
 * - flush: no top margin — first section after header
 *
 * Phase 5 — Editorial Layout System
 */
const VARIANTS = {
  flush: "mt-0",
  tight: "mt-4",
  default: "mt-6",
  spacious: "mt-8",
  expansive: "mt-12",
};

export default function EditorialSection({ children, className, variant = "default", divider = false }) {
  return (
    <section className={cn(VARIANTS[variant] || VARIANTS.default, className)}>
      {children}
      {divider && <div className="mt-6 h-px bg-border/40" />}
    </section>
  );
}