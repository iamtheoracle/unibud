import React from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialPage — the standard page wrapper for all UNIBUD screens.
 *
 * Provides:
 * - Consistent max-width (520px, responsive on desktop)
 * - Consistent horizontal padding
 * - Top safe-area padding
 * - Bottom padding to clear the navigation dock
 * - Optional pull-to-refresh support (pass children)
 *
 * Usage:
 *   <EditorialPage>
 *     <EditorialHeader title="Home" />
 *     <EditorialSection>...</EditorialSection>
 *   </EditorialPage>
 *
 * Phase 5 — Editorial Layout System
 */
export default function EditorialPage({ children, className, maxWidth = "520px" }) {
  return (
    <div className={cn("w-full mx-auto px-5 pt-8 pb-36 safe-area-pt", className)} style={{ maxWidth }}>
      {children}
    </div>
  );
}