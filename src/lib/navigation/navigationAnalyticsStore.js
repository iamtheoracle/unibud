/**
 * UNIBUD Navigation OS — Navigation Analytics Store (pure, no JSX)
 *
 * Pure data-access layer for navigation analytics.
 * Intentionally free of React so it can be imported in Node/test environments.
 *
 * React context/hooks live in navigationAnalytics.jsx.
 */

const STORAGE_KEY = "unibud:nav-analytics";
const EVENTS_KEY = "unibud:nav-events";
const MAX_EVENTS = 500;

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function loadAnalytics() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveAnalytics(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function appendEvent(event) {
  try {
    const events = loadEvents();
    events.push({ ...event, timestamp: Date.now() });
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch {}
}

// ─── Core analytics functions ─────────────────────────────────────────────────

/** Record a tab visit. */
export function recordTabVisit(tabId) {
  if (!tabId) return;
  const data = loadAnalytics();
  const tab = data[tabId] || { visitCount: 0, lastVisit: null, totalDurationMs: 0, subRoutes: {} };
  data[tabId] = { ...tab, visitCount: tab.visitCount + 1, lastVisit: Date.now() };
  saveAnalytics(data);
  appendEvent({ type: "nav.tab_switch", tabId });
}

/** Record a sub-route visit within a tab. */
export function recordRouteVisit(tabId, pathname) {
  if (!tabId || !pathname) return;
  const data = loadAnalytics();
  const tab = data[tabId] || { visitCount: 0, lastVisit: null, totalDurationMs: 0, subRoutes: {} };
  const subRoutes = tab.subRoutes || {};
  const route = subRoutes[pathname] || { count: 0, lastVisit: null };
  data[tabId] = {
    ...tab,
    subRoutes: { ...subRoutes, [pathname]: { count: route.count + 1, lastVisit: Date.now() } },
  };
  saveAnalytics(data);
  appendEvent({ type: "nav.route_visit", tabId, pathname });
}

/** Record time spent on a tab. */
export function recordTabDuration(tabId, durationMs) {
  if (!tabId || !durationMs) return;
  const data = loadAnalytics();
  const tab = data[tabId] || { visitCount: 0, lastVisit: null, totalDurationMs: 0, subRoutes: {} };
  data[tabId] = { ...tab, totalDurationMs: (tab.totalDurationMs || 0) + durationMs };
  saveAnalytics(data);
}

/** Record Command Bar open event. */
export function recordCommandBarOpen() {
  appendEvent({ type: "nav.command_bar_open" });
}

/** Record deep link open event. */
export function recordDeepLinkOpen(path) {
  appendEvent({ type: "nav.deep_link_open", path });
}

/** Record back navigation. */
export function recordBackNavigation(from, to) {
  appendEvent({ type: "nav.back", from, to });
}

/** Get raw analytics data. */
export function getAnalyticsData() {
  return loadAnalytics();
}

/** Get all recorded navigation events. */
export function getNavEvents() {
  return loadEvents();
}

/** Clear all navigation analytics data. */
export function clearAnalyticsData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EVENTS_KEY);
  } catch {}
}
