import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialEmptyState — minimal, elegant empty state.
 *
 * Uses whitespace and typography instead of illustrations.
 * Optional icon, title, message, and action.
 *
 * Phase 2 — Design System / Empty States
 */
export default function EditorialEmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-muted/50">
          <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-title text-foreground font-semibold">{title}</h3>
      {message && (
        <p className="mt-1.5 text-body text-muted-foreground max-w-[280px]">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}