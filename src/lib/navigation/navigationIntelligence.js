/**
 * UNIBUD Navigation OS — Navigation Intelligence
 *
 * Learns from user navigation patterns to personalize:
 *   - Sub-route ordering within each destination
 *   - Quick Action suggestions
 *   - Command Bar suggestions
 *
 * Data source: navigationAnalytics.js (localStorage)
 */

import { getAnalyticsData } from "./navigationAnalyticsStore";
import { PRIMARY_DESTINATIONS } from "./registry";

// ─── Scoring ──────────────────────────────────────────────────────────────────

const RECENCY_HALF_LIFE_DAYS = 7; // recent visits decay over 7 days

/**
 * Compute a weighted score for a route based on frequency and recency.
 *
 * @param {{ count: number, lastVisit: number|null }} routeData
 * @returns {number}
 */
function scoreRoute(routeData) {
  if (!routeData) return 0;
  const { count = 0, lastVisit } = routeData;

  const recencyFactor = lastVisit
    ? Math.exp(
        (-Math.log(2) * (Date.now() - lastVisit)) /
          (RECENCY_HALF_LIFE_DAYS * 24 * 60 * 60 * 1000)
      )
    : 1;

  return count * recencyFactor;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get a ranked list of sub-routes for a destination, ordered by usage.
 * Routes the user has never visited are included at the end (unranked).
 *
 * @param {string} destinationId
 * @returns {string[]}  Sorted array of path strings
 */
export function getPersonalizedOrder(destinationId) {
  const data = getAnalyticsData();
  const tabData = data[destinationId];
  if (!tabData?.subRoutes) return [];

  const ranked = Object.entries(tabData.subRoutes)
    .map(([path, stats]) => ({ path, score: scoreRoute(stats) }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.path);

  return ranked;
}

/**
 * Get the most frequently visited tabs, sorted by total engagement.
 *
 * @returns {{ id: string, label: string, to: string, score: number }[]}
 */
export function getRankedDestinations() {
  const data = getAnalyticsData();

  return PRIMARY_DESTINATIONS.map((dest) => {
    const tabData = data[dest.id];
    const score = tabData
      ? scoreRoute({ count: tabData.visitCount, lastVisit: tabData.lastVisit })
      : 0;
    return { ...dest, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Get the top N most recently/frequently visited routes across all destinations.
 *
 * @param {number} [n=8]
 * @returns {{ path: string, destinationId: string, score: number }[]}
 */
export function getTopRoutes(n = 8) {
  const data = getAnalyticsData();
  const results = [];

  for (const dest of PRIMARY_DESTINATIONS) {
    const tabData = data[dest.id];
    if (!tabData?.subRoutes) continue;

    for (const [path, stats] of Object.entries(tabData.subRoutes)) {
      results.push({
        path,
        destinationId: dest.id,
        score: scoreRoute(stats),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, n);
}

/**
 * Check if a user has visited a destination at all (onboarding flows).
 *
 * @param {string} destinationId
 * @returns {boolean}
 */
export function hasVisited(destinationId) {
  const data = getAnalyticsData();
  return !!(data[destinationId]?.visitCount > 0);
}
