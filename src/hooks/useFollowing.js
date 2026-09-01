import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Real follow graph backed by the Follow entity.
// Returns the current user's followed user IDs + a toggle, reusable across
// Feed, Connect, Discovery and Profile. No mock relationships.
export function useFollowing() {
  const qc = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: follows } = useQuery({
    queryKey: ["myFollowing", user?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user.id, status: "active" }),
    enabled: !!user,
  });

  const followingIds = useMemo(
    () => new Set((follows || []).map((f) => f.following_id)),
    [follows]
  );

  const isFollowing = (id) => !!id && followingIds.has(id);

  const toggleFollow = async (targetId, targetName) => {
    if (!targetId || !user || targetId === user.id) return;
    const existing = (follows || []).find((f) => f.following_id === targetId);
    try {
      if (existing) {
        await base44.entities.Follow.delete(existing.id);
      } else {
        await base44.entities.Follow.create({
          follower_id: user.id,
          follower_name: user.full_name || user.email,
          following_id: targetId,
          following_name: targetName || "",
          status: "active",
        });
      }
      qc.invalidateQueries({ queryKey: ["myFollowing", user.id] });
      qc.invalidateQueries({ queryKey: ["following", user.id] });
      qc.invalidateQueries({ queryKey: ["followers", targetId] });
    } catch {}
  };

  return { followingIds, isFollowing, toggleFollow };
}