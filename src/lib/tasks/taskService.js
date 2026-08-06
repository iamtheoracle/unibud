import { base44 } from "@/api/base44Client";
import { computeProgress } from "./constants";

/**
 * Build the member_ids list for a task: creator + assignees + approvers.
 * Ensures the creator can always see and manage their own task.
 */
export function buildMemberIds({ creatorId, assigneeIds = [], required_approvals = [] }) {
  const ids = new Set([creatorId, ...(assigneeIds || [])]);
  (required_approvals || []).forEach((a) => { if (a.approver_id) ids.add(a.approver_id); });
  return [...ids].filter(Boolean);
}

/**
 * Log an activity entry for a task.
 */
export async function logActivity(task, action, detail, actor, meta = {}) {
  try {
    await base44.entities.TaskActivity.create({
      task_id: task.id,
      actor_id: actor?.id || "system",
      actor_name: actor?.full_name || actor?.email || "System",
      actor_image: actor?.avatar_url || actor?.image || "",
      action,
      detail,
      meta,
      member_ids: task.member_ids || [actor?.id].filter(Boolean),
    });
  } catch (e) {
    // activity logging must never break a task operation
    console.warn("logActivity failed", e?.message);
  }
}

/**
 * Notify every assignee of a task event.
 */
export async function notifyAssignees(task, { title, message, type = "task", priority = "normal", action }) {
  const ids = task.assignee_ids || [];
  if (!ids.length) return;
  const link = `/tasks/${task.id}`;
  try {
    await base44.entities.Notification.bulkCreate(
      ids.map((uid) => ({
        title,
        message,
        type,
        category: "assignment",
        priority,
        user_id: uid,
        link,
        icon: "CheckSquare",
        action,
        source: "spark-tasks",
      }))
    );
  } catch (e) {
    console.warn("notifyAssignees failed", e?.message);
  }
}

/**
 * Recompute + persist progress_percent on a task.
 */
export async function syncProgress(task) {
  const pct = computeProgress(task);
  if (pct === task.progress_percent) return pct;
  try {
    await base44.entities.TaskManagement.update(task.id, { progress_percent: pct });
  } catch (e) {
    console.warn("syncProgress failed", e?.message);
  }
  return pct;
}