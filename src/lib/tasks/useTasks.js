import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { computeProgress } from "./constants";
import { buildMemberIds, logActivity, notifyAssignees, syncProgress } from "./taskService";

export const TASK_QK = ["spark-tasks"];

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: [...TASK_QK, "list", filters],
    queryFn: async () => {
      const all = await base44.entities.TaskManagement.list("-updated_date", 200);
      return (all || []).filter((t) => {
        if (t.is_archived && !filters.includeArchived) return false;
        if (filters.status && t.status !== filters.status) return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.task_type && t.task_type !== filters.task_type) return false;
        if (filters.assignee_id && !(t.assignee_ids || []).includes(filters.assignee_id)) return false;
        if (filters.workspace_id && t.workspace_id !== filters.workspace_id) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const hay = [t.title, t.description, t.category, t.team, t.department, ...(t.tags || []), ...(t.assignee_names || []), t.creator_name]
            .filter(Boolean).join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    },
  });
}

export function useTask(taskId) {
  return useQuery({
    queryKey: [...TASK_QK, "detail", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      return await base44.entities.TaskManagement.get(taskId);
    },
    enabled: !!taskId,
  });
}

export function useTaskComments(taskId) {
  return useQuery({
    queryKey: [...TASK_QK, "comments", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const list = await base44.entities.TaskComment.filter({ task_id: taskId }, "-created_date", 200);
      return list || [];
    },
    enabled: !!taskId,
  });
}

export function useTaskActivity(taskId) {
  return useQuery({
    queryKey: [...TASK_QK, "activity", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const list = await base44.entities.TaskActivity.filter({ task_id: taskId }, "-created_date", 100);
      return list || [];
    },
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, actor }) => {
      const member_ids = buildMemberIds({ creatorId: actor.id, assigneeIds: task.assignee_ids, required_approvals: task.required_approvals });
      const created = await base44.entities.TaskManagement.create({
        ...task,
        status: task.status || (task.assignee_ids?.length ? "assigned" : "draft"),
        progress_percent: computeProgress({ ...task, status: task.status || "draft" }),
        member_ids,
        creator_name: actor.full_name || actor.email || "User",
        creator_image: actor.avatar_url || actor.image || "",
      });
      await logActivity(created, "created", `Created task “${created.title}”`, actor);
      if ((task.assignee_ids || []).length) {
        await notifyAssignees(created, {
          title: "New task assigned",
          message: `“${created.title}” was assigned to you.`,
          type: "task",
          action: "assigned",
        });
        await logActivity(created, "assigned", `Assigned to ${(task.assignee_names || []).join(", ")}`, actor);
      }
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_QK }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, patch, actor, activity }) => {
      const updated = await base44.entities.TaskManagement.update(task.id, {
        ...patch,
        progress_percent: computeProgress({ ...task, ...patch }),
        last_updated_by_id: actor?.id || task.last_updated_by_id,
        last_updated_by_name: actor?.full_name || actor?.email || task.last_updated_by_name,
      });
      if (activity) await logActivity(updated, activity.action, activity.detail, actor, activity.meta);
      await syncProgress(updated);
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_QK }),
  });
}

export function useToggleChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, index, actor }) => {
      const checklist = [...(task.checklist || [])];
      const item = checklist[index];
      const nowDone = !item.done;
      checklist[index] = {
        ...item,
        done: nowDone,
        done_by_id: nowDone ? actor?.id : null,
        done_by_name: nowDone ? actor?.full_name || actor?.email || "User" : null,
        done_at: nowDone ? new Date().toISOString() : null,
      };
      const updated = await base44.entities.TaskManagement.update(task.id, {
        checklist,
        progress_percent: computeProgress({ ...task, checklist }),
        last_updated_by_id: actor?.id,
        last_updated_by_name: actor?.full_name || actor?.email,
      });
      await logActivity(updated, nowDone ? "checklist_completed" : "checklist_added", `${nowDone ? "Completed" : "Reopened"} checklist item “${item.text}”`, actor);
      if (checklist.length > 0 && checklist.every((c) => c.done) && task.status !== "completed") {
        await base44.entities.TaskManagement.update(task.id, { status: "completed", progress_percent: 100 });
        await logActivity(updated, "completed", "All checklist items complete — task marked completed", actor);
        await notifyAssignees(updated, { title: "Task completed", message: `“${updated.title}” checklist is fully done.`, type: "achievement", action: "completed" });
      }
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_QK }),
  });
}

export function useToggleMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, index, actor }) => {
      const milestones = [...(task.milestones || [])];
      const m = milestones[index];
      const nowDone = !m.done;
      milestones[index] = { ...m, done: nowDone, completed_at: nowDone ? new Date().toISOString() : null };
      const updated = await base44.entities.TaskManagement.update(task.id, {
        milestones,
        progress_percent: computeProgress({ ...task, milestones }),
        last_updated_by_id: actor?.id,
        last_updated_by_name: actor?.full_name || actor?.email,
      });
      await logActivity(updated, "milestone_reached", `${nowDone ? "Reached" : "Reopened"} milestone “${m.title}”`, actor);
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_QK }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, content, actor, mentions = [] }) => {
      const comment = await base44.entities.TaskComment.create({
        task_id: task.id,
        content,
        author_id: actor.id,
        author_name: actor.full_name || actor.email || "User",
        author_image: actor.avatar_url || actor.image || "",
        mentions,
        member_ids: task.member_ids || [actor.id],
      });
      await base44.entities.TaskManagement.update(task.id, {
        last_updated_by_id: actor.id,
        last_updated_by_name: actor.full_name || actor.email,
      });
      await logActivity(task, "commented", "Added a comment", actor);
      if (mentions.length) {
        await base44.entities.Notification.bulkCreate(
          mentions.map((uid) => ({
            title: "You were mentioned in a task",
            message: `${actor.full_name || actor.email} mentioned you in “${task.title}”.`,
            type: "mention",
            category: "social",
            user_id: uid,
            link: `/tasks/${task.id}`,
            icon: "AtSign",
            action: "mention",
            source: "spark-tasks",
          }))
        );
      } else {
        await notifyAssignees(task, {
          title: "New comment on your task",
          message: `${actor.full_name || actor.email} commented on “${task.title}”.`,
          type: "comment",
          action: "commented",
          priority: "low",
        });
      }
      return comment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_QK }),
  });
}

export function useApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, actor, approved, note = "" }) => {
      const updated = await base44.entities.TaskManagement.update(task.id, {
        status: approved ? "approved" : "rejected",
        approved_by_id: actor.id,
        approved_at: new Date().toISOString(),
        rejection_reason: approved ? "" : note,
        progress_percent: approved ? 100 : task.progress_percent,
        last_updated_by_id: actor.id,
        last_updated_by_name: actor.full_name || actor.email,
      });
      await logActivity(updated, approved ? "approved" : "rejected", approved ? "Task approved" : `Rejected: ${note}`, actor);
      await notifyAssignees(updated, {
        title: approved ? "Task approved" : "Task rejected",
        message: approved ? `“${updated.title}” was approved.` : `“${updated.title}” was rejected. ${note}`,
        type: approved ? "achievement" : "task",
        action: approved ? "approved" : "rejected",
      });
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_QK }),
  });
}