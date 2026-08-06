/**
 * UNIBUD Navigation OS — Route Registry
 *
 * Maps every route path to its parent destination, title, breadcrumb chain,
 * deep-link pattern, and whether it supports deep linking.
 *
 * This is the single authoritative mapping of the entire route tree.
 * App.jsx derives its structure from this registry.
 */

import { getDestinationByRoute } from "./registry";

/**
 * @typedef {Object} RouteDefinition
 * @property {string}   path        - React Router path (may include :params)
 * @property {string}   title       - Human-readable page title
 * @property {string}   destination - Parent destination ID
 * @property {string[]} breadcrumb  - ["Destination", "Section", "Page"]
 * @property {string}   deepLink    - Deep link pattern (e.g. "unibud://course/:courseId")
 * @property {boolean}  deepLinkable - Whether this route supports deep linking
 * @property {boolean}  authRequired - Whether authentication is required
 */

/** @type {RouteDefinition[]} */
export const ROUTE_REGISTRY = [
  // ─── Auth / Onboarding (no destination) ─────────────────────────────────
  { path: "/", title: "Splash", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/welcome", title: "Welcome", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/register", title: "Register", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/login", title: "Sign In", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/meet-bud", title: "Meet Bud", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/mode-select", title: "Choose Mode", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/forgot-password", title: "Forgot Password", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/reset-password", title: "Reset Password", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/onboarding/conversation", title: "Onboarding", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/onboarding/security", title: "Security Setup", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/onboarding/preparing", title: "Preparing UNIBUD", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/onboarding/university", title: "Choose University", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },

  // ─── Legal (public, no destination) ─────────────────────────────────────
  { path: "/privacy", title: "Privacy Policy", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/terms", title: "Terms of Service", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },
  { path: "/about", title: "About UNIBUD", destination: null, breadcrumb: [], deepLink: null, deepLinkable: false, authRequired: false },

  // ─── Square ──────────────────────────────────────────────────────────────
  { path: "/square", title: "Square", destination: "square", breadcrumb: ["Square"], deepLink: "unibud://square", deepLinkable: true, authRequired: true },
  { path: "/discover", title: "Discover", destination: "square", breadcrumb: ["Square", "Discover"], deepLink: "unibud://discover", deepLinkable: true, authRequired: true },
  { path: "/social", title: "Social", destination: "square", breadcrumb: ["Square", "Social"], deepLink: "unibud://social", deepLinkable: true, authRequired: true },
  { path: "/highlights", title: "Highlights", destination: "square", breadcrumb: ["Square", "Highlights"], deepLink: "unibud://highlights", deepLinkable: true, authRequired: true },
  { path: "/shorts", title: "Shorts", destination: "square", breadcrumb: ["Square", "Shorts"], deepLink: "unibud://shorts", deepLinkable: true, authRequired: true },
  { path: "/podcasts", title: "Podcasts", destination: "square", breadcrumb: ["Square", "Podcasts"], deepLink: "unibud://podcasts", deepLinkable: true, authRequired: true },
  { path: "/podcasts/:showId", title: "Podcast Show", destination: "square", breadcrumb: ["Square", "Podcasts", "Show"], deepLink: "unibud://podcasts/:showId", deepLinkable: true, authRequired: true },
  { path: "/challenges", title: "Challenges", destination: "square", breadcrumb: ["Square", "Challenges"], deepLink: "unibud://challenges", deepLinkable: true, authRequired: true },
  { path: "/communities", title: "Communities", destination: "square", breadcrumb: ["Square", "Communities"], deepLink: "unibud://communities", deepLinkable: true, authRequired: true },
  { path: "/community/:communityId", title: "Community", destination: "square", breadcrumb: ["Square", "Communities", "Community"], deepLink: "unibud://community/:communityId", deepLinkable: true, authRequired: true },
  { path: "/marketplace", title: "Marketplace", destination: "square", breadcrumb: ["Square", "Marketplace"], deepLink: "unibud://marketplace", deepLinkable: true, authRequired: true },
  { path: "/lost-found", title: "Lost & Found", destination: "square", breadcrumb: ["Square", "Lost & Found"], deepLink: "unibud://lost-found", deepLinkable: true, authRequired: true },
  { path: "/events", title: "Events", destination: "square", breadcrumb: ["Square", "Events"], deepLink: "unibud://events", deepLinkable: true, authRequired: true },
  { path: "/following", title: "Following", destination: "square", breadcrumb: ["Square", "Following"], deepLink: "unibud://following", deepLinkable: true, authRequired: true },
  { path: "/scholar", title: "Scholar", destination: "square", breadcrumb: ["Square", "Scholar"], deepLink: "unibud://scholar", deepLinkable: true, authRequired: true },
  { path: "/football", title: "Football", destination: "square", breadcrumb: ["Square", "Sports", "Football"], deepLink: "unibud://football", deepLinkable: true, authRequired: true },
  { path: "/games", title: "Games", destination: "square", breadcrumb: ["Square", "Games"], deepLink: "unibud://games", deepLinkable: true, authRequired: true },
  { path: "/creator-studio", title: "Creator Studio", destination: "square", breadcrumb: ["Square", "Creator Studio"], deepLink: "unibud://creator-studio", deepLinkable: true, authRequired: true },
  { path: "/studio", title: "Media Studio", destination: "square", breadcrumb: ["Square", "Media Studio"], deepLink: "unibud://studio", deepLinkable: true, authRequired: true },

  // ─── Quad (Academic + Campus Social) ────────────────────────────────────
  { path: "/quad", title: "Quad", destination: "quad", breadcrumb: ["Quad"], deepLink: "unibud://quad", deepLinkable: true, authRequired: true },
  { path: "/campus", title: "Campus", destination: "quad", breadcrumb: ["Quad", "Campus"], deepLink: "unibud://campus", deepLinkable: true, authRequired: true },
  { path: "/academics", title: "Academics", destination: "quad", breadcrumb: ["Quad", "Academics"], deepLink: "unibud://academics", deepLinkable: true, authRequired: true },
  { path: "/academics/insights", title: "Academic Insights", destination: "quad", breadcrumb: ["Quad", "Academics", "Insights"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/academics/files", title: "Academic Files", destination: "quad", breadcrumb: ["Quad", "Academics", "Files"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/academics/results", title: "Results", destination: "quad", breadcrumb: ["Quad", "Academics", "Results"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/academics/report", title: "Summary Report", destination: "quad", breadcrumb: ["Quad", "Academics", "Report"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/courses", title: "Courses", destination: "quad", breadcrumb: ["Quad", "Courses"], deepLink: "unibud://courses", deepLinkable: true, authRequired: true },
  { path: "/course/:courseId", title: "Course", destination: "quad", breadcrumb: ["Quad", "Courses", "Course"], deepLink: "unibud://course/:courseId", deepLinkable: true, authRequired: true },
  { path: "/assignments", title: "Assignments", destination: "quad", breadcrumb: ["Quad", "Assignments"], deepLink: "unibud://assignments", deepLinkable: true, authRequired: true },
  { path: "/projects", title: "Projects", destination: "quad", breadcrumb: ["Quad", "Projects"], deepLink: "unibud://projects", deepLinkable: true, authRequired: true },
  { path: "/library", title: "Library", destination: "quad", breadcrumb: ["Quad", "Library"], deepLink: "unibud://library", deepLinkable: true, authRequired: true },
  { path: "/research", title: "Research", destination: "quad", breadcrumb: ["Quad", "Research"], deepLink: "unibud://research", deepLinkable: true, authRequired: true },
  { path: "/timetable", title: "Timetable", destination: "quad", breadcrumb: ["Quad", "Timetable"], deepLink: "unibud://timetable", deepLinkable: true, authRequired: true },
  { path: "/calendar", title: "Calendar", destination: "quad", breadcrumb: ["Quad", "Calendar"], deepLink: "unibud://calendar", deepLinkable: true, authRequired: true },
  { path: "/exams", title: "Exams", destination: "quad", breadcrumb: ["Quad", "Exams"], deepLink: "unibud://exams", deepLinkable: true, authRequired: true },
  { path: "/exam", title: "Exam Hub", destination: "quad", breadcrumb: ["Quad", "Exams"], deepLink: "unibud://exam", deepLinkable: true, authRequired: true },
  { path: "/exam/start/:paperId", title: "Start Exam", destination: "quad", breadcrumb: ["Quad", "Exams", "Start"], deepLink: "unibud://exam/start/:paperId", deepLinkable: true, authRequired: true },
  { path: "/exam/take/:attemptId", title: "Exam", destination: "quad", breadcrumb: ["Quad", "Exams", "Take"], deepLink: "unibud://exam/take/:attemptId", deepLinkable: true, authRequired: true },
  { path: "/exam/result/:attemptId", title: "Exam Result", destination: "quad", breadcrumb: ["Quad", "Exams", "Result"], deepLink: "unibud://exam/result/:attemptId", deepLinkable: true, authRequired: true },
  { path: "/exam/analytics", title: "Exam Analytics", destination: "quad", breadcrumb: ["Quad", "Exams", "Analytics"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/exam/coach", title: "Exam Coach", destination: "quad", breadcrumb: ["Quad", "Exams", "Coach"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/attendance", title: "Attendance", destination: "quad", breadcrumb: ["Quad", "Attendance"], deepLink: "unibud://attendance", deepLinkable: true, authRequired: true },
  { path: "/smart-attendance", title: "Smart Attendance", destination: "quad", breadcrumb: ["Quad", "Attendance"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/gpa-calculator", title: "GPA Calculator", destination: "quad", breadcrumb: ["Quad", "GPA Calculator"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/notes", title: "Notes", destination: "quad", breadcrumb: ["Quad", "Notes"], deepLink: "unibud://notes", deepLinkable: true, authRequired: true },
  { path: "/study-groups", title: "Study Groups", destination: "quad", breadcrumb: ["Quad", "Study Groups"], deepLink: "unibud://study-groups", deepLinkable: true, authRequired: true },
  { path: "/study-groups/:groupId", title: "Study Group", destination: "quad", breadcrumb: ["Quad", "Study Groups", "Group"], deepLink: "unibud://study-groups/:groupId", deepLinkable: true, authRequired: true },
  { path: "/study", title: "Study", destination: "quad", breadcrumb: ["Quad", "Study"], deepLink: "unibud://study", deepLinkable: true, authRequired: true },
  { path: "/study/suite", title: "Study Suite", destination: "quad", breadcrumb: ["Quad", "Study", "Suite"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/planner", title: "Study Planner", destination: "quad", breadcrumb: ["Quad", "Study", "Planner"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/paths", title: "Learning Paths", destination: "quad", breadcrumb: ["Quad", "Study", "Learning Paths"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/assignment", title: "Assignment Assistant", destination: "quad", breadcrumb: ["Quad", "Study", "Assignment Assistant"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/project", title: "Project Assistant", destination: "quad", breadcrumb: ["Quad", "Study", "Project Assistant"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/notes", title: "Smart Notes", destination: "quad", breadcrumb: ["Quad", "Study", "Smart Notes"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/research", title: "Research Assistant", destination: "quad", breadcrumb: ["Quad", "Study", "Research Assistant"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/exams", title: "Exam Preparation", destination: "quad", breadcrumb: ["Quad", "Study", "Exam Prep"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/flashcards", title: "Flashcards", destination: "quad", breadcrumb: ["Quad", "Study", "Flashcards"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/practice", title: "Practice Tests", destination: "quad", breadcrumb: ["Quad", "Study", "Practice Tests"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/citations", title: "Citations", destination: "quad", breadcrumb: ["Quad", "Study", "Citations"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study/library", title: "Document Library", destination: "quad", breadcrumb: ["Quad", "Study", "Library"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/study-sessions", title: "Study Sessions", destination: "quad", breadcrumb: ["Quad", "Study Sessions"], deepLink: "unibud://study-sessions", deepLinkable: true, authRequired: true },
  { path: "/academic-timeline", title: "Academic Timeline", destination: "quad", breadcrumb: ["Quad", "Timeline"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/agenda", title: "Agenda", destination: "quad", breadcrumb: ["Quad", "Agenda"], deepLink: "unibud://agenda", deepLinkable: true, authRequired: true },
  { path: "/office-hours", title: "Office Hours", destination: "quad", breadcrumb: ["Quad", "Office Hours"], deepLink: "unibud://office-hours", deepLinkable: true, authRequired: true },
  { path: "/achievements", title: "Achievements", destination: "quad", breadcrumb: ["Quad", "Achievements"], deepLink: "unibud://achievements", deepLinkable: true, authRequired: true },
  { path: "/achievements/gallery", title: "Achievement Gallery", destination: "quad", breadcrumb: ["Quad", "Achievements", "Gallery"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/knowledge", title: "Knowledge Hub", destination: "quad", breadcrumb: ["Quad", "Knowledge"], deepLink: "unibud://knowledge", deepLinkable: true, authRequired: true },
  { path: "/classroom/:classId", title: "Classroom", destination: "quad", breadcrumb: ["Quad", "Classroom"], deepLink: "unibud://classroom/:classId", deepLinkable: true, authRequired: true },
  { path: "/clubs", title: "Clubs", destination: "quad", breadcrumb: ["Quad", "Clubs"], deepLink: "unibud://clubs", deepLinkable: true, authRequired: true },
  { path: "/student-government", title: "Student Government", destination: "quad", breadcrumb: ["Quad", "Student Government"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/campus-map", title: "Campus Map", destination: "quad", breadcrumb: ["Quad", "Campus Map"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/campus-services", title: "Campus Services", destination: "quad", breadcrumb: ["Quad", "Campus Services"], deepLink: "unibud://campus-services", deepLinkable: true, authRequired: true },
  { path: "/digital-id", title: "Digital ID", destination: "quad", breadcrumb: ["Quad", "Digital ID"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/organization/:clubId", title: "Organization", destination: "quad", breadcrumb: ["Quad", "Organizations", "Organization"], deepLink: "unibud://organization/:clubId", deepLinkable: true, authRequired: true },
  { path: "/university", title: "University", destination: "quad", breadcrumb: ["Quad", "University"], deepLink: "unibud://university", deepLinkable: true, authRequired: true },
  { path: "/tutor-hub", title: "Tutor Hub", destination: "quad", breadcrumb: ["Quad", "Tutor Hub"], deepLink: "unibud://tutor-hub", deepLinkable: true, authRequired: true },
  { path: "/collaboration", title: "Collaboration", destination: "quad", breadcrumb: ["Quad", "Collaboration"], deepLink: "unibud://collaboration", deepLinkable: true, authRequired: true },
  { path: "/collaboration/:workspaceId", title: "Workspace", destination: "quad", breadcrumb: ["Quad", "Collaboration", "Workspace"], deepLink: "unibud://collaboration/:workspaceId", deepLinkable: true, authRequired: true },
  { path: "/tasks", title: "Tasks", destination: "quad", breadcrumb: ["Quad", "Tasks"], deepLink: "unibud://tasks", deepLinkable: true, authRequired: true },
  { path: "/tasks/:taskId", title: "Task", destination: "quad", breadcrumb: ["Quad", "Tasks", "Task"], deepLink: "unibud://tasks/:taskId", deepLinkable: true, authRequired: true },
  { path: "/mentorship", title: "Mentorship", destination: "quad", breadcrumb: ["Quad", "Mentorship"], deepLink: "unibud://mentorship", deepLinkable: true, authRequired: true },
  { path: "/mentor/:mentorId", title: "Mentor", destination: "quad", breadcrumb: ["Quad", "Mentorship", "Mentor"], deepLink: "unibud://mentor/:mentorId", deepLinkable: true, authRequired: true },
  { path: "/settings/calendar-sync", title: "Calendar Sync", destination: "quad", breadcrumb: ["Quad", "Settings", "Calendar Sync"], deepLink: null, deepLinkable: false, authRequired: true },

  // ─── Connect ─────────────────────────────────────────────────────────────
  { path: "/connect", title: "Connect", destination: "connect", breadcrumb: ["Connect"], deepLink: "unibud://connect", deepLinkable: true, authRequired: true },
  { path: "/messages", title: "Messages", destination: "connect", breadcrumb: ["Connect", "Messages"], deepLink: "unibud://messages", deepLinkable: true, authRequired: true },
  { path: "/messages/:conversationId", title: "Conversation", destination: "connect", breadcrumb: ["Connect", "Messages", "Conversation"], deepLink: "unibud://messages/:conversationId", deepLinkable: true, authRequired: true },
  { path: "/communication", title: "Communication Hub", destination: "connect", breadcrumb: ["Connect", "Communication"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/call", title: "Call", destination: "connect", breadcrumb: ["Connect", "Call"], deepLink: "unibud://call", deepLinkable: true, authRequired: true },
  { path: "/call/:contactId", title: "Call", destination: "connect", breadcrumb: ["Connect", "Call"], deepLink: "unibud://call/:contactId", deepLinkable: true, authRequired: true },
  { path: "/live", title: "Live Stream", destination: "connect", breadcrumb: ["Connect", "Live"], deepLink: "unibud://live", deepLinkable: true, authRequired: true },
  { path: "/live/:streamId", title: "Live Stream", destination: "connect", breadcrumb: ["Connect", "Live", "Stream"], deepLink: "unibud://live/:streamId", deepLinkable: true, authRequired: true },
  { path: "/recast", title: "Recast", destination: "connect", breadcrumb: ["Connect", "Recast"], deepLink: null, deepLinkable: false, authRequired: true },

  // ─── Me ──────────────────────────────────────────────────────────────────
  { path: "/me", title: "Me", destination: "me", breadcrumb: ["Me"], deepLink: "unibud://me", deepLinkable: true, authRequired: true },
  { path: "/home", title: "Bud", destination: "me", breadcrumb: ["Me", "Bud"], deepLink: "unibud://home", deepLinkable: true, authRequired: true },
  { path: "/briefing", title: "Daily Briefing", destination: "me", breadcrumb: ["Me", "Bud", "Briefing"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/profile/:profileId", title: "Profile", destination: "me", breadcrumb: ["Me", "Profile"], deepLink: "unibud://profile/:profileId", deepLinkable: true, authRequired: true },
  { path: "/settings", title: "Settings", destination: "me", breadcrumb: ["Me", "Settings"], deepLink: "unibud://settings", deepLinkable: true, authRequired: true },
  { path: "/settings/connected-accounts", title: "Connected Accounts", destination: "me", breadcrumb: ["Me", "Settings", "Connected Accounts"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/notifications", title: "Notifications", destination: "me", breadcrumb: ["Me", "Notifications"], deepLink: "unibud://notifications", deepLinkable: true, authRequired: true },
  { path: "/smart-notifications", title: "Smart Notifications", destination: "me", breadcrumb: ["Me", "Notifications"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/bud/notifications", title: "Bud Notification Preferences", destination: "me", breadcrumb: ["Me", "Bud", "Notifications"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/wallet", title: "Wallet", destination: "me", breadcrumb: ["Me", "Wallet"], deepLink: "unibud://wallet", deepLinkable: true, authRequired: true },
  { path: "/wallet-v2", title: "Wallet", destination: "me", breadcrumb: ["Me", "Wallet"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/portfolio", title: "Portfolio", destination: "me", breadcrumb: ["Me", "Portfolio"], deepLink: "unibud://portfolio", deepLinkable: true, authRequired: true },
  { path: "/cv-builder", title: "CV Builder", destination: "me", breadcrumb: ["Me", "CV Builder"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/scholarships", title: "Scholarships", destination: "me", breadcrumb: ["Me", "Scholarships"], deepLink: "unibud://scholarships", deepLinkable: true, authRequired: true },
  { path: "/opportunities", title: "Opportunities", destination: "me", breadcrumb: ["Me", "Opportunities"], deepLink: "unibud://opportunities", deepLinkable: true, authRequired: true },
  { path: "/career", title: "Career Hub", destination: "me", breadcrumb: ["Me", "Career"], deepLink: "unibud://career", deepLinkable: true, authRequired: true },
  { path: "/career-center", title: "Career Center", destination: "me", breadcrumb: ["Me", "Career", "Center"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/companies", title: "Companies", destination: "me", breadcrumb: ["Me", "Career", "Companies"], deepLink: "unibud://companies", deepLinkable: true, authRequired: true },
  { path: "/memory", title: "Memory Dashboard", destination: "me", breadcrumb: ["Me", "Memory"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/safety", title: "Safety Center", destination: "me", breadcrumb: ["Me", "Safety"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/help", title: "Help Center", destination: "me", breadcrumb: ["Me", "Help"], deepLink: "unibud://help", deepLinkable: true, authRequired: true },
  { path: "/directory", title: "Directory", destination: "me", breadcrumb: ["Me", "Directory"], deepLink: "unibud://directory", deepLinkable: true, authRequired: true },
  { path: "/friends", title: "Friends", destination: "me", breadcrumb: ["Me", "Friends"], deepLink: "unibud://friends", deepLinkable: true, authRequired: true },
  { path: "/student-support", title: "Student Support", destination: "me", breadcrumb: ["Me", "Support"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/hub/:hubId", title: "Hub", destination: "me", breadcrumb: ["Me", "Hub"], deepLink: "unibud://hub/:hubId", deepLinkable: true, authRequired: true },
  { path: "/interests", title: "Interests", destination: "me", breadcrumb: ["Me", "Settings", "Interests"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/accessibility", title: "Accessibility", destination: "me", breadcrumb: ["Me", "Settings", "Accessibility"], deepLink: null, deepLinkable: false, authRequired: true },
  { path: "/weather", title: "Weather", destination: "me", breadcrumb: ["Me", "Weather"], deepLink: null, deepLinkable: false, authRequired: true },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Build a lookup map for O(1) access by exact path */
const _exactMap = new Map(ROUTE_REGISTRY.map((r) => [r.path, r]));

/**
 * Get route definition by exact path (params stripped).
 * For parameterized routes, pass the pattern (e.g. "/course/:courseId").
 */
export function getRouteByPath(path) {
  return _exactMap.get(path) || null;
}

/**
 * Resolve route metadata for a live pathname (e.g. "/course/abc-123").
 * Matches against parameterized patterns and returns the best match.
 */
export function resolveRoute(pathname) {
  // Try exact first
  if (_exactMap.has(pathname)) return _exactMap.get(pathname);

  // Try pattern match — replace path segments with :param where needed
  for (const route of ROUTE_REGISTRY) {
    if (!route.path.includes(":")) continue;
    const regex = new RegExp(
      "^" + route.path.replace(/:[^/]+/g, "[^/]+") + "(/.*)?$"
    );
    if (regex.test(pathname)) return route;
  }

  // Fallback: try destination lookup from registry
  const dest = getDestinationByRoute(pathname);
  if (dest) {
    return {
      path: pathname,
      title: dest.label,
      destination: dest.id,
      breadcrumb: [dest.label],
      deepLink: null,
      deepLinkable: false,
      authRequired: true,
    };
  }

  return null;
}

/**
 * Get all deep-linkable routes.
 */
export function getDeepLinkableRoutes() {
  return ROUTE_REGISTRY.filter((r) => r.deepLinkable);
}

/**
 * Get all routes belonging to a primary destination.
 */
export function getRoutesByDestination(destinationId) {
  return ROUTE_REGISTRY.filter((r) => r.destination === destinationId);
}
