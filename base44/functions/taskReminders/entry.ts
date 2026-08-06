import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification, hoursUntil, shortWhen } from "../../shared/notifications.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const leadHours = 48; // remind 2 days before due

    // Scan non-completed tasks that have a due date and assignees
    const tasks = await base44.asServiceRole.entities.TaskManagement.list("-due_date", 500);
    const active = (tasks || []).filter((t) =>
      t.due_date &&
      !["completed", "approved", "archived", "rejected"].includes(t.status) &&
      (t.assignee_ids || []).length > 0
    );

    const dueSoon = active.filter((t) => {
      const h = hoursUntil(t.due_date + "T23:59:59");
      return h !== null && h >= -96 && h <= leadHours; // include up to 4 days overdue
    });

    let created = 0;
    for (const t of dueSoon) {
      const h = hoursUntil(t.due_date + "T23:59:59");
      const isOverdue = h < 0;
      const notif = buildNotification({
        title: isOverdue ? `Task overdue: ${t.title}` : `Task due soon: ${t.title}`,
        message: `${isOverdue ? "Was due" : "Due"} ${shortWhen(t.due_date, false)}${t.priority === "urgent" ? " · Urgent" : t.priority === "high" ? " · High priority" : ""}`,
        type: "task",
        category: "assignment",
        icon: "CheckSquare",
        link: `/tasks/${t.id}`,
        action: isOverdue ? "overdue" : "due_soon",
        source: "spark-tasks",
        priority: isOverdue ? "high" : "normal",
      });
      // Notify each assignee individually
      for (const uid of t.assignee_ids) {
        await base44.asServiceRole.entities.Notification.create({ ...notif, user_id: uid }).catch(() => {});
        created++;
      }
    }

    return Response.json({ status: "success", scanned: (tasks || []).length, dueSoon: dueSoon.length, notifications: created });
  } catch (error) {
    console.error("taskReminders error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});