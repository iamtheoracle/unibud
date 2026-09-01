import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Generic infinite feed hook with cursor-based pagination via created_date.
 * Works with any entity type. Includes localStorage cache and ID dedup.
 */
export function useEntityInfinite({
  entityName,
  queryKey,
  query = {},
  pageSize = 10,
  enabled = true,
  sort = "-created_date",
  cacheKey,
}) {
  const qc = useQueryClient();

  const result = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      const filter = { ...query };
      if (pageParam) {
        filter.created_date = { $lt: pageParam };
      }
      const entity = base44.entities[entityName];
      const items = await entity.filter(filter, sort, pageSize);

      if (!pageParam && cacheKey) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(items));
        } catch {}
      }

      const nextCursor = items.length === pageSize ? items[items.length - 1].created_date : undefined;
      return { items, nextCursor };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });

  const allItems = [];
  const seenIds = new Set();
  if (result.data?.pages) {
    for (const page of result.data.pages) {
      for (const item of page.items) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          allItems.push(item);
        }
      }
    }
  }

  const invalidate = () => {
    qc.invalidateQueries({ queryKey });
  };

  return {
    ...result,
    items: allItems,
    invalidate,
  };
}

export function getCachedItems(cacheKey) {
  try {
    const data = localStorage.getItem(cacheKey);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}