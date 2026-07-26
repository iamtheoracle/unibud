import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["Follow"];

/**
 * useFollow — the follow system powering personalized discovery.
 * Students can follow people, clubs, departments, universities, businesses,
 * interests and topics.
 *
 * Real-time: subscribes to Follow events so follower counts and follow state
 * update instantly on both sides (follower + followed).
 *
 * RLS lets a person read Follow records that target them (target_type person,
 * target_id == me), so `followers` and `followerCount` are real.
 */
export function useFollow() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: followsRaw = [] } = useQuery({
    queryKey: KEY,
    queryFn: () => base44.entities.Follow.list(),
    enabled: !!user,
  });

  // Real-time sync — invalidate on any Follow event so counts refresh live.
  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.Follow.subscribe(() => {
      qc.invalidateQueries({ queryKey: KEY });
    });
    return unsubscribe;
  }, [user, qc]);

  const meId = user?.id;
  const following = followsRaw.filter((f) => f.created_by_id === meId);
  const followers = followsRaw.filter((f) => f.target_type === "person" && f.target_id === meId);

  const isFollowing = (type, id) => following.some((f) => f.target_type === type && f.target_id === id);

  const toggle = useMutation({
    mutationFn: async ({ type, id, name, meta }) => {
      const existing = following.find((f) => f.target_type === type && f.target_id === id);
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
    follows: following,
    following,
    followers,
    followerCount: followers.length,
    followingCount: following.length,
    isFollowing,
    toggle: (t) => toggle.mutate(t),
    loading: toggle.isPending,
  };
}