import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * activateAnnouncements — scheduled maintenance tick (invoked every 5 min by the
 * "Activate Scheduled Announcements" workflow). Publishes announcements whose
 * publish_date has arrived and archives ones whose expires_at has passed.
 * Runs as the service role (no user context) like the other scheduled reminders.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    // 1. Publish scheduled announcements whose time has arrived
    const scheduled = await base44.asServiceRole.entities.StaffAnnouncement.filter({ status: "scheduled" }, "-created_date", 500);
    const toPublish = (scheduled || []).filter((a) => a.publish_date && new Date(a.publish_date).toISOString() <= now);
    for (const a of toPublish) {
      await base44.asServiceRole.entities.StaffAnnouncement.update(a.id, { status: "published" }).catch(() => {});
    }

    // 2. Archive published announcements that have expired
    const published = await base44.asServiceRole.entities.StaffAnnouncement.filter({ status: "published" }, "-created_date", 500);
    const toArchive = (published || []).filter((a) => a.expires_at && new Date(a.expires_at).toISOString() <= now);
    for (const a of toArchive) {
      await base44.asServiceRole.entities.StaffAnnouncement.update(a.id, { status: "archived", pinned: false }).catch(() => {});
    }

    return Response.json({ status: "success", published: toPublish.length, archived: toArchive.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});