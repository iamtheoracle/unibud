import {
  Sparkles, GraduationCap, MessageSquareText, Compass, Users,
  Search, Plus, ScanLine, CalendarDays, Bell, Camera,
} from "lucide-react";

/**
 * Adaptive Navigation configuration — the single source of truth for the
 * UNIBUD bottom Adaptive Capsule states and the top Quick Action Capsule.
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
 * STATE 2 / STATE 3 — Per-mode navigation.
 * Bud lives as the floating AI companion, NOT in the quick-action strip.
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
 * Top Quick Action Capsule — contextual actions per mode.
 * Bud is intentionally absent — it lives as the floating companion.
 */
export const QUICK_ACTIONS = {
  social: [
    { key: "search", label: "Search", to: "/discover", icon: Search },
    { key: "create", label: "Create", to: "/creator-studio", icon: Plus },
    { key: "camera", label: "Camera", to: "/shorts", icon: Camera },
    { key: "events", label: "Events", to: "/events", icon: CalendarDays },
    { key: "alerts", label: "Alerts", to: "/notifications", icon: Bell },
  ],
  academic: [
    { key: "search", label: "Search", to: "/knowledge", icon: Search },
    { key: "create", label: "Create", to: "/assignments", icon: Plus },
    { key: "scan", label: "Scan", to: "/study/library", icon: ScanLine },
    { key: "calendar", label: "Calendar", to: "/calendar", icon: CalendarDays },
    { key: "alerts", label: "Alerts", to: "/notifications", icon: Bell },
  ],
};