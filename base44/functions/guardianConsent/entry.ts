import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * guardianConsent — student-side consent management.
 * action "list"    → pending/all ConsentLinks matching the student's email.
 * action "approve" → verify email match, set student_id + status approved.
 * action "decline" → verify email match, set status declined.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "list") {
      const links = await base44.asServiceRole.entities.ConsentLink.filter({ student_email: user.email });
      return Response.json({ links: links || [] });
    }

    if (action === "approve" || action === "decline") {
      const link = await base44.asServiceRole.entities.ConsentLink.get(body.link_id).catch(() => null);
      if (!link) return Response.json({ error: "Link not found" }, { status: 404 });
      if (link.student_email !== user.email) return Response.json({ error: "This request is not for you" }, { status: 403 });
      const update = action === "approve"
        ? { status: "approved", student_id: user.id, student_name: user.full_name, approved_at: new Date().toISOString() }
        : { status: "declined" };
      await base44.asServiceRole.entities.ConsentLink.update(link.id, update);
      return Response.json({ status: "ok", link_id: link.id, action });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});