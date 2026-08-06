/**
 * UNIBUD Platform Manifest
 *
 * Organizes the entire ecosystem into 10 independent platforms.
 * Each platform has its own identity, routes, modules, and owning agent —
 * but all share one design system, one AI intelligence (Bud/Oracle),
 * and seamless navigation.
 *
 * This is the single source of truth for what UNIBUD is.
 */

export const PLATFORMS = [
  {
    id: "core",
    name: "Core Platform",
    tagline: "The foundation — identity, navigation, design system, infrastructure",
    icon: "Crown",
    color: "0 0% 100%",
    routes: ["/home", "/me", "/notifications"],
    owningAgent: "oracle",
    workstream: 1,
    status: "live",
  },
  {
    id: "agent",
    name: "Agent Platform",
    tagline: "Bud, Oracle, and the 9 specialist agents — intelligence everywhere",
    icon: "Sparkles",
    color: "217 91% 60%",
    routes: ["/bud"],
    owningAgent: "oracle",
    workstream: 2,
    status: "live",
  },
  {
    id: "academic",
    name: "Academic Platform",
    tagline: "Professional academic software — focused, distraction-free",
    icon: "BookOpen",
    color: "142 71% 45%",
    routes: ["/academics", "/campus", "/courses", "/assignments", "/exams", "/attendance", "/timetable", "/calendar", "/notes", "/study", "/agenda", "/academic-timeline", "/office-hours", "/study-sessions", "/projects", "/academics/results", "/academics/report"],
    owningAgent: "lens",
    workstream: 3,
    status: "live",
  },
  {
    id: "community",
    name: "Community Platform",
    tagline: "Premium social — timeline, stories, video, messaging, groups, live",
    icon: "Users",
    color: "265 89% 65%",
    routes: ["/social", "/connect", "/messages", "/communities", "/community", "/clubs", "/friends", "/following", "/shorts", "/podcasts", "/podcasts", "/creator-studio", "/square", "/quad", "/study-groups", "/study-groups", "/events", "/mentorship", "/mentor"],
    owningAgent: "bud",
    workstream: 4,
    status: "live",
  },
  {
    id: "discover",
    name: "Discovery Platform",
    tagline: "Intelligent exploration — students, universities, opportunities, trends",
    icon: "Compass",
    color: "199 89% 52%",
    routes: ["/discover", "/scholar", "/lens"],
    owningAgent: "orbit",
    workstream: 5,
    status: "live",
  },
  {
    id: "marketplace",
    name: "Marketplace Platform",
    tagline: "Complete commerce ecosystem — every category, one platform",
    icon: "ShoppingBag",
    color: "46 74% 55%",
    routes: ["/marketplace", "/lost-found", "/services"],
    owningAgent: "forge",
    workstream: 6,
    status: "live",
  },
  {
    id: "banking",
    name: "Banking Platform",
    tagline: "Independent fintech — wallet, accounts, transfers, cards, escrow",
    icon: "Wallet",
    color: "217 91% 60%",
    routes: ["/wallet", "/finance"],
    owningAgent: "oracle",
    workstream: 7,
    status: "live",
  },
  {
    id: "media",
    name: "Media Platform",
    tagline: "Streaming & podcasts — premium content experience",
    icon: "PlayCircle",
    color: "280 65% 60%",
    routes: ["/podcasts", "/podcasts", "/shorts", "/creator-studio", "/live", "/live"],
    owningAgent: "atlas",
    workstream: 8,
    status: "live",
  },
  {
    id: "communication",
    name: "Communication Platform",
    tagline: "Unified messaging, voice, video, study rooms, AI-assisted meetings",
    icon: "MessageCircle",
    color: "199 89% 52%",
    routes: ["/communication", "/messages", "/call", "/call", "/classroom", "/live"],
    owningAgent: "echo",
    workstream: 9,
    status: "live",
  },
  {
    id: "design",
    name: "Design System & Infrastructure",
    tagline: "Shared design language, component library, platform infrastructure",
    icon: "Palette",
    color: "0 0% 100%",
    routes: [],
    owningAgent: "orbit",
    workstream: 10,
    status: "live",
  },
];

// ─── Floating Navigation Config ──────────────────────────────────────────
// Only ONE floating navigator. Positioned at top, stories-style.
export const FLOATING_NAV_ITEMS = [
  { id: "home", label: "Home", to: "/home", icon: "Home", platform: "core" },
  { id: "campus", label: "Campus", to: "/campus", icon: "GraduationCap", platform: "academic" },
  { id: "discover", label: "Discover", to: "/discover", icon: "Compass", platform: "discover" },
  { id: "community", label: "Community", to: "/social", icon: "Users", platform: "community" },
  { id: "marketplace", label: "Marketplace", to: "/marketplace", icon: "ShoppingBag", platform: "marketplace" },
  { id: "bank", label: "Bank", to: "/wallet", icon: "Wallet", platform: "banking" },
  { id: "research", label: "Research", to: "/research", icon: "FlaskConical", platform: "academic" },
  { id: "profile", label: "Profile", to: "/me", icon: "User", platform: "core" },
];

// ─── Platform Identity Rules ──────────────────────────────────────────────
export const PLATFORM_IDENTITY_RULES = {
  shared: [
    "Same design system (Liquid Glass, Midnight tokens)",
    "Same AI intelligence (Bud as interface, Oracle as orchestrator)",
    "Same navigation paradigm (floating nav + floating board)",
    "Same auth and user model",
  ],
  unique: [
    "Each platform has its own color accent",
    "Each platform has its own empty states and loading states",
    "Each platform has its own dashboard layout",
    "Each platform has its own motion language (within the shared system)",
  ],
};

// ─── Helper: get platform by route ────────────────────────────────────────
export function getPlatformByRoute(pathname) {
  for (const platform of PLATFORMS) {
    if (platform.routes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return platform;
    }
  }
  return PLATFORMS[0];
}

// ─── Helper: get platform by id ───────────────────────────────────────────
export function getPlatformById(id) {
  return PLATFORMS.find((p) => p.id === id);
}