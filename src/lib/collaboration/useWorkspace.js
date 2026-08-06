import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/** useWorkspace — loads a single workspace, its items, activity, and members,
 * and exposes mutation helpers that keep the activity timeline in sync. */
export function useWorkspace(workspaceId) {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const wsKey = ["collab", "workspace", workspaceId];
  const itemsKey = ["collab", "items", workspaceId];
  const activityKey = ["collab", "activity", workspaceId];

  const { data: workspace } = useQuery({
    queryKey: wsKey,
    queryFn: () => base44.entities.Workspace.get(workspaceId),
    enabled: !!workspaceId,
    refetchInterval: 30000,
  });
  const { data: items = [] } = useQuery({
    queryKey: itemsKey,
    queryFn: () => base44.entities.CollaborationItem.filter({ workspace_id: workspaceId }, "order", 200),
    enabled: !!workspaceId,
    refetchInterval: 15000,
  });
  const { data: activity = [] } = useQuery({
    queryKey: activityKey,
    queryFn: () => base44.entities.CollaborationActivity.filter({ workspace_id: workspaceId }, "-created_date", 100),
    enabled: !!workspaceId,
    refetchInterval: 15000,
  });

  const memberIds = workspace?.member_ids || [];

  // Real-time: invalidate on any item/activity/presence event for instant sync.
  useEffect(() => {
    if (!workspaceId) return;
    const unsubItems = base44.entities.CollaborationItem.subscribe?.(() => qc.invalidateQueries({ queryKey: itemsKey }));
    const unsubAct = base44.entities.CollaborationActivity.subscribe?.(() => qc.invalidateQueries({ queryKey: activityKey }));
    return () => { unsubItems?.(); unsubAct?.(); };
  }, [workspaceId]);

  const logActivity = async (action, target_type, target_id, target_title, summary) => {
    if (!user) return;
    try {
      await base44.entities.CollaborationActivity.create({
        workspace_id: workspaceId,
        actor_id: user.id,
        actor_name: user.full_name || user.email,
        action, target_type, target_id, target_title, summary,
        member_ids: memberIds,
      });
    } catch {}
    qc.invalidateQueries({ queryKey: activityKey });
  };

  const createItem = useMutation({
    mutationFn: async (payload) => base44.entities.CollaborationItem.create({
      ...payload, workspace_id: workspaceId, member_ids: memberIds, order: payload.order || 0,
    }),
    onSuccess: (it) => { logActivity("created", "item", it.id, it.title, `Created ${it.type} "${it.title}"`); qc.invalidateQueries({ queryKey: itemsKey }); },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...patch }) => base44.entities.CollaborationItem.update(id, patch),
    onSuccess: (it) => {
      const action = it.status === "done" ? "completed" : it.status === "blocked" ? "blocked" : "updated";
      logActivity(action, "item", it.id, it.title, `${action} "${it.title}"`);
      qc.invalidateQueries({ queryKey: itemsKey });
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.CollaborationItem.delete(id),
    onSuccess: (_, id) => { logActivity("updated", "item", id, "", "Removed an item"); qc.invalidateQueries({ queryKey: itemsKey }); },
  });

  const saveVersion = async (item) => {
    try {
      const prev = await base44.entities.CollaborationVersion.filter({ item_id: item.id }, "-version", 1);
      const next = (prev[0]?.version || 0) + 1;
      await base44.entities.CollaborationVersion.create({
        workspace_id: workspaceId, item_id: item.id, version: next,
        snapshot: { title: item.title, content: item.content, blocks: item.blocks, status: item.status },
        change_summary: `Version ${next}`, author_id: user.id, author_name: user.full_name, member_ids: memberIds,
      });
    } catch {}
  };

  const addMember = useMutation({
    mutationFn: async ({ user_id, name, role = "editor", avatar_url = "" }) => {
      const members = [...(workspace.members || []), { user_id, name, role, joined_at: new Date().toISOString(), avatar_url }];
      const memberIds = [...new Set([...(workspace.member_ids || []), user_id])];
      return base44.entities.Workspace.update(workspaceId, { members, member_ids: memberIds });
    },
    onSuccess: (w) => { logActivity("joined", "member", w.id, w.title, `${w.title} added a member`); qc.invalidateQueries({ queryKey: wsKey }); },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ user_id, role }) => {
      const members = (workspace.members || []).map((m) => (m.user_id === user_id ? { ...m, role } : m));
      return base44.entities.Workspace.update(workspaceId, { members });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: wsKey }),
  });

  return {
    user, workspace, items, activity, memberIds,
    createItem, updateItem, deleteItem, saveVersion,
    addMember, updateMemberRole, logActivity,
  };
}