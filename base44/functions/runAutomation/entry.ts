import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * runAutomation — executes an automation on behalf of its owner.
 * Validates ownership, then runs each action. Immediate actions (notify,
 * reminder, email) execute now; AI actions produce suggestions stored in
 * the run log; other actions are queued as suggestions requiring approval.
 * Never deletes data, modifies grades, or shares PII automatically.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const autoId = body.automation_id;
    if (!autoId) return Response.json({ error: "automation_id required" }, { status: 400 });

    const auto = await base44.asServiceRole.entities.Automation.get(autoId).catch(() => null);
    if (!auto) return Response.json({ error: "Automation not found" }, { status: 404 });
    const isAdmin = user.role === "admin";
    if (auto.created_by_id !== user.id && !isAdmin) return Response.json({ error: "Not your automation" }, { status: 403 });

    const log = [];
    const actionsExecuted = [];
    let failed = false;
    let errorMsg = "";
    const startedAt = new Date().toISOString();

    for (const a of auto.actions || []) {
      const cfg = a.config || {};
      try {
        if (a.key === "notify") {
          await base44.asServiceRole.entities.Notification.create({ title: auto.name, message: cfg.message || "Automation triggered", type: "system", category: "system", user_id: user.id });
          log.push("✓ Sent notification"); actionsExecuted.push({ key: a.key, status: "done" });
        } else if (a.key === "create_reminder") {
          await base44.asServiceRole.entities.Notification.create({ title: "Reminder", message: cfg.message || "Reminder", type: "reminder", category: "system", user_id: user.id });
          log.push("✓ Created reminder"); actionsExecuted.push({ key: a.key, status: "done" });
        } else if (a.key === "send_email") {
          await base44.integrations.Core.SendEmail({ to: user.email, subject: cfg.subject || auto.name, body: cfg.body || "" });
          log.push("✓ Sent email"); actionsExecuted.push({ key: a.key, status: "done" });
        } else if (a.key === "summarize_document" || a.key === "generate_flashcards" || a.key === "generate_quiz") {
          const prompt = a.key === "summarize_document"
            ? `Summarize this study content concisely: ${cfg.topic || ""}`
            : a.key === "generate_flashcards"
              ? `Generate 5 study flashcards as "Q: ... A: ..." about: ${cfg.topic || "the topic"}`
              : `Generate 3 practice quiz questions (with answers) about: ${cfg.topic || "the topic"}`;
          const res = await base44.integrations.Core.InvokeLLM({ prompt });
          const text = typeof res === "string" ? res : JSON.stringify(res);
          log.push(`✓ ${a.key} (suggestion):\n${text}`); actionsExecuted.push({ key: a.key, status: "suggested" });
        } else {
          log.push(`⊙ ${a.key}: queued — requires your approval`);
          actionsExecuted.push({ key: a.key, status: "queued" });
        }
      } catch (e) {
        log.push(`✗ ${a.key} failed: ${e.message}`); failed = true; errorMsg = e.message;
      }
    }

    const status = failed ? "failed" : "success";
    const completedAt = new Date().toISOString();
    await base44.asServiceRole.entities.Automation.update(autoId, { last_run_at: startedAt, run_count: (auto.run_count || 0) + 1 }).catch(() => {});
    await base44.asServiceRole.entities.AutomationRun.create({
      automation_id: autoId, automation_name: auto.name, owner_id: auto.created_by_id,
      status, trigger_source: body.source || "manual", log, error: errorMsg,
      actions_executed: actionsExecuted, started_at: startedAt, completed_at: completedAt,
    }).catch(() => {});

    return Response.json({ status, log, actions_executed: actionsExecuted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});