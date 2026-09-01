import { useInfiniteQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Paginated student search via the studentSearch backend function.
 * All matriculation numbers are masked server-side based on viewer role and privacy settings.
 */
export function useStudentSearch({ university, query, filterType, enabled = true, pageSize = 15 }) {
  const result = useInfiniteQuery({
    queryKey: ["studentSearch", university, query, filterType],
    queryFn: async ({ pageParam = null }) => {
      const response = await base44.functions.invoke("studentSearch", {
        action: "search",
        query,
        university,
        filterType,
        cursor: pageParam,
        pageSize,
      });
      const data = response.data || response;
      return { results: data.results || [], nextCursor: data.nextCursor || null };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });

  const allResults = [];
  const seenIds = new Set();
  if (result.data?.pages) {
    for (const page of result.data.pages) {
      for (const item of page.results) {
        if (item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          allResults.push(item);
        }
      }
    }
  }

  return {
    ...result,
    items: allResults,
  };
}