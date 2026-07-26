import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["collab", "workspaces"];

/** useCollaboration — list, create, template-seed, and attach live item
 *  progress to the user's workspaces. */
export function useCollaboration() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: raw = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => base44.entities.Workspace.list("-created_date", 100),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["collab", "allItems"],
    queryFn: () => base44.entities.CollaborationItem.list(500),
    enabled: !!user,
    refetchInterval: 20000,
  });

  const workspaces = (raw || [])
    .filter((w) => w.status !== "archived" && (w.member_ids || []).includes(user?.id))
    .map((w) => {
      const wi = items.filter((i) => i.workspace_id === w.id);
      const done = wi.filter((i) => i.status === "done" || i.status === "approved").length;
      return { ...w, _items: wi, _progress: wi.length ? Math.round((done / wi.length) * 100) : 0 };
    });

  const create = useMutation({
    mutationFn: async (payload) => {
      const me = { user_id: user.id, name: user.full_name || user.email, role: "owner", joined_at: new Date().toISOString(), avatar_url: user.avatar_url || user.image || "" };
      return base44.entities.Workspace.create({
        ...payload,
        members: [me],
        member_ids: [user.id],
        settings: payload.settings || { default_role: "editor", allow_member_invite: true },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  /** applyTemplate — seed a workspace from a Smart Project Template:
   *  ready-made notes, tasks, checklists, study plans + milestone tasks. */
  const applyTemplate = useMutation({
    mutationFn: async (template, overrides = {}) => {
      const memberIds = [user.id];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const offsetDate = (d) => { const x = new Date(today.getTime() + d * 86400000); return x.toISOString().slice(0, 10); };
      const lastMilestone = template.milestones?.[template.milestones.length - 1];
      const ws = await base44.entities.Workspace.create({
        title: overrides.title || template.label,
        description: template.summary,
        type: template.type,
        linked_module: overrides.linked_module || "none",
        settings: template.permissions || { default_role: "editor", allow_member_invite: true },
        due_date: lastMilestone ? offsetDate(lastMilestone.offset_days) : null,
        members: [{ user_id: user.id, name: user.full_name || user.email, role: "owner", joined_at: new Date().toISOString(), avatar_url: user.avatar_url || user.image || "" }],
        member_ids: memberIds,
      });
      const tplItems = (template.items || []).map((it, i) => ({
        workspace_id: ws.id, type: it.type, title: it.title,
        content: it.content || null, blocks: it.blocks || null,
        priority: it.priority || "medium", status: "open", order: i,
        due_date: it.due_offset ? offsetDate(it.due_offset) : null,
        member_ids: memberIds,
      }));
      const milestoneItems = (template.milestones || []).map((m, i) => ({
        workspace_id: ws.id, type: "task", title: `Milestone: ${m.title}`,
        priority: "high", status: "open", order: 100 + i,
        due_date: offsetDate(m.offset_days), member_ids: memberIds,
      }));
      await base44.entities.CollaborationItem.bulkCreate([...tplItems, ...milestoneItems]);
      // log creation activity
      try { await base44.entities.CollaborationActivity.create({ workspace_id: ws.id, actor_id: user.id, actor_name: user.full_name || user.email, action: "created", target_type: "workspace", target_id: ws.id, target_title: ws.title, summary: `Created from "${template.label}" template`, member_ids: memberIds }); } catch {}
      return ws;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: ["collab", "allItems"] }); },
  });

  return { user, workspaces, isLoading, create, applyTemplate };
}