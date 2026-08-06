import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * studyGroupEventBridge
 *
 * Bridges StudyGroupTask / StudyGroupMessage entity events (raised by the
 * Spark EventBus via entity-trigger workflows) into persisted Notification
 * records. Audience resolution happens here on the server so that delivery
 * is decoupled from generation:
 *   - StudyGroupTask create/update -> notify the assignee.
 *   - StudyGroupMessage create     -> notify every group member except the sender.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { entity_name, event_type, entity_id, data } = body;

    if (entity_name === "StudyGroupTask") {
      return await handleTaskEvent(base44, event_type, data, entity_id);
    }
    if (entity_name === "StudyGroupMessage") {
      return await handleMessageEvent(base44, user, data);
    }
    return Response.json({ skipped: true, reason: "unsupported_entity" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleTaskEvent(base44, eventType, data, taskId) {
  const assignee = data?.assigned_to;
  if (!assignee) return Response.json({ skipped: true, reason: "no_assignee" });

  const group = await safeGetGroup(base44, data?.group_id);
  const title = data?.title || "Study group task";
  const verb = eventType === "update" ? "updated" : "assigned";
  const created = await base44.asServiceRole.entities.Notification.create({
    title: `Task ${verb}`,
    message: `"${title}"${group?.name ? ` in ${group.name}` : ""}.`,
    type: "academic",
    icon: "CheckSquare",
    link: `/study-groups/${data?.group_id || ""}`,
    user_id: assignee,
  });
  return Response.json({ created: 1, notification_id: created.id, task_id: taskId });
}

async function handleMessageEvent(base44, user, data) {
  const group = await safeGetGroup(base44, data?.group_id);
  if (!group) return Response.json({ skipped: true, reason: "group_not_found" });

  const members = Array.isArray(group.members) ? group.members : [];
  const targetIds = members
    .map((m) => (typeof m === "object" && m ? m.user_id : m))
    .filter((id) => typeof id === "string" && id && id !== user.id);

  if (targetIds.length === 0) return Response.json({ skipped: true, reason: "no_audience" });

  const sender = data?.sender_name || "A member";
  const preview = (data?.message || "").slice(0, 80);
  const base = {
    title: `New message in ${group.name}`,
    message: `${sender}: ${preview}`,
    type: "social",
    icon: "MessageCircle",
    link: `/study-groups/${data?.group_id || ""}`,
  };
  const records = targetIds.map((uid) => ({ ...base, user_id: uid }));
  const created = await base44.asServiceRole.entities.Notification.bulkCreate(records);
  return Response.json({ created: Array.isArray(created) ? created.length : 0, group_id: group.id });
}

async function safeGetGroup(base44, groupId) {
  if (!groupId) return null;
  try {
    return await base44.asServiceRole.entities.StudyGroup.get(groupId);
  } catch {
    return null;
  }
}