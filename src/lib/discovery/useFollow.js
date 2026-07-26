import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["Follow"];

/**
 * useFollow — the follow system powering personalized discovery.
 * Students can follow people, clubs, departments, universities, businesses,
 * interests and topics. State is shared across the app via the ["Follow"]
 * query key, so follow/unfollow updates reflect everywhere instantly.
 */
export function useFollow() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: follows = [] } = useQuery({
    queryKey: KEY,
    queryFn: () => base44.entities.Follow.list(),
    enabled: !!user,
  });

  const isFollowing = (type, id) => follows.some((f) => f.target_type === type && f.target_id === id);

  const toggle = useMutation({
    mutationFn: async ({ type, id, name, meta }) => {
      const existing = follows.find((f) => f.target_type === type && f.target_id === id);
      if (existing) return base44.entities.Follow.delete(existing.id);
      return base44.entities.Follow.create({
        target_type: type,
        target_id: id,
        target_name: name,
        target_meta: meta || null,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    follows,
    isFollowing,
    toggle: (t) => toggle.mutate(t),
    loading: toggle.isPending,
  };
}