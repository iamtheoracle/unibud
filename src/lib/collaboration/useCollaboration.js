import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["collab", "workspaces"];

/** useCollaboration — list & create the user's workspaces. */
export function useCollaboration() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const all = await base44.entities.Workspace.list("-created_date", 100);
      return all.filter((w) => w.status !== "archived" && (w.member_ids || []).includes(user?.id));
    },
    enabled: !!user,
    refetchInterval: 30000,
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

  return { user, workspaces, isLoading, create };
}