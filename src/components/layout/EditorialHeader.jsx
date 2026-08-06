import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * EditorialHeader — large page title with optional subtitle/metadata.
 *
 * Creates strong visual hierarchy:
 * - Large title (display weight)
 * - Optional subtitle (muted)
 * - Optional metadata row (caption, muted)
 * - Fade-in-up entrance animation
 *
 * Phase 5 — Editorial Layout System
 */
export default function EditorialHeader({ title, subtitle, metadata, action, className }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex items-start justify-between gap-4", className)}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-display text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-body text-muted-foreground">{subtitle}</p>
        )}
        {metadata && (
          <p className="mt-1 text-caption text-muted-foreground/70">{metadata}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}