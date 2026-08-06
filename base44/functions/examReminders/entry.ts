import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification, shortWhen } from "../../shared/notifications.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const upcoming = await base44.asServiceRole.entities.Exam.filter({ status: "upcoming" }, "date", 200);

    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const soon = (upcoming || []).filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      if (Number.isNaN(d.getTime())) return false;
      return d >= now && d <= sevenDays;
    });

    let created = 0;
    for (const e of soon) {
      const daysAway = Math.ceil((new Date(e.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const notif = buildNotification({
        title: daysAway <= 1 ? `Exam tomorrow: ${e.course_code}` : `Exam in ${daysAway} days: ${e.course_code}`,
        message: `${e.title} (${e.type || "exam"}) — ${shortWhen(e.date)}${e.location ? ` · ${e.location}` : ""}${e.start_time ? ` · ${e.start_time}` : ""}`,
        type: "academic",
        icon: "GraduationCap",
        link: "/academics",
      });
      await base44.asServiceRole.entities.Notification.create(notif).catch(() => {});
      created++;
    }

    return Response.json({ status: "success", scanned: (upcoming || []).length, soon: soon.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});