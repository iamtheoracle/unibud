import { base44 } from "@/api/base44Client";

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    task_type: { type: "string", enum: ["assignment", "group_project", "research_project", "thesis", "dissertation", "presentation", "laboratory_work", "department_task", "administrative_task", "club_activity", "event_planning", "meeting_action_item", "marketplace_order_task", "finance_approval", "custom"] },
    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
    due_date: { type: "string", description: "ISO date (YYYY-MM-DD) if determinable, otherwise empty" },
    tags: { type: "array", items: { type: "string" } },
    checklist: { type: "array", items: { type: "string" }, description: "Suggested subtasks / checklist items" },
  },
  required: ["title", "task_type", "priority"],
};

/**
 * Parse a natural-language task request via Spark (InvokeLLM) into a
 * structured task ready for review + creation.
 */
export async function parseTaskFromText(text) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are Spark's task planner. Convert the user's natural-language request into a structured collaborative task for a university platform (UNIBUD).

Return ONLY valid JSON matching the schema. Infer the most fitting task_type and priority from context. Generate 3-6 actionable checklist items. Provide an ISO due date (YYYY-MM-DD) only if the user explicitly states one (e.g. "by Friday", "due tomorrow", "next week"). Leave due_date empty if not stated.

User request: """${text}"""`,
    response_json_schema: SCHEMA,
  });
  return res;
}

/**
 * Spark AI suggestions: break a task into subtasks, suggest a timeline,
 * recommend priorities, and summarize progress.
 */
export async function sparkTaskAssist(task, mode = "subtasks") {
  const prompts = {
    subtasks: `Break this task into 4-7 concrete, ordered subtasks. Return JSON { "checklist": ["...","..."] }.`,
    summary: `Summarize the current progress of this task in 2-3 sentences for a status report. Return JSON { "summary": "..." }.`,
    next: `Recommend the next 3 concrete actions to move this task forward. Return JSON { "actions": ["...","...","..."] }.`,
  };
  const ctx = `Task: ${task.title}\nDescription: ${task.description || "(none)"}\nStatus: ${task.status}\nPriority: ${task.priority}\nDue: ${task.due_date || "none"}\nChecklist: ${(task.checklist || []).map((c) => (c.done ? "[x]" : "[ ]") + " " + c.text).join("\n") || "(none)"}\nMilestones: ${(task.milestones || []).map((m) => (m.done ? "[x]" : "[ ]") + " " + m.title).join("\n") || "(none)"}`;
  const schema = mode === "subtasks"
    ? { type: "object", properties: { checklist: { type: "array", items: { type: "string" } } }, required: ["checklist"] }
    : mode === "summary"
    ? { type: "object", properties: { summary: { type: "string" } }, required: ["summary"] }
    : { type: "object", properties: { actions: { type: "array", items: { type: "string" } } }, required: ["actions"] };
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `${prompts[mode]}\n\n${ctx}`,
    response_json_schema: schema,
  });
  return res;
}