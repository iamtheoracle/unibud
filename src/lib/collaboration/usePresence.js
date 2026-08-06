import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/** usePresence — live collaborator presence for a workspace.
 *  Heartbeats the current user, surfaces active collaborators, and
 *  subscribes to realtime presence + item events for instant sync. */
export function usePresence(workspaceId, user, memberIds = []) {
  const qc = useQueryClient();
  const key = ["collab", "presence", workspaceId];

  const { data: presence = [] } = useQuery({
    queryKey: key,
    queryFn: () => base44.entities.WorkspacePresence.filter({ workspace_id: workspaceId }, "-last_seen", 50),
    enabled: !!workspaceId,
    refetchInterval: 8000,
  });

  // Realtime: invalidate on any presence event for instant sync.
  useEffect(() => {
    if (!workspaceId) return;
    const unsub = base44.entities.WorkspacePresence.subscribe?.(() => qc.invalidateQueries({ queryKey: key }));
    return () => unsub?.();
  }, [workspaceId]);

  const upsert = useMutation({
    mutationFn: async (patch) => {
      const now = new Date().toISOString();
      const existing = presence.find((p) => p.user_id === user?.id);
      const base = {
        workspace_id: workspaceId,
        user_id: user.id,
        user_name: user.full_name || user.email,
        avatar_url: user.avatar_url || user.image || "",
        last_seen: now,
        member_ids: memberIds.length ? memberIds : [user.id],
        ...patch,
      };
      if (existing) return base44.entities.WorkspacePresence.update(existing.id, base);
      return base44.entities.WorkspacePresence.create(base);
    },
  });

  const heartbeat = (status = "active", itemId = null, itemTitle = null) =>
    upsert.mutate({ status, current_item_id: itemId, current_item_title: itemTitle, cursor: null });

  const moveCursor = (cursor) => upsert.mutate({ cursor });

  // Active = seen in the last 60 seconds
  const active = presence.filter((p) => Date.now() - new Date(p.last_seen).getTime() < 60000 && p.user_id !== user?.id);

  return { presence, active, heartbeat, moveCursor };
}