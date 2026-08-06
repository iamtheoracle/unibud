/**
 * Authentic Content Filter
 *
 * Ensures feeds, recommendations, trending, and analytics use only
 * genuine user-generated content. Launch content is clearly marked and
 * automatically de-emphasized as real activity grows.
 *
 * Core principle: UNIBUD feels alive because its community is active —
 * not because the system fabricates activity.
 */

/**
 * Marks launch content for UI display.
 * Returns posts with an `isLaunchContent` flag for clear labeling.
 */
export function markLaunchContent(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.map((post) => ({
    ...post,
    isLaunchContent: post.is_seed_content === true,
  }));
}

/**
 * Prioritizes real user content over launch content in feeds.
 * Real content appears first; launch content fills in only when
 * there isn't enough real content.
 */
export function prioritizeAuthenticContent(posts) {
  if (!Array.isArray(posts)) return [];
  const real = posts.filter((p) => !p.is_seed_content);
  const launch = posts.filter((p) => p.is_seed_content);

  // If we have enough real content (5+), show only real
  if (real.length >= 5) {
    return real;
  }

  // Otherwise, show real first, then launch as filler
  return [...real, ...launch];
}

/**
 * Calculates trending topics from REAL engagement only.
 * Launch content is excluded from trending calculations.
 */
export function calculateAuthenticTrending(posts) {
  if (!Array.isArray(posts)) return [];
  return posts
    .filter((p) => !p.is_seed_content)
    .sort((a, b) => (b.likes_count || 0) + (b.comments_count || 0) - ((a.likes_count || 0) + (a.comments_count || 0)))
    .slice(0, 5);
}

/**
 * Determines whether launch content should be shown in feeds.
 * Launch content is hidden once the platform has enough real activity.
 */
export function shouldShowLaunchContent(realCount, launchCount) {
  const total = realCount + launchCount;
  if (total === 0) return false;
  // Show launch content until 30% of content is real
  const realRatio = realCount / total;
  return realRatio < 0.3;
}

/**
 * Filters out seed content entirely — for use in analytics,
 * recommendations, and Bud's AI analysis where only authentic
 * data should be considered.
 */
export function filterAuthenticOnly(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.filter((p) => !p.is_seed_content);
}

/**
 * Returns authentic engagement metrics (likes, comments, shares)
 * calculated from real content only.
 */
export function getAuthenticMetrics(posts) {
  const real = filterAuthenticOnly(posts);
  return {
    totalPosts: real.length,
    totalLikes: real.reduce((sum, p) => sum + (p.likes_count || 0), 0),
    totalComments: real.reduce((sum, p) => sum + (p.comments_count || 0), 0),
    totalShares: real.reduce((sum, p) => sum + (p.shares_count || 0), 0),
  };
}

// Re-export the content architecture validator for unified access
export { filterSystemDocuments, isSystemDocumentLeak, validateFeedSpace } from "@/lib/constitution/contentArchitectureValidator";