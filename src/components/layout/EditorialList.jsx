import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialList — elegant list layout with thin dividers.
 *
 * Replaces card-heavy lists with:
 * - Large touch areas
 * - Thin dividers between items
 * - Comfortable spacing
 * - Premium scrolling
 *
 * Phase 5 — Editorial Layout System
 */
export default function EditorialList({ items, renderItem, className, divider = true }) {
  return (
    <div className={cn("divide-y divide-border/30", className)}>
      {items.map((item, index) => (
        <div key={item.id || index} className="py-3.5">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}