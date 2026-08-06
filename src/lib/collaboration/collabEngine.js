import { base44 } from "@/api/base44Client";

/**
 * Spark Collaboration Intelligence — coordinates teamwork across UNIBUD.
 * Recommends teammates, suggests resources, detects blockers, tracks progress,
 * summarizes project activity, recommends next actions, generates meeting
 * summaries, and helps Bud build study plans. Reuses the Workspace /
 * CollaborationItem / CollaborationActivity entities — no parallel store.
 */

const TODAY = () => new Date().toISOString().slice(0, 10);

/** Heuristic blocker detection (no LLM cost). */
export function detectBlockers(items) {
  const blockers = [];
  (items || []).forEach((it) => {
    if (it.status === "blocked") blockers.push({ item: it, reason: "Marked as blocked" });
    else if (it.due_date && it.due_date < TODAY() && it.status !== "done" && it.status !== "approved")
      blockers.push({ item: it, reason: `Overdue (${it.due_date})` });
    else if (!it.assignee_id && it.type === "task" && it.status === "open")
      blockers.push({ item: it, reason: "Unassigned task" });
  });
  return blockers;
}

/** Progress calculation (no LLM cost). */
export function computeProgress(items) {
  const tasks = (items || []).filter((i) => ["task", "checklist", "study_plan"].includes(i.type));
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "done" || t.status === "approved").length;
  return Math.round((done / tasks.length) * 100);
}

/** Spark: recommend teammates for a workspace from a candidate pool. */
export async function recommendTeammates(workspace, candidates, intent) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark helping staff a UNIBUD collaboration workspace "${workspace?.title}" (${workspace?.type}).\n` +
      `Goal: ${intent || "general productivity"}.\n` +
      `Candidates: ${JSON.stringify((candidates || []).slice(0, 40).map((c) => ({ id: c.id, name: c.name, role: c.role, context: c.context })))}.\n` +
      `Rank the best 5 teammates. Return JSON { recommendations: [{id, name, why, suggested_role}] }.`,
    response_json_schema: {
      type: "object",
      properties: { recommendations: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, why: { type: "string" }, suggested_role: { type: "string" } } } } },
    },
  });
  return res?.recommendations || [];
}

/** Spark: suggest resources for a workspace. */
export async function suggestResources(workspace, items) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark. Suggest learning/collaboration resources for "${workspace?.title}" (${workspace?.type}).\n` +
      `Current work: ${(items || []).slice(0, 20).map((i) => i.title).join(", ") || "none yet"}.\n` +
      `Return JSON { resources: [{title, type, why, search_query}] } where type is one of: note, document, link, tool, person.`,
    response_json_schema: {
      type: "object",
      properties: { resources: { type: "array", items: { type: "object", properties: { title: { type: "string" }, type: { type: "string" }, why: { type: "string" }, search_query: { type: "string" } } } } },
    },
  });
  return res?.resources || [];
}

/** Spark: summarize recent project activity. */
export async function summarizeActivity(activities, workspace) {
  const lines = (activities || []).slice(0, 40).map((a) => `${a.actor_name} ${a.action} ${a.target_title || ""}: ${a.summary || ""}`);
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark. Summarize recent activity in "${workspace?.title}".\n` +
      `Return JSON { summary, highlights: [up to 5], momentum: "rising"|"steady"|"stalling", attention: [items needing attention] }.\n\nActivity:\n${lines.join("\n")}`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        highlights: { type: "array", items: { type: "string" } },
        momentum: { type: "string" },
        attention: { type: "array", items: { type: "string" } },
      },
    },
  });
  return res;
}

/** Spark: recommend next actions for a workspace. */
export async function recommendNextActions(workspace, items, activities) {
  const blockers = detectBlockers(items);
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark for workspace "${workspace?.title}". Recommend the next 5 actions to keep momentum.\n` +
      `Open items: ${(items || []).slice(0, 25).map((i) => ({ title: i.title, type: i.type, status: i.status, due: i.due_date }))}.\n` +
      `Blockers: ${JSON.stringify(blockers.map((b) => b.item?.title))}.\n` +
      `Return JSON { actions: [{action, priority: "high"|"medium"|"low", owner_hint}] }.`,
    response_json_schema: {
      type: "object",
      properties: { actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string" }, owner_hint: { type: "string" } } } } },
    },
  });
  return res?.actions || [];
}

/** Spark: generate a meeting summary from activity + notes. */
export async function generateMeetingSummary(workspace, agenda, notes) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Bud generating a meeting summary for "${workspace?.title}".\n` +
      `Agenda: ${agenda || "—"}. Notes: ${notes || "—"}.\n` +
      `Return JSON { summary, decisions: [], action_items: [{item, owner}], next_meeting_suggestion }.`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        decisions: { type: "array", items: { type: "string" } },
        action_items: { type: "array", items: { type: "object", properties: { item: { type: "string" }, owner: { type: "string" } } } },
        next_meeting_suggestion: { type: "string" },
      },
    },
  });
  return res;
}

/** Spark/Bud: create a study plan as structured checklist weeks. */
export async function createStudyPlan(workspace, goal, weeks = 4) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Bud building a ${weeks}-week study plan for "${workspace?.title}".\n` +
      `Goal: ${goal}.\n` +
      `Return JSON { weeks: [{week, focus, items: [string]}] } — each item a concrete study task.`,
    response_json_schema: {
      type: "object",
      properties: {
        weeks: { type: "array", items: { type: "object", properties: { week: { type: "number" }, focus: { type: "string" }, items: { type: "array", items: { type: "string" } } } } },
      },
    },
  });
  return res?.weeks || [];
}

/** Parse @mentions from text into names. */
export function parseMentions(text, members) {
  if (!text) return [];
  const matches = text.match(/@(\w+)/g) || [];
  const names = matches.map((m) => m.slice(1));
  return (members || [])
    .filter((m) => names.some((n) => (m.name || "").toLowerCase().startsWith(n.toLowerCase())))
    .map((m) => m.user_id);
}