import {
  Sparkles, GraduationCap, MessageSquareText, Compass, Users,
  Search, Plus, Camera, CalendarDays, CalendarClock, ClipboardList, ScanLine,
} from "lucide-react";

/**
 * Adaptive Navigation configuration — the single source of truth for the
 * UNIBUD bottom Adaptive Capsule states and the top Quick Action Capsule.
 *
 * Modes are owned by ExperienceContext (Academic | Social). This module
 * only maps modes to destinations and contextual quick actions — it never
 * holds state, so there is nothing to duplicate or drift out of sync.
 */

/** Where each operating mode "lands" when selected from the capsule selector. */
export const MODE_HOME = {
  academic: "/academics",
  social: "/social",
};

/** STATE 1 — Mode selector (not navigation). Choosing a mode morphs the capsule. */
export const MODE_SELECTOR_OPTIONS = [
  { key: "social", label: "Social", icon: Sparkles },
  { key: "academic", label: "Academics", icon: GraduationCap },
];

/**
 * STATE 2 / STATE 3 — Per-mode navigation. Three destinations each.
 * Routes reuse existing screens — no new pages, no duplicated navigation.
 * Academic "Quad" routes to the existing academic discovery surface.
 */
export const MODE_NAV = {
  social: [
    { key: "square", label: "Square", to: "/social", icon: MessageSquareText },
    { key: "discover", label: "Discover", to: "/discover", icon: Compass },
    { key: "connect", label: "Connect", to: "/connect", icon: Users },
  ],
  academic: [
    { key: "campus", label: "Campus", to: "/academics", icon: GraduationCap },
    { key: "quad", label: "Quad", to: "/opportunities", icon: Compass },
    { key: "connect", label: "Connect", to: "/connect", icon: Users },
  ],
};

/**
 * Top Quick Action Capsule — intelligent contextual actions per mode.
 * `action: "bud"` opens the Bud launcher; everything else navigates.
 */
export const QUICK_ACTIONS = {
  social: [
    { key: "search", label: "Search", to: "/discover", icon: Search },
    { key: "create", label: "Create", to: "/creator-studio", icon: Plus },
    { key: "camera", label: "Camera", to: "/shorts", icon: Camera },
    { key: "events", label: "Events", to: "/events", icon: CalendarDays },
    { key: "bud", label: "Bud", action: "bud", icon: Sparkles, accent: true },
  ],
  academic: [
    { key: "search", label: "Search", to: "/knowledge", icon: Search },
    { key: "timetable", label: "Timetable", to: "/timetable", icon: CalendarClock },
    { key: "assignments", label: "Assignments", to: "/assignments", icon: ClipboardList },
    { key: "bud", label: "Bud", action: "bud", icon: Sparkles, accent: true },
    { key: "scan", label: "Scan", to: "/study/library", icon: ScanLine },
  ],
};