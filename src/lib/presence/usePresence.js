import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { resolveDisplayName } from "@/lib/userDisplayName";

const KEY = ["Presence"];

/**
 * usePresence — real-time availability for UNIBUD.
 *
 * Each user owns one Presence record (status they choose to broadcast:
 * online, in class, studying, busy, do not disturb, offline). The record
 * is readable by any authenticated peer (presence is intentionally shared)
 * and writable only by its owner. A realtime subscription keeps the map
 * live so friends see status changes the moment they happen.
 */
export function usePresence() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: list = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => base44.entities.Presence.list(),
    enabled: !!user,
  });

  // Real-time: invalidate on any Presence event so every viewer updates live.
  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.Presence.subscribe(() => qc.invalidateQueries({ queryKey: KEY }));
    return unsubscribe;
  }, [user, qc]);

  const meId = user?.id;

  // Ensure the current user has a presence record (created once, as "online").
  useEffect(() => {
    if (!meId || isLoading) return;
    const existing = list.find((p) => p.user_id === meId);
    if (existing) return;
    const now = new Date().toISOString();
    base44.entities.Presence.create({
      user_id: meId,
      user_name: resolveDisplayName(user),
      avatar_url: user?.avatar_url || user?.data?.avatar_url || null,
      status: "online",
      last_active: now,
    }).then(() => qc.invalidateQueries({ queryKey: KEY })).catch(() => {});
  }, [meId, isLoading, list, user, qc]);

  const byUser = useMemo(() => {
    const m = {};
    list.forEach((p) => { m[p.user_id] = p; });
    return m;
  }, [list]);

  const setStatus = useMutation({
    mutationFn: async ({ status, custom_message }) => {
      const existing = byUser[meId];
      const payload = { status, custom_message: custom_message || null, last_active: new Date().toISOString() };
      if (existing) return base44.entities.Presence.update(existing.id, payload);
      return base44.entities.Presence.create({
        user_id: meId,
        user_name: resolveDisplayName(user),
        avatar_url: user?.avatar_url || user?.data?.avatar_url || null,
        ...payload,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    meId,
    myPresence: byUser[meId],
    byUser,
    setStatus: setStatus.mutate,
    saving: setStatus.isPending,
  };
}