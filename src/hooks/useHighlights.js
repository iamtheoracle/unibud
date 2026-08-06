import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * useHighlights — CRUD hook for the Highlight entity.
 *
 * Students can save anything (movies, music, articles, matches, etc.) to
 * their personal highlights, organized into folders.
 */
export function useHighlights() {
  const queryClient = useQueryClient();

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: ["highlights"],
    queryFn: () => base44.entities.Highlight.list("-created_date", 200),
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Highlight.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["highlights"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.Highlight.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["highlights"] }),
  });

  const isSaved = (title, sourceUrl) =>
    highlights.some(
      (h) => h.title === title && (h.source_url || "") === (sourceUrl || "")
    );

  const save = (data) => saveMutation.mutate(data);

  const remove = (title, sourceUrl) => {
    const item = highlights.find(
      (h) => h.title === title && (h.source_url || "") === (sourceUrl || "")
    );
    if (item) removeMutation.mutate(item.id);
  };

  const removeById = (id) => removeMutation.mutate(id);

  const folders = [...new Set(highlights.map((h) => h.folder).filter(Boolean))];

  return {
    highlights,
    isLoading,
    isSaved,
    save,
    remove,
    removeById,
    folders,
    saveMutation,
    removeMutation,
  };
}