/**
 * UNIBUD OS v4 — Module Registry
 *
 * Every reusable capability is registered here ONCE and consumed everywhere.
 * A module is never duplicated; if a similar capability exists, it is extended.
 *
 * References: Shared Module Constitution, Engineering Constitution (Commandment 1).
 */

const REGISTRY = new Map();
const listeners = new Set();

function notify() {
  listeners.forEach((l) => l(Array.from(REGISTRY.values())));
}

/**
 * Register a shared module.
 * @param {Object} module - Module definition
 * @param {string} module.id - Unique identifier (e.g., "posts")
 * @param {string} module.name - Display name
 * @param {string} module.layer - Owning layer (always "shared-modules")
 * @param {string} module.category - content | community | communication | identity | discovery
 * @param {string} module.authority - Governing AI authority
 * @param {string[]} [module.consumers] - Experiences that use this module
 * @param {Function} [module.component] - React component (lazy or direct)
 * @param {boolean} [module.requiresContext] - Whether module responds to context priority
 * @param {string} [module.entity] - Primary entity name if applicable
 * @param {boolean} [module.hasDemoData] - Must always be false (Zero Demo Policy)
 */
export function registerModule(module) {
  if (!module.id) throw new Error("Module registration requires an id");
  if (module.hasDemoData) {
    throw new Error(`Module "${module.id}" violates Zero Demo Policy`);
  }
  if (REGISTRY.has(module.id)) {
    // Module already registered — do not duplicate, return existing
    return REGISTRY.get(module.id);
  }
  REGISTRY.set(module.id, { ...module, layer: "shared-modules", registeredAt: Date.now() });
  notify();
  return REGISTRY.get(module.id);
}

/**
 * Get a module by ID.
 */
export function getModule(id) {
  return REGISTRY.get(id);
}

/**
 * Get all registered modules.
 */
export function getRegisteredModules() {
  return Array.from(REGISTRY.values());
}

/**
 * Get modules by category.
 */
export function getModulesByCategory(category) {
  return getRegisteredModules().filter((m) => m.category === category);
}

/**
 * Get modules consumed by a specific experience.
 */
export function getModulesByExperience(experienceId) {
  return getRegisteredModules().filter((m) => m.consumers?.includes(experienceId));
}

/**
 * Check if a module is registered.
 */
export function isModuleRegistered(id) {
  return REGISTRY.has(id);
}

/**
 * Subscribe to registry changes.
 * @returns {Function} Unsubscribe function
 */
export function subscribeToModules(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Core Module Definitions ──────────────────────────────────────────────
// These are the canonical shared modules. Each is built once and reused.

export const CORE_MODULES = [
  // Content modules
  { id: "posts", name: "Posts", category: "content", authority: "Creator", entity: "QuadPost", requiresContext: true },
  { id: "stories", name: "Stories", category: "content", authority: "Creator", entity: "Story", requiresContext: true },
  { id: "podcasts", name: "Podcasts", category: "content", authority: "Creator", entity: "Podcast", requiresContext: true },
  { id: "live", name: "Live", category: "content", authority: "Creator", entity: "LiveStream", requiresContext: true },
  { id: "videos", name: "Short Videos", category: "content", authority: "Creator", entity: "ShortVideo", requiresContext: true },
  { id: "media", name: "Media", category: "content", authority: "Creator", requiresContext: false },
  { id: "files", name: "Files", category: "content", authority: "Creator", entity: "AcademicFile", requiresContext: false },

  // Community modules
  { id: "communities", name: "Communities", category: "community", authority: "CommunityBuilder", entity: "Community", requiresContext: true },
  { id: "clubs", name: "Clubs", category: "community", authority: "CommunityBuilder", entity: "Club", requiresContext: true },
  { id: "discussions", name: "Discussions", category: "community", authority: "CommunityBuilder", requiresContext: false },
  { id: "resources", name: "Resources", category: "community", authority: "CommunityBuilder", entity: "StudyGroupResource", requiresContext: false },
  { id: "events", name: "Events", category: "community", authority: "CommunityBuilder", entity: "CampusEvent", requiresContext: true },
  { id: "announcements", name: "Announcements", category: "community", authority: "CommunityBuilder", requiresContext: false },
  { id: "members", name: "Members", category: "community", authority: "CommunityBuilder", requiresContext: false },

  // Communication modules
  { id: "messages", name: "Messages", category: "communication", authority: "Automator", entity: "Message", requiresContext: false },
  { id: "conversations", name: "Conversations", category: "communication", authority: "Automator", entity: "Conversation", requiresContext: false },
  { id: "calls", name: "Calls", category: "communication", authority: "Automator", requiresContext: false },

  // Identity modules
  { id: "student-profile", name: "Student Profile", category: "identity", authority: "Scribe", requiresContext: false },
  { id: "educator-profile", name: "Educator Profile", category: "identity", authority: "Scribe", requiresContext: false },
  { id: "institution-profile", name: "Institution Profile", category: "identity", authority: "Scribe", requiresContext: false },
  { id: "public-profiles", name: "Public Profiles", category: "identity", authority: "Scribe", requiresContext: false },

  // Discovery modules
  { id: "search", name: "Universal Search", category: "discovery", authority: "Scholar", requiresContext: false },
  { id: "notifications", name: "Notifications", category: "discovery", authority: "Monitor", entity: "Notification", requiresContext: false },
  { id: "recommendations", name: "Recommendations", category: "discovery", authority: "Analyst", requiresContext: true },
];

// Auto-register core modules
CORE_MODULES.forEach((mod) => {
  registerModule({
    ...mod,
    consumers: [],
    hasDemoData: false,
  });
});