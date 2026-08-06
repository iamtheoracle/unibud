/**
 * UNIBUD OS v4 — Experience Registry
 *
 * Each experience declares only:
 *   - modules it consumes
 *   - permissions required
 *   - context behavior
 *   - entry points
 *
 * An experience NEVER owns infrastructure.
 * References: OS Constitution, Layered Architecture.
 */

import { EXPERIENCES } from "@/lib/os/manifest";

const REGISTRY = new Map();

/**
 * Register an experience configuration.
 * @param {Object} experience - Experience definition
 * @param {string} experience.id - Experience ID (must match manifest)
 * @param {string[]} experience.modules - Module IDs this experience consumes
 * @param {string[]} experience.permissions - Required permissions
 * @param {Object} experience.contextBehavior - How context affects this experience
 * @param {string[]} experience.entryPoints - Route paths that enter this experience
 */
export function registerExperience(experience) {
  const manifestExp = EXPERIENCES.find((e) => e.id === experience.id);
  if (!manifestExp) {
    throw new Error(`Experience "${experience.id}" is not a valid experience. Valid experiences: ${EXPERIENCES.map((e) => e.id).join(", ")}`);
  }
  REGISTRY.set(experience.id, {
    ...experience,
    layer: "experiences",
    manifest: manifestExp,
    registeredAt: Date.now(),
  });
  return REGISTRY.get(experience.id);
}

/**
 * Get an experience configuration by ID.
 */
export function getExperience(id) {
  return REGISTRY.get(id);
}

/**
 * Get all registered experiences.
 */
export function getRegisteredExperiences() {
  return Array.from(REGISTRY.values());
}

/**
 * Get the experience that owns a given route path.
 */
export function getExperienceByRoute(pathname) {
  for (const exp of REGISTRY.values()) {
    if (exp.entryPoints?.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
      return exp;
    }
  }
  return null;
}

/**
 * Get modules consumed by an experience.
 */
export function getExperienceModules(experienceId) {
  const exp = REGISTRY.get(experienceId);
  return exp?.modules || [];
}

// ─── Register the Seven Permanent Experiences ────────────────────────────

registerExperience({
  id: "square",
  modules: ["posts", "stories", "communities", "podcasts", "live", "videos", "media", "events", "announcements"],
  permissions: ["read:posts", "create:posts", "read:communities"],
  contextBehavior: {
    academic: "Prioritize academic communities and campus events",
    social: "Prioritize feed, stories, and media",
    hybrid: "Balanced presentation",
  },
  entryPoints: ["/square", "/social", "/quad"],
});

registerExperience({
  id: "campus",
  modules: ["files", "resources", "events", "announcements", "discussions", "members"],
  permissions: ["read:courses", "read:assignments", "read:grades"],
  contextBehavior: {
    academic: "Prioritize timetable, assignments, notes, and research",
    social: "Prioritize upcoming classes and deadlines",
    hybrid: "Balanced academic and social content",
  },
  entryPoints: ["/campus", "/academics", "/courses", "/assignments", "/timetable", "/exams", "/notes", "/attendance"],
});

registerExperience({
  id: "quad",
  modules: ["search", "recommendations", "events", "communities", "posts", "announcements"],
  permissions: ["read:all"],
  contextBehavior: {
    academic: "Prioritize academic opportunities and campus events",
    social: "Prioritize trending content and community activity",
    hybrid: "Balanced discovery across all content",
  },
  entryPoints: ["/quad", "/discover", "/following"],
});

registerExperience({
  id: "connect",
  modules: ["messages", "conversations", "calls", "communities", "members"],
  permissions: ["read:messages", "create:messages", "read:conversations"],
  contextBehavior: {
    academic: "Prioritize academic group discussions",
    social: "Prioritize social messages and calls",
    hybrid: "Balanced communication",
  },
  entryPoints: ["/connect", "/messages", "/communities", "/community"],
});

registerExperience({
  id: "lens",
  modules: ["search", "recommendations", "notifications"],
  permissions: ["read:all"],
  contextBehavior: {
    academic: "Surface academic search and quick actions",
    social: "Surface social search and quick actions",
    hybrid: "Surface all search and quick actions",
  },
  entryPoints: ["/lens"],
});

registerExperience({
  id: "services",
  modules: [], // Services are dynamically composed from hiddenServiceRegistry
  permissions: ["read:services"],
  contextBehavior: {
    academic: "Surface academic services (printing, library, study rooms)",
    social: "Surface social services (food, events, marketplace)",
    hybrid: "Surface all available services",
  },
  entryPoints: ["/services"],
});

registerExperience({
  id: "me",
  modules: ["student-profile", "public-profiles", "notifications", "recommendations"],
  permissions: ["read:own-profile", "update:own-profile"],
  contextBehavior: {
    academic: "Prioritize academic identity and achievements",
    social: "Prioritize social identity and activity",
    hybrid: "Balanced identity presentation",
  },
  entryPoints: ["/me", "/profile", "/settings", "/digital-id"],
});