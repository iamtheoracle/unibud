import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification, hoursUntil, shortWhen } from "../../shared/notifications.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const leadHours = 24;

    const pending = await base44.asServiceRole.entities.Assignment.filter({ status: "pending" }, "-due_date", 200);

    const dueSoon = (pending || []).filter((a) => {
      const h = hoursUntil(a.due_date);
      return h !== null && h >= -1 && h <= leadHours;
    });

    let created = 0;
    for (const a of dueSoon) {
      const isOverdue = hoursUntil(a.due_date) < 0;
      const notif = buildNotification({
        title: isOverdue ? `Overdue: ${a.title}` : `Due soon: ${a.title}`,
        message: `${a.course_code || "Course"} — ${isOverdue ? "was due" : "due"} ${shortWhen(a.due_date, true)}${a.priority === "high" ? " · High priority" : ""}`,
        type: "academic",
        icon: "ClipboardList",
        link: "/assignments",
      });
      await base44.asServiceRole.entities.Notification.create(notif).catch(() => {});
      created++;
    }

    return Response.json({ status: "success", scanned: (pending || []).length, dueSoon: dueSoon.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});