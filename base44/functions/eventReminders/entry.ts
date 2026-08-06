import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification, shortWhen } from "../../shared/notifications.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const events = await base44.asServiceRole.entities.CampusEvent.filter({ status: "upcoming" }, "date", 200);

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 30 * 60 * 60 * 1000); // ~1.25 days window for "tomorrow"

    const soon = (events || []).filter((ev) => {
      if (!ev.date) return false;
      const d = new Date(ev.date);
      if (Number.isNaN(d.getTime())) return false;
      return d >= now && d <= tomorrow;
    });

    let created = 0;
    for (const ev of soon) {
      const notif = buildNotification({
        title: `Tomorrow: ${ev.title}`,
        message: `${ev.type ? ev.type.replace(/_/g, " ") : "Event"}${ev.location ? ` · ${ev.location}` : ""}${ev.organizer_name ? ` · ${ev.organizer_name}` : ""} — ${shortWhen(ev.date, true)}`,
        type: "social",
        icon: "CalendarDays",
        link: "/events",
      });
      await base44.asServiceRole.entities.Notification.create(notif).catch(() => {});
      created++;
    }

    return Response.json({ status: "success", scanned: (events || []).length, soon: soon.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});