/**
 * UNIBUD OS v4 — Communication Module Registry
 *
 * Registers additional communication capabilities as shared modules so they
 * can be consumed by Connect (and other communication experiences) without
 * duplication.
 *
 * Each module is implemented once and reused everywhere.
 * References: Phase 8 Connect Migration, Shared Module Constitution.
 */

import { registerModule } from "./moduleRegistry";

const COMMUNICATION_MODULES = [
  // Communication modules — entities where applicable
  { id: "group-chats", name: "Group Chats", category: "communication", authority: "Automator", entity: "Conversation", requiresContext: false },
  { id: "voice-calls", name: "Voice Calls", category: "communication", authority: "Automator", requiresContext: false },
  { id: "video-calls", name: "Video Calls", category: "communication", authority: "Automator", requiresContext: false },
  { id: "meetings", name: "Meetings", category: "communication", authority: "Automator", requiresContext: false },
  { id: "whiteboards", name: "Whiteboards", category: "communication", authority: "Automator", requiresContext: false },
  { id: "screen-sharing", name: "Screen Sharing", category: "communication", authority: "Automator", requiresContext: false },
  { id: "presence", name: "Presence", category: "communication", authority: "Automator", entity: "Presence", requiresContext: false },
  { id: "contacts", name: "Contacts", category: "communication", authority: "Automator", requiresContext: false },
  { id: "file-sharing", name: "File Sharing", category: "communication", authority: "Automator", requiresContext: false },
];

// Register each communication module with Connect as the primary consumer
COMMUNICATION_MODULES.forEach((mod) => {
  registerModule({
    ...mod,
    consumers: ["connect"],
    hasDemoData: false,
  });
});

export { COMMUNICATION_MODULES };