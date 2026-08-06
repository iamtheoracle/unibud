import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useAcademicTimeline(userId) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["academicTimeline", userId],
    queryFn: () => base44.entities.AcademicTimelineEntry.filter({ user_id: userId }, "date", 100),
    enabled: !!userId,
  });

  const add = useMutation({
    mutationFn: (data) =>
      base44.entities.AcademicTimelineEntry.create({ user_id: userId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academicTimeline", userId] }),
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.AcademicTimelineEntry.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academicTimeline", userId] }),
  });

  const setHidden = useMutation({
    mutationFn: ({ id, hidden }) =>
      base44.entities.AcademicTimelineEntry.update(id, { is_hidden: hidden }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academicTimeline", userId] }),
  });

  return {
    entries: q.data || [],
    loading: q.isLoading,
    add: add.mutateAsync,
    remove: remove.mutateAsync,
    setHidden: setHidden.mutateAsync,
    saving: add.isPending,
  };
}