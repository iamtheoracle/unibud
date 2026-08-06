import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import { getContract } from "@/lib/os/experienceContract";
import Square from "@/pages/Square";

/**
 * SquareExperience — the migrated Square experience on the v4 OS runtime.
 *
 * This wrapper connects Square to Platform Core without changing user-facing
 * functionality. The existing Square page renders unchanged.
 *
 * Platform Core integration:
 *
 * • ContextProvider — Sets "social" context when Square is active so that
 *   Bud, Orbit, Spark, and the Realtime Engine prioritize social modules
 *   (feed, stories, communities, live, podcasts, events).
 *
 * • Experience Contract — Square declares its consumed modules, permissions,
 *   hidden services, and Platform Core hooks. The Constitutional Validator
 *   enforces full compliance.
 *
 * • Module Registry — Square consumes registered social modules (posts,
 *   stories, communities, podcasts, live, events, comments, reactions,
 *   creator profiles, media viewer, notifications) rather than owning them.
 *   No duplicates.
 *
 * • Realtime Engine — Social entities (QuadPost, Story, ShortVideo,
 *   Community, Podcast, LiveStream, CampusEvent, QuadComment) are synced
 *   by the RealtimeSyncProvider via the entitySyncRegistry. React Query
 *   caches are automatically invalidated on entity change. Square updates
 *   instantly — no manual refresh anywhere.
 *
 * • Bud — Receives social context (active feed, community, creator profile,
 *   event, discussion) and proactively assists with summarizing discussions,
 *   recommending communities, surfacing relevant posts, and assisting with
 *   content creation. Bud remains floating and never becomes a Square screen.
 *
 * • Orbit — Square receives trending topics, university news, campus events,
 *   verified announcements, and recommendations from Orbit. Orbit supplies
 *   discovery; Square renders it.
 *
 * • Spark — Handles background indexing, document processing, OCR, workflow
 *   execution, reminder automation, and cache invalidation for Square.
 *   No UI ownership.
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 * Square is the canonical social implementation — the template for Connect,
 * Quad, Lens, Services, and Me.
 */
export default function SquareExperience() {
  const { setContext } = useContextSystem();
  const contract = getContract("square");

  // ContextProvider — set social context when Square is the active experience.
  // This signals Platform Core (Bud, Orbit, Spark, Realtime) to prioritize
  // social modules: feed, stories, communities, live, podcasts, events.
  // Academic modules remain available but at lower priority.
  // Navigation never changes — only module priority shifts.
  useEffect(() => {
    setContext("social");
  }, [setContext]);

  // Render the existing Square page — no functional changes.
  // All Platform Core integration is handled by the OS runtime layers
  // already mounted in AppShell (RealtimeSyncProvider, BudPresenceProvider,
  // VoiceProvider, SearchProvider, OSContextProvider).
  return <Square />;
}