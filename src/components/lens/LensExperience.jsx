import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import Lens from "@/pages/Lens";

/**
 * LensExperience — the migrated Lens command center on the v4 OS runtime.
 *
 * Lens is the operating system's command center. It owns:
 * Universal Search UI, Command Palette, AI Actions, Cross-workspace Search,
 * Filters, Saved Searches, Recent Activity, and Recommendations.
 *
 * Lens never owns data — everything comes from Platform Core.
 *
 * Platform Core integration:
 * • ContextProvider — sets hybrid context (command center is context-neutral)
 * • Search — universal search is a Platform Core service consumed by Lens
 * • Bud — AI actions and suggestions flow through Bud
 * • Realtime Engine — search results and recent activity update instantly
 * • Spark — search indexing and cache invalidation
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 * Lens is the canonical command center implementation.
 */
export default function LensExperience() {
  const { setContext } = useContextSystem();

  useEffect(() => {
    setContext("hybrid");
  }, [setContext]);

  return <Lens />;
}