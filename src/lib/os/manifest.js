/**
 * UNIBUD OS v4 — Platform Manifest
 *
 * The single source of truth for the operating system in code.
 * References: OS Constitution, Layered Architecture, Shared Module Constitution,
 * AI Constitution, Engineering Constitution.
 *
 * This manifest replaces all prior navigation/platform configurations.
 */

// ─── The Five Experiences (permanent navigation) ──────────────────────────
// These never change. Everything else belongs inside them.
export const EXPERIENCES = [
  {
    id: "discovery",
    label: "Discovery",
    to: "/discover",
    icon: "Compass",
    layer: "experiences",
    description: "Discover the ecosystem — people, communities, clubs, events, opportunities, trending, search",
  },
  {
    id: "square",
    label: "Square",
    to: "/square",
    icon: "LayoutGrid",
    layer: "experiences",
    description: "Social timeline — feed, stories, posts, photos, videos, comments, reactions, creator content",
  },
  {
    id: "connect",
    label: "Connect",
    to: "/connect",
    icon: "MessageCircle",
    layer: "experiences",
    description: "Communication — messages, group chats, study groups, calls, collaboration, notifications",
  },
  {
    id: "campus",
    label: "Campus",
    to: "/campus",
    icon: "GraduationCap",
    layer: "experiences",
    description: "Academic life — courses, GPA, timetable, assignments, exams, attendance, projects, study AI",
  },
  {
    id: "me",
    label: "Me",
    to: "/me",
    icon: "User",
    layer: "experiences",
    description: "Identity — profile, academics, social, achievements, portfolio, activity, analytics, settings",
  },
];

// ─── Context-Specific Navigation (OS v5) ──────────────────────────────────
// The bottom navigation changes based on the active world (Social/Academics).
// Me is permanently fixed in both worlds. Connect exists in both, content adapts.
export const CONTEXT_NAVIGATION = {
  social: {
    id: "social",
    label: "Social",
    home: "/square",
    tabs: [
      { id: "square", label: "Square", to: "/square", icon: "LayoutGrid" },
      { id: "discover", label: "Discover", to: "/discover", icon: "Compass" },
      { id: "connect", label: "Connect", to: "/connect", icon: "MessageCircle" },
      { id: "me", label: "Me", to: "/me", icon: "User" },
    ],
  },
  academics: {
    id: "academics",
    label: "Academics",
    home: "/campus",
    tabs: [
      { id: "campus", label: "Campus", to: "/campus", icon: "GraduationCap" },
      { id: "quad", label: "Quad", to: "/quad", icon: "Grid3x3" },
      { id: "connect", label: "Connect", to: "/connect", icon: "MessageCircle" },
      { id: "me", label: "Me", to: "/me", icon: "User" },
    ],
  },
};

// ─── Hidden Product Services ──────────────────────────────────────────────
// Marketplace and Wallet are OS services, not primary destinations.
// Accessed through Discovery, Bud, context-aware actions, and workflows.
export const HIDDEN_SERVICES = [
  {
    id: "marketplace",
    label: "Marketplace",
    to: "/marketplace",
    icon: "ShoppingBag",
    description: "Listings, housing, tutors, campus commerce, orders",
  },
  {
    id: "wallet",
    label: "Wallet",
    to: "/wallet",
    icon: "Wallet",
    description: "Payments, tuition, scholarships, student ID, tickets",
  },
  {
    id: "printing",
    label: "Printing",
    to: "/services/printing",
    icon: "Printer",
    description: "Campus printing services",
  },
  {
    id: "transport",
    label: "Transport",
    to: "/services/transport",
    icon: "Bus",
    description: "Bus routes, shuttle schedules, transport bookings",
  },
  {
    id: "housing",
    label: "Housing",
    to: "/services/housing",
    icon: "Home",
    description: "Accommodation listings and housing services",
  },
  {
    id: "food",
    label: "Food",
    to: "/services/food",
    icon: "UtensilsCrossed",
    description: "Campus dining, food ordering, meal plans",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    to: "/services/healthcare",
    icon: "HeartPulse",
    description: "Campus clinic, health services, appointments",
  },
  {
    id: "student-id",
    label: "Student ID",
    to: "/services/student-id",
    icon: "IdCard",
    description: "Digital student ID, campus credentials",
  },
  {
    id: "campus-utilities",
    label: "Campus Utilities",
    to: "/services/campus-utilities",
    icon: "Plug",
    description: "Electricity, data, laundry, and campus utility services",
  },
];

// ─── Excluded from Navigation ─────────────────────────────────────────────
// These are infrastructure or contextual capabilities, not destinations.
export const EXCLUDED_FROM_NAV = ["bud", "orbit", "spark", "wallet", "marketplace", "quad", "lens", "services"];

// ─── Context System ────────────────────────────────────────────────────────
// Contexts do NOT change navigation. They only reprioritize modules.
export const CONTEXTS = {
  hybrid: {
    id: "hybrid",
    label: "Hybrid",
    description: "Balanced — both academic and social modules at equal priority",
    isDefault: true,
  },
  academic: {
    id: "academic",
    label: "Academic",
    description: "Academic modules prioritized; social modules deprioritized",
    isDefault: false,
  },
  social: {
    id: "social",
    label: "Social",
    description: "Social modules prioritized; academic modules deprioritized",
    isDefault: false,
  },
};

export const DEFAULT_CONTEXT = "hybrid";

// ─── Module Priority by Context ───────────────────────────────────────────
// Each experience defines which modules are high/medium priority per context.
// Low-priority modules remain accessible — nothing disappears.
export const CONTEXT_MODULE_PRIORITY = {
  // Discovery workspace priority shifts
  discovery: {
    academic: {
      high: ["communities", "events", "opportunities", "announcements"],
      medium: ["people", "recommendations", "notifications"],
      low: [],
    },
    social: {
      high: ["people", "trending", "recommendations", "communities"],
      medium: ["events", "opportunities", "notifications"],
      low: [],
    },
    hybrid: {
      high: ["people", "communities", "events", "recommendations"],
      medium: ["trending", "opportunities", "announcements", "notifications"],
      low: [],
    },
  },
  // Square workspace — social timeline
  square: {
    academic: {
      high: ["communities", "events", "announcements"],
      medium: ["posts", "stories", "live", "podcasts"],
      low: ["videos", "media"],
    },
    social: {
      high: ["posts", "stories", "live", "podcasts", "communities"],
      medium: ["events", "creator-content", "comments", "reactions"],
      low: [],
    },
    hybrid: {
      high: ["posts", "communities", "events"],
      medium: ["stories", "podcasts", "live"],
      low: [],
    },
  },
  // Connect workspace — communication
  connect: {
    academic: {
      high: ["communities", "members", "conversations"],
      medium: ["messages", "calls"],
      low: [],
    },
    social: {
      high: ["messages", "calls", "conversations"],
      medium: ["communities", "members", "presence"],
      low: [],
    },
    hybrid: {
      high: ["messages", "communities", "conversations"],
      medium: ["calls", "members", "presence"],
      low: [],
    },
  },
  // Campus workspace — academic life
  campus: {
    academic: {
      high: ["timetable", "assignments", "notes", "research", "scholarships"],
      medium: ["courses", "grades", "exams", "attendance"],
      low: ["campus-events", "social-communities"],
    },
    social: {
      high: ["upcoming-classes", "deadlines"],
      medium: ["timetable", "assignments"],
      low: ["notes", "research", "scholarships"],
    },
    hybrid: {
      high: ["timetable", "assignments", "courses"],
      medium: ["notes", "research", "scholarships", "campus-events"],
      low: [],
    },
  },
  // Me workspace — user identity
  me: {
    academic: {
      high: ["student-profile", "notifications"],
      medium: ["public-profiles", "recommendations"],
      low: [],
    },
    social: {
      high: ["public-profiles", "notifications"],
      medium: ["student-profile", "recommendations"],
      low: [],
    },
    hybrid: {
      high: ["student-profile", "public-profiles", "notifications"],
      medium: ["recommendations"],
      low: [],
    },
  },
};

/**
 * Final Freeze: The five experiences are the permanent navigation. No new
 * experience may be created. Every future feature must be implemented as a
 * Shared Module, Platform Core Service, External Integration, or an
 * enhancement to an existing experience.
 *
 * This prevents the architecture from drifting back into a collection of
 * independent apps. UNIBUD v4 is a true operating system, not a set of
 * connected screens.
 */
export const EXPERIENCE_RUNTIME_FROZEN = true;

/**
 * The five frozen experience IDs. Once the runtime is frozen, no experience
 * outside this set may be registered or appear in navigation.
 */
export const FROZEN_EXPERIENCE_IDS = new Set([
  "discovery", "square", "connect", "campus", "me",
]);

// ─── Adaptive Services by Context ─────────────────────────────────────────
// Services hub surfaces different capabilities based on context and time.
export const ADAPTIVE_SERVICE_TRIGGERS = {
  "morning-before-class": {
    label: "Morning before class",
    services: ["timetable", "attendance", "transport"],
  },
  "exam-week": {
    label: "Exam week",
    services: ["printing", "library", "study-rooms", "past-questions"],
  },
  weekend: {
    label: "Weekend",
    services: ["events", "marketplace", "food", "housing"],
  },
  graduation: {
    label: "Graduation",
    services: ["certificates", "alumni", "jobs"],
  },
};

// ─── The Five Layers ──────────────────────────────────────────────────────
export const LAYERS = [
  { id: "governance", name: "Governance", description: "Internal operating authorities" },
  { id: "platform-core", name: "Platform Core", description: "Bud, Orbit, Spark, shared OS services" },
  { id: "integrations", name: "Integrations", description: "External provider gateway" },
  { id: "experiences", name: "Experiences", description: "The five permanent workspaces" },
  { id: "shared-modules", name: "Shared Modules", description: "Reusable capabilities" },
];

// ─── Shared Modules ────────────────────────────────────────────────────────
// Every feature is built once. Reused everywhere.
export const SHARED_MODULES = {
  content: ["Posts", "Stories", "Podcasts", "Live", "Videos", "Media", "Files"],
  community: ["Members", "Discussions", "Resources", "Events", "Polls", "Calendar", "Announcements"],
  communication: ["Messages", "Calls", "Meetings", "Whiteboards"],
  identity: ["Student", "Educator", "Institution", "PublicProfiles"],
  discovery: ["Search", "Notifications", "Recommendations"],
};

// ─── AI Authorities ───────────────────────────────────────────────────────
// Internal authorities are invisible. Users only meet Bud.
export const AI_AUTHORITIES = [
  "Oracle", "Architect", "Builder", "Reviewer", "Scholar", "Integrator",
  "Sentinel", "Monitor", "Scribe", "Analyst", "Automator", "Creator",
  "CommunityBuilder", "Banker", "Configurator",
];

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Get an experience by ID. */
export function getExperienceById(id) {
  return EXPERIENCES.find((e) => e.id === id);
}

/** Get an experience by route path. */
export function getExperienceByRoute(pathname) {
  return EXPERIENCES.find((e) => pathname === e.to || pathname.startsWith(e.to + "/"));
}

/** Get the module priority for an experience under a given context. */
export function getModulePriority(experienceId, contextId) {
  const expPriorities = CONTEXT_MODULE_PRIORITY[experienceId];
  if (!expPriorities) return null;
  return expPriorities[contextId] || expPriorities.hybrid;
}

/** Get all navigation items (experiences only — never hidden services). */
export function getNavigationItems() {
  return EXPERIENCES;
}

/** Get hidden services for the Services hub. */
export function getHiddenServices() {
  return HIDDEN_SERVICES;
}

/** Validate a feature against the constitutional four questions. */
export function validateFeature(feature) {
  const errors = [];
  if (!feature.layer) errors.push("Missing layer ownership");
  if (!feature.experience) errors.push("Missing presenting experience");
  if (!feature.module) errors.push("Missing shared module implementation");
  if (!feature.authority) errors.push("Missing governing authority");
  if (feature.hasDemoData) errors.push("Violates Zero Demo Policy");
  if (feature.duplicates) errors.push("Duplicates existing capability");
  return { valid: errors.length === 0, errors };
}