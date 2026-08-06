/**
 * UNIBUD Navigation OS — Quick Actions
 *
 * Generates context-aware, personalized quick actions for:
 *   - The Command Bar
 *   - Screen-level action strips
 *   - Bud suggestions
 *
 * Actions are generated based on:
 *   1. Current screen context
 *   2. User's navigation history (from NavigationIntelligence)
 *   3. Bud's recommendations (passed in as optional overrides)
 *
 * Each action has:
 *   id, label, icon, path?, action?, category, priority
 */

import { getTopRoutes, getPersonalizedOrder } from "./navigationIntelligence";
import { resolveRoute } from "./routeRegistry";

/**
 * @typedef {Object} QuickAction
 * @property {string}   id        - Unique action identifier
 * @property {string}   label     - Human-readable label
 * @property {string}   icon      - Lucide icon name
 * @property {string}   [path]    - Navigation path (if navigating)
 * @property {string}   [action]  - Action key for non-nav actions (e.g. "open-bud")
 * @property {string}   category  - "navigation" | "ai" | "create" | "recent"
 * @property {number}   priority  - Higher = shown first (0–100)
 */

// ─── Default actions by context ───────────────────────────────────────────────

/** Actions always available in the Command Bar */
const GLOBAL_ACTIONS = [
  { id: "ask-bud", label: "Ask Bud", icon: "Sparkles", action: "open-bud", category: "ai", priority: 100 },
  { id: "voice", label: "Voice", icon: "Mic", action: "voice", category: "ai", priority: 95 },
  { id: "search", label: "Search", icon: "Search", action: "search", category: "navigation", priority: 90 },
];

/** Context-specific actions per destination */
const DESTINATION_ACTIONS = {
  square: [
    { id: "new-post", label: "New Post", icon: "PenLine", action: "create-post", category: "create", priority: 85 },
    { id: "go-communities", label: "Communities", icon: "Users", path: "/communities", category: "navigation", priority: 70 },
    { id: "go-marketplace", label: "Marketplace", icon: "ShoppingBag", path: "/marketplace", category: "navigation", priority: 65 },
    { id: "go-events", label: "Events", icon: "Calendar", path: "/events", category: "navigation", priority: 60 },
  ],
  quad: [
    { id: "view-courses", label: "My Courses", icon: "BookOpen", path: "/courses", category: "navigation", priority: 85 },
    { id: "view-assignments", label: "Assignments", icon: "ClipboardList", path: "/assignments", category: "navigation", priority: 80 },
    { id: "view-timetable", label: "Timetable", icon: "CalendarDays", path: "/timetable", category: "navigation", priority: 75 },
    { id: "start-study", label: "Start Studying", icon: "GraduationCap", path: "/study", category: "navigation", priority: 70 },
    { id: "go-exams", label: "Exams", icon: "FileText", path: "/exams", category: "navigation", priority: 65 },
  ],
  connect: [
    { id: "new-message", label: "New Message", icon: "MessageCircle", action: "new-message", category: "create", priority: 85 },
    { id: "go-messages", label: "Messages", icon: "Inbox", path: "/messages", category: "navigation", priority: 75 },
    { id: "start-call", label: "Start Call", icon: "Phone", path: "/call", category: "navigation", priority: 65 },
  ],
  me: [
    { id: "open-bud-home", label: "Bud Home", icon: "Home", path: "/home", category: "navigation", priority: 85 },
    { id: "go-settings", label: "Settings", icon: "Settings", path: "/settings", category: "navigation", priority: 65 },
    { id: "go-wallet", label: "Wallet", icon: "Wallet", path: "/wallet", category: "navigation", priority: 60 },
    { id: "go-achievements", label: "Achievements", icon: "Trophy", path: "/achievements", category: "navigation", priority: 55 },
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get quick actions for the current screen context.
 *
 * @param {Object} opts
 * @param {string}         opts.destinationId  - Active destination (e.g. "quad")
 * @param {string}         opts.pathname       - Current route path
 * @param {QuickAction[]}  [opts.budActions]   - AI-generated actions from Bud (highest priority)
 * @param {number}         [opts.maxActions=8] - Maximum number of actions to return
 * @returns {QuickAction[]}
 */
export function getQuickActions({ destinationId, pathname, budActions = [], maxActions = 8 }) {
  const destActions = DESTINATION_ACTIONS[destinationId] || [];

  // Build recent-route actions from intelligence
  const topRoutes = getTopRoutes(5);
  const recentActions = topRoutes
    .filter((r) => r.path !== pathname) // exclude current page
    .map((r) => {
      const route = resolveRoute(r.path);
      if (!route) return null;
      return {
        id: `recent:${r.path}`,
        label: route.title,
        icon: "Clock",
        path: r.path,
        category: "recent",
        priority: 50 + r.score * 0.1,
      };
    })
    .filter(Boolean);

  // Merge and de-duplicate
  const seen = new Set();
  const all = [
    ...budActions.map((a) => ({ ...a, priority: (a.priority || 70) + 20 })), // Bud gets +20
    ...GLOBAL_ACTIONS,
    ...destActions,
    ...recentActions,
  ].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  // Sort by priority descending
  return all.sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, maxActions);
}

/**
 * Get just the global (always-available) actions.
 * Used to populate the Command Bar's default state.
 *
 * @returns {QuickAction[]}
 */
export function getGlobalActions() {
  return [...GLOBAL_ACTIONS];
}

/**
 * Get destination-specific actions without personalization.
 * Used as a fallback when no analytics data is available.
 *
 * @param {string} destinationId
 * @returns {QuickAction[]}
 */
export function getDestinationActions(destinationId) {
  return DESTINATION_ACTIONS[destinationId] || [];
}
