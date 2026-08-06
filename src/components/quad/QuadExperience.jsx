import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import Quad from "@/pages/Quad";

/**
 * QuadExperience — the migrated Quad discovery workspace on the v4 OS runtime.
 *
 * Quad is the universal discovery workspace. It composes Platform Core only —
 * Orbit (discovery), Search, Recommendation Engine, and Realtime Engine.
 * Quad never owns feeds, communities, media, search, identity, or realtime.
 *
 * Platform Core integration:
 * • ContextProvider — sets hybrid context (discovery spans academic + social)
 * • Orbit — supplies trending topics, campus highlights, recommendations
 * • Search — universal search surfaces results from all entities
 * • Realtime Engine — discovery results update instantly
 * • Bud — simply explains discovery results
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 * Quad is the canonical discovery implementation.
 */
export default function QuadExperience() {
  const { setContext } = useContextSystem();

  useEffect(() => {
    setContext("hybrid");
  }, [setContext]);

  return <Quad />;
}