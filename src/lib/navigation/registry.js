/**
 * UNIBUD Navigation OS — Primary Navigation Registry
 *
 * Single source of truth for the five primary destinations.
 * Bud is NOT a destination — it lives inside Me and the Command Bar.
 *
 * Primary destinations (spec-compliant):
 *   1. Square   — Global discovery
 *   2. Quad     — Campus Operating System
 *   3. Connect  — Communication
 *   4. Me       — Personal Operating System (includes Bud Home)
 *
 * Note: The manifest uses "campus" for the academic experience; the spec
 * calls the academic + social campus OS "Quad". Both /quad and /campus
 * are registered under the Quad destination for backward compatibility.
 */

// ─── Primary Destinations ────────────────────────────────────────────────────

export const PRIMARY_DESTINATIONS = [
  {
    id: "square",
    label: "Square",
    to: "/square",
    icon: "LayoutGrid",
    description: "Global discovery — news, communities, trending, podcasts, movies, anime, sports, marketplace, events, challenges, creators",
    subRoutes: [
      "/square",
      "/discover",
      "/social",
      "/scholar",
      "/football",
      "/highlights",
      "/games",
      "/shorts",
      "/podcasts",
      "/challenges",
      "/communities",
      "/community",
      "/marketplace",
      "/lost-found",
      "/events",
      "/following",
    ],
  },
  {
    id: "quad",
    label: "Quad",
    to: "/quad",
    icon: "GraduationCap",
    description: "Campus Operating System — academic + social campus life",
    subRoutes: [
      "/quad",
      "/campus",
      "/academics",
      "/courses",
      "/course",
      "/assignments",
      "/projects",
      "/library",
      "/research",
      "/timetable",
      "/calendar",
      "/exams",
      "/exam",
      "/study-groups",
      "/study",
      "/study-sessions",
      "/notes",
      "/attendance",
      "/smart-attendance",
      "/gpa-calculator",
      "/academic-timeline",
      "/agenda",
      "/office-hours",
      "/achievements",
      "/knowledge",
      "/classroom",
      "/live",
      "/clubs",
      "/student-government",
      "/campus-map",
      "/campus-services",
      "/digital-id",
      "/organization",
      "/university",
      "/tutor-hub",
      "/collaboration",
      "/tasks",
      "/mentorship",
      "/mentor",
    ],
  },
  {
    id: "connect",
    label: "Connect",
    to: "/connect",
    icon: "MessageCircle",
    description: "Communication — messaging, calls, groups, study rooms, mentorship, networking, collaboration",
    subRoutes: [
      "/connect",
      "/messages",
      "/communication",
      "/call",
      "/live",
      "/recast",
    ],
  },
  {
    id: "me",
    label: "Me",
    to: "/me",
    icon: "User",
    description: "Personal Operating System — profile, identity, settings, portfolio, achievements, wallet, preferences, notifications, privacy, Bud Home",
    subRoutes: [
      "/me",
      "/home",
      "/briefing",
      "/profile",
      "/settings",
      "/notifications",
      "/smart-notifications",
      "/bud",
      "/wallet",
      "/wallet-v2",
      "/portfolio",
      "/cv-builder",
      "/scholarships",
      "/opportunities",
      "/career",
      "/career-center",
      "/companies",
      "/memory",
      "/safety",
      "/help",
      "/directory",
      "/friends",
      "/student-support",
      "/hub",
      "/interests",
      "/accessibility",
      "/weather",
    ],
  },
];

// ─── Destination lookup helpers ───────────────────────────────────────────────

/**
 * Get a destination by its ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getDestination(id) {
  return PRIMARY_DESTINATIONS.find((d) => d.id === id);
}

/**
 * Resolve which primary destination owns a given pathname.
 * Returns null if no destination claims the path.
 * @param {string} pathname
 * @returns {Object|null}
 */
export function getDestinationByRoute(pathname) {
  // Exact match first
  for (const dest of PRIMARY_DESTINATIONS) {
    if (dest.to === pathname) return dest;
  }
  // Prefix match
  for (const dest of PRIMARY_DESTINATIONS) {
    for (const sub of dest.subRoutes) {
      if (pathname === sub || pathname.startsWith(sub + "/")) return dest;
    }
  }
  return null;
}

/**
 * Returns the four tab items for the primary nav bar.
 * (Square, Quad, Connect, Me)
 */
export function getPrimaryTabs() {
  return PRIMARY_DESTINATIONS.map(({ id, label, to, icon }) => ({
    id,
    label,
    to,
    icon,
  }));
}

// ─── Bud access points (Bud is NOT a nav tab) ────────────────────────────────

export const BUD_ACCESS_POINTS = [
  "me",          // Bud lives inside Me as Bud Home (/home)
  "command-bar", // Universal Command Bar (Cmd+K / long-press)
  "voice",       // Voice activation
  "search",      // Universal Search triggers Bud
  "quick-action",// Quick Action suggestions
];
