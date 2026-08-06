/**
 * UNIBUD Navigation OS — Deep Link Registry
 *
 * Every addressable entity in the platform is registered here.
 * Deep links follow the pattern:  unibud://<entity>/<id>
 * Web links follow the pattern:   /entity/id
 *
 * Each entry declares:
 *   - type:     entity type identifier
 *   - pattern:  URL path pattern with :params
 *   - scheme:   deep link scheme string
 *   - title:    human-readable entity name (used in share sheets)
 *   - resolve:  async function(params) → { title, description, imageUrl, path }
 *                Used to generate Open Graph meta and preview cards.
 */

// ─── Entity Registry ─────────────────────────────────────────────────────────

export const DEEP_LINK_ENTITIES = [
  {
    type: "profile",
    pattern: "/profile/:profileId",
    scheme: "unibud://profile/:profileId",
    title: "Student Profile",
    ogTitle: (p) => `${p.name || "Student"} on UNIBUD`,
    ogDescription: (p) => p.bio || "View this student's profile on UNIBUD",
  },
  {
    type: "community",
    pattern: "/community/:communityId",
    scheme: "unibud://community/:communityId",
    title: "Community",
    ogTitle: (p) => `${p.name || "Community"} — UNIBUD`,
    ogDescription: (p) => p.description || "Join this community on UNIBUD",
  },
  {
    type: "course",
    pattern: "/course/:courseId",
    scheme: "unibud://course/:courseId",
    title: "Course",
    ogTitle: (p) => `${p.title || "Course"} — UNIBUD`,
    ogDescription: (p) => p.description || "View this course on UNIBUD",
  },
  {
    type: "assignment",
    pattern: "/assignments",
    scheme: "unibud://assignments",
    title: "Assignments",
    ogTitle: () => "Assignments — UNIBUD",
    ogDescription: () => "View your assignments on UNIBUD",
  },
  {
    type: "event",
    pattern: "/events",
    scheme: "unibud://events",
    title: "Event",
    ogTitle: (p) => `${p.title || "Event"} — UNIBUD`,
    ogDescription: (p) => p.description || "Check out this event on UNIBUD",
  },
  {
    type: "marketplace-item",
    pattern: "/marketplace",
    scheme: "unibud://marketplace",
    title: "Marketplace",
    ogTitle: (p) => `${p.title || "Listing"} — UNIBUD Marketplace`,
    ogDescription: (p) => p.description || "See this listing on UNIBUD Marketplace",
  },
  {
    type: "conversation",
    pattern: "/messages/:conversationId",
    scheme: "unibud://messages/:conversationId",
    title: "Conversation",
    ogTitle: () => "Conversation — UNIBUD",
    ogDescription: () => "View this conversation on UNIBUD",
  },
  {
    type: "study-group",
    pattern: "/study-groups/:groupId",
    scheme: "unibud://study-groups/:groupId",
    title: "Study Group",
    ogTitle: (p) => `${p.title || "Study Group"} — UNIBUD`,
    ogDescription: (p) => p.description || "Join this study group on UNIBUD",
  },
  {
    type: "exam",
    pattern: "/exam/start/:paperId",
    scheme: "unibud://exam/start/:paperId",
    title: "Exam",
    ogTitle: (p) => `${p.title || "Exam"} — UNIBUD`,
    ogDescription: () => "View this exam on UNIBUD",
  },
  {
    type: "podcast",
    pattern: "/podcasts/:showId",
    scheme: "unibud://podcasts/:showId",
    title: "Podcast Show",
    ogTitle: (p) => `${p.title || "Podcast"} — UNIBUD`,
    ogDescription: (p) => p.description || "Listen on UNIBUD",
  },
  {
    type: "mentor",
    pattern: "/mentor/:mentorId",
    scheme: "unibud://mentor/:mentorId",
    title: "Mentor",
    ogTitle: (p) => `${p.name || "Mentor"} — UNIBUD Mentorship`,
    ogDescription: () => "Connect with this mentor on UNIBUD",
  },
  {
    type: "organization",
    pattern: "/organization/:clubId",
    scheme: "unibud://organization/:clubId",
    title: "Organization",
    ogTitle: (p) => `${p.name || "Organization"} — UNIBUD`,
    ogDescription: (p) => p.description || "View this organization on UNIBUD",
  },
  {
    type: "collaboration",
    pattern: "/collaboration/:workspaceId",
    scheme: "unibud://collaboration/:workspaceId",
    title: "Workspace",
    ogTitle: (p) => `${p.name || "Workspace"} — UNIBUD`,
    ogDescription: () => "Collaborate on UNIBUD",
  },
  {
    type: "task",
    pattern: "/tasks/:taskId",
    scheme: "unibud://tasks/:taskId",
    title: "Task",
    ogTitle: (p) => `${p.title || "Task"} — UNIBUD`,
    ogDescription: () => "View this task on UNIBUD",
  },
  {
    type: "live-stream",
    pattern: "/live/:streamId",
    scheme: "unibud://live/:streamId",
    title: "Live Stream",
    ogTitle: (p) => `${p.title || "Live"} — UNIBUD`,
    ogDescription: () => "Watch live on UNIBUD",
  },
  {
    type: "hub",
    pattern: "/hub/:hubId",
    scheme: "unibud://hub/:hubId",
    title: "Hub",
    ogTitle: (p) => `${p.name || "Hub"} — UNIBUD`,
    ogDescription: (p) => p.description || "View this hub on UNIBUD",
  },
];

// ─── Build lookup by type ─────────────────────────────────────────────────────

const _byType = new Map(DEEP_LINK_ENTITIES.map((e) => [e.type, e]));

/**
 * Get a deep link entity definition by type.
 * @param {string} type
 * @returns {Object|undefined}
 */
export function getDeepLinkEntity(type) {
  return _byType.get(type);
}

/**
 * Build a web path for a deep-linkable entity.
 *
 * @param {string} type   - Entity type (e.g. "course")
 * @param {Object} params - Route params (e.g. { courseId: "abc" })
 * @returns {string|null}  Web path or null if type not found
 */
export function buildDeepLink(type, params = {}) {
  const entity = _byType.get(type);
  if (!entity) return null;
  let path = entity.pattern;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(value));
  }
  return path;
}

/**
 * Build a native scheme deep link (e.g. "unibud://course/abc").
 *
 * @param {string} type
 * @param {Object} params
 * @returns {string|null}
 */
export function buildSchemeDeepLink(type, params = {}) {
  const entity = _byType.get(type);
  if (!entity) return null;
  let scheme = entity.scheme;
  for (const [key, value] of Object.entries(params)) {
    scheme = scheme.replace(`:${key}`, encodeURIComponent(value));
  }
  return scheme;
}

/**
 * Parse a native scheme deep link back to a web path.
 * e.g. "unibud://course/abc" → "/course/abc"
 *
 * @param {string} schemeUrl
 * @returns {string|null}
 */
export function parseSchemeDeepLink(schemeUrl) {
  if (!schemeUrl?.startsWith("unibud://")) return null;
  const path = schemeUrl.replace("unibud:/", "");
  return path || null;
}

/**
 * Generate Open Graph metadata for a shareable entity.
 *
 * @param {string} type     - Entity type
 * @param {Object} params   - Route params
 * @param {Object} data     - Entity data (name, title, description, etc.)
 * @returns {{ title: string, description: string, url: string }|null}
 */
export function generateOGMeta(type, params = {}, data = {}) {
  const entity = _byType.get(type);
  if (!entity) return null;
  const url = buildDeepLink(type, params);
  return {
    title: entity.ogTitle(data),
    description: entity.ogDescription(data),
    url: url ? `https://app.unibud.com${url}` : "https://app.unibud.com",
    siteName: "UNIBUD",
  };
}
