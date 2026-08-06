import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * useExternalContent — fetches verified external content for feeds.
 * Only active content is returned; migrated/superseded items are excluded.
 */
export function useExternalContent(category = null) {
  return useQuery({
    queryKey: ["external-content", category],
    queryFn: () => {
      const query = { is_active: true };
      if (category && category !== "all") query.category = category;
      return base44.entities.ExternalContent.filter(query, "-published_at", 30);
    },
  });
}

/**
 * useBookmarkExternalContent — toggles bookmark on external content.
 * Optimistic update; preserved during API transitions.
 */
export function useBookmarkExternalContent(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, isBookmarked }) => {
      const content = await base44.entities.ExternalContent.get(contentId);
      const bookmarkedBy = isBookmarked
        ? (content.bookmarked_by || []).filter((id) => id !== userId)
        : [...new Set([...(content.bookmarked_by || []), userId])];
      return base44.entities.ExternalContent.update(contentId, {
        bookmarked_by: bookmarkedBy,
      });
    },
    onMutate: async ({ contentId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: ["external-content"] });
      const previous = queryClient.getQueriesData({ queryKey: ["external-content"] });
      queryClient.setQueriesData({ queryKey: ["external-content"] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((c) =>
          c.id === contentId
            ? {
                ...c,
                bookmarked_by: isBookmarked
                  ? (c.bookmarked_by || []).filter((id) => id !== userId)
                  : [...(c.bookmarked_by || []), userId],
              }
            : c
        );
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) =>
          queryClient.setQueryData(key, data)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["external-content"] });
    },
  });
}

/**
 * useReactExternalContent — toggles reaction on external content.
 * Optimistic update; preserved during API transitions.
 */
export function useReactExternalContent(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, hasReacted }) => {
      const content = await base44.entities.ExternalContent.get(contentId);
      const reactedBy = hasReacted
        ? (content.reacted_by || []).filter((id) => id !== userId)
        : [...new Set([...(content.reacted_by || []), userId])];
      return base44.entities.ExternalContent.update(contentId, {
        reacted_by: reactedBy,
        reaction_count: reactedBy.length,
      });
    },
    onMutate: async ({ contentId, hasReacted }) => {
      await queryClient.cancelQueries({ queryKey: ["external-content"] });
      const previous = queryClient.getQueriesData({ queryKey: ["external-content"] });
      queryClient.setQueriesData({ queryKey: ["external-content"] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((c) =>
          c.id === contentId
            ? {
                ...c,
                reacted_by: hasReacted
                  ? (c.reacted_by || []).filter((id) => id !== userId)
                  : [...(c.reacted_by || []), userId],
                reaction_count: hasReacted
                  ? Math.max(0, (c.reaction_count || 0) - 1)
                  : (c.reaction_count || 0) + 1,
              }
            : c
        );
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) =>
          queryClient.setQueryData(key, data)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["external-content"] });
    },
  });
}