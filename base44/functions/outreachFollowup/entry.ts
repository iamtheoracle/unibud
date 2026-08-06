import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const outreachId = body.outreach_id || body.entity_id;

    // Fetch latest record (payload may be stale after the wait)
    let record = null;
    if (outreachId) {
      try {
        record = await base44.asServiceRole.entities.InstitutionOutreach.get(outreachId);
      } catch {
        record = null;
      }
    }

    if (!record) {
      return Response.json({ status: "skipped", reason: "record_not_found" });
    }
    if (record.outreach_status !== "sent") {
      return Response.json({ status: "skipped", reason: `status_${record.outreach_status}` });
    }

    // Mark as pending a follow-up response nudged
    await base44.asServiceRole.entities.InstitutionOutreach.update(outreachId, {
      notes: `${(record.notes || "").trim()}\n[Auto] Follow-up reminder logged ${new Date().toISOString()}`,
    });

    await base44.asServiceRole.entities.Notification.create({
      title: `Outreach follow-up: ${record.institution_name}`,
      message: `${record.contact_name || "Contact"} hasn't responded in 7 days. Tap to send a reminder.`,
      type: "system",
      icon: "MailWarning",
      link: "/portal/institution-outreach",
    }).catch(() => {});

    return Response.json({ status: "success", nudged: true, institution: record.institution_name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});