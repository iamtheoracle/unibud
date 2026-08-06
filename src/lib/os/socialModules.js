/**
 * UNIBUD OS v4 — Social Module Registry
 *
 * Registers additional social capabilities as shared modules so they can be
 * consumed by Square (and other social experiences) without duplication.
 *
 * Each module is implemented once and reused everywhere.
 * References: Phase 7 Square Migration, Shared Module Constitution.
 */

import { registerModule } from "./moduleRegistry";

const SOCIAL_MODULES = [
  // Content engagement modules
  { id: "comments", name: "Comments", category: "content", authority: "CommunityBuilder", entity: "QuadComment", requiresContext: false },
  { id: "reactions", name: "Reactions", category: "content", authority: "Creator", requiresContext: false },
  { id: "media-viewer", name: "Media Viewer", category: "content", authority: "Creator", requiresContext: false },

  // Identity modules
  { id: "creator-profiles", name: "Creator Profiles", category: "identity", authority: "Scribe", requiresContext: false },

  // Engagement modules — shared social actions consumed by every social experience
  { id: "polls", name: "Polls", category: "content", authority: "CommunityBuilder", requiresContext: false },
  { id: "bookmarks", name: "Bookmarks", category: "content", authority: "Scribe", requiresContext: false },
  { id: "share", name: "Share", category: "content", authority: "Creator", requiresContext: false },
  { id: "reports", name: "Content Reports", category: "content", authority: "Sentinel", entity: "ContentReport", requiresContext: false },
];

// Register each social module with Square as the primary consumer
SOCIAL_MODULES.forEach((mod) => {
  registerModule({
    ...mod,
    consumers: ["square"],
    hasDemoData: false,
  });
});

export { SOCIAL_MODULES };