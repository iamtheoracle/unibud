/**
 * UNIBUD Navigation OS — Navigation Analytics
 *
 * Re-exports pure analytics functions from the store layer,
 * plus the React Provider/hook from navigationAnalytics.jsx.
 *
 * Import from this file to get everything.
 * Tests should import directly from navigationAnalyticsStore.js
 * to avoid the JSX dependency.
 */

// Pure store functions (no React)
export {
  recordTabVisit,
  recordRouteVisit,
  recordTabDuration,
  recordCommandBarOpen,
  recordDeepLinkOpen,
  recordBackNavigation,
  getAnalyticsData,
  getNavEvents,
  clearAnalyticsData,
} from "@/lib/navigation/navigationAnalyticsStore";

// React Context/hook (JSX — not importable in Node test env)
export {
  NavigationAnalyticsProvider,
  useNavigationAnalytics,
} from "@/lib/navigation/navigationAnalytics.jsx";
