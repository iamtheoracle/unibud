import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification } from "../../shared/notifications.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const studentId = body.student_id || body.entity_id;
    const fullName = body.full_name || body.name || "there";

    const notif = buildNotification({
      title: `Welcome to UNIBUD, ${fullName.split(" ")[0]}!`,
      message: "Your campus is now in your pocket. Tap to set your academic goals and meet Bud.",
      type: "system",
      icon: "Sparkles",
      link: "/unibud-dashboard",
    });
    await base44.asServiceRole.entities.Notification.create(notif).catch(() => {});

    return Response.json({ status: "success", student_id: studentId, welcomed: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});