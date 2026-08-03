import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import { useNavigation } from "@/lib/os/NavigationContext";
import { getContract } from "@/lib/os/experienceContract";
import Connect from "@/pages/Connect";

/**
 * ConnectExperience — the migrated Connect experience on the v4 OS runtime.
 *
 * This wrapper connects Connect to Platform Core without changing user-facing
 * functionality. The existing Connect page renders unchanged.
 *
 * Platform Core integration:
 *
 * • ContextProvider — Sets "social" context when Connect is active so that
 *   Bud, Orbit, Spark, and the Realtime Engine prioritize communication
 *   modules (messages, calls, conversations, presence).
 *
 * • Experience Contract — Connect declares its consumed modules, permissions,
 *   hidden services, and Platform Core hooks. The Constitutional Validator
 *   enforces full compliance.
 *
 * • Module Registry — Connect consumes registered communication modules
 *   (messages, conversations, calls, group-chats, voice-calls, video-calls,
 *   meetings, whiteboards, screen-sharing, presence, contacts, file-sharing)
 *   rather than owning them. No duplicates.
 *
 * • Realtime Engine — Communication entities (Message, Conversation, Presence,
 *   Follow, FriendRequest) are synced by the RealtimeSyncProvider via the
 *   entitySyncRegistry. Messages, presence, typing indicators, read receipts,
 *   and meeting state update instantly — no manual refresh anywhere.
 *
 * • Bud — Receives communication context (active conversation, call state,
 *   unread priorities) and proactively assists with summarizing long
 *   conversations, highlighting action items, suggesting meeting times,
 *   drafting replies, and surfacing unread priorities.
 *   Bud orchestrates only — never owns communication UI.
 *
 * • Orbit — May recommend relevant communities, new collaborators, study
 *   partners, academic groups, and professional networking opportunities.
 *   Only verified recommendations.
 *
 * • Spark — Executes background uploads, media processing, OCR, meeting
 *   recordings, search indexing, and workflow automation for Connect.
 *   No UI ownership.
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 * Connect is the canonical communication implementation — the template for
 * Quad, Lens, Services, and Me.
 */
export default function ConnectExperience() {
  const { setContext } = useContextSystem();
  const { isSocial } = useNavigation();
  const contract = getContract("connect");

  // ContextProvider — adapt context to the active navigation world.
  // Social world: prioritize social communication (DMs, groups, communities).
  // Academics world: prioritize academic communication (study groups, course
  // chats, faculty, project teams, class discussions).
  // Users should not notice the transition — content adapts seamlessly.
  useEffect(() => {
    setContext(isSocial ? "social" : "academic");
  }, [isSocial, setContext]);

  // Render the existing Connect page — no functional changes.
  // All Platform Core integration is handled by the OS runtime layers
  // already mounted in AppShell (RealtimeSyncProvider, BudPresenceProvider,
  // VoiceProvider, SearchProvider, OSContextProvider).
  return <Connect />;
}