import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { PAGE_SIZE } from "@/components/quad/quadConstants";
import { filterUserFacing } from "@/lib/constitution/contentArchitectureValidator";

/**
 * Infinite feed hook with cursor-based pagination via created_date.
 *
 * Features:
 * - Cursor pagination (created_date $lt)
 * - Background preloading (TanStack prefetches next page)
 * - Offline cache via localStorage (shows cached data while refetching)
 * - Dedup by post ID across pages
 * - Realtime invalidation support
 */
export function useInfiniteFeed({ queryKey, query = {}, pageSize = PAGE_SIZE, enabled = true }) {
  const qc = useQueryClient();

  const result = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      const filter = { ...query };
      if (pageParam) {
        filter.created_date = { $lt: pageParam };
      }
      const rawItems = await base44.entities.QuadPost.filter(filter, "-created_date", pageSize);
      // Enforce content architecture: filter system documents + restricted visibility from user-facing feed
      const items = filterUserFacing(rawItems, { space: "square" });

      // Cache to localStorage for offline support
      try {
        if (!pageParam) {
          localStorage.setItem("quad_feed_cache", JSON.stringify(items));
        }
      } catch {}

      const nextCursor = items.length === pageSize ? items[items.length - 1].created_date : undefined;
      return { items, nextCursor };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });

  // Deduplicate posts across all pages
  const allPosts = [];
  const seenIds = new Set();
  if (result.data?.pages) {
    for (const page of result.data.pages) {
      for (const post of page.items) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          allPosts.push(post);
        }
      }
    }
  }

  const invalidateFeed = () => {
    qc.invalidateQueries({ queryKey });
  };

  return {
    ...result,
    posts: allPosts,
    invalidateFeed,
  };
}

/** Get cached feed from localStorage (for instant render while fetching) */
export function getCachedFeed() {
  try {
    const data = localStorage.getItem("quad_feed_cache");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}