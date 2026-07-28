// Spark Master Orchestrator.
// Flow: User → Bud → Spark → specialist agents → Spark validation → Bud response.
// Spark plans which agents are needed, executes independent tasks in parallel
// and dependent tasks sequentially (respecting deps), validates, and merges
// into one unified answer. Internal orchestration is never exposed to users.

import { base44 } from "@/api/base44Client";
import { loadActiveAgents } from "./agents/registry";
import { runAgent } from "./agents/agentRunner";

const PLANNER_SCHEMA = {
  type: "object",
  properties: {
    reasoning: { type: "string" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          agent_id: { type: "string" },
          depends_on: { type: "array", items: { type: "string" } },
          input_summary: { type: "string" },
        },
      },
    },
  },
};

const VALIDATOR_SCHEMA = {
  type: "object",
  properties: {
    passed: { type: "boolean" },
    conflicts: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
};

function genId() {
  return "spark_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function logRun(data) {
  try {
    return await base44.entities.SparkExecutionLog.create(data);
  } catch {
    return null;
  }
}

async function updateLog(id, patch) {
  if (!id) return;
  try {
    await base44.entities.SparkExecutionLog.update(id, patch);
  } catch {
    /* non-fatal */
  }
}

/**
 * Orchestrate a user request through Spark. Returns a unified Bud-facing answer.
 * @param {string} userPrompt
 * @param {object} context - { screen, user, ... } shared context
 */
export async function orchestrate(userPrompt, context = {}, fileUrls = []) {
  const fileArg = fileUrls.length ? { file_urls: fileUrls } : {};
  const runId = genId();
  const started = Date.now();
  const ctxLine = context?.screen
    ? `The student is on the ${context.screen.name} page — ${context.screen.description}.`
    : "";

  // 1. Load active agents
  const agents = await loadActiveAgents();
  const agentMap = new Map(agents.map((a) => [a.agent_id, a]));

  // 2. Create the execution log record (planning state)
  const logRec = await logRun({
    run_id: runId,
    user_prompt: userPrompt,
    status: "planning",
    agents_selected: [],
    agent_results: [],
    plan: {},
  });

  // 3. Plan: decide which agents are required
  let plan = { reasoning: "", tasks: [] };
  try {
    const agentMenu = agents
      .map((a) => `- ${a.agent_id} (${a.name}, ${a.role})`)
      .join("\n");
    const planRes = await base44.integrations.Core.InvokeLLM({
      prompt: [
        "You are Spark, the master orchestrator of the UNIBUD multi-agent system.",
        ctxLine ? `\n${ctxLine}` : "",
        `\nUser request: ${userPrompt}`,
        `\n\nAvailable specialist agents:\n${agentMenu}`,
        `\nBreak this request into the MINIMAL set of tasks needed to answer well. Select only the agents truly required (usually 1-3). Define dependencies between tasks. If a simple conversational answer suffices with no specialist needed, return an empty tasks array and explain in reasoning.`,
        `\nRespond as JSON matching the schema.`,
      ].join(""),
      response_json_schema: PLANNER_SCHEMA,
    });
    plan = planRes || plan;
  } catch (err) {
    plan = { reasoning: "Planner failed; answering directly.", tasks: [] };
  }

  await updateLog(logRec?.id, {
    plan,
    agents_selected: (plan.tasks || []).map((t) => t.agent_id),
    status: "executing",
  });

  // 4. Execute tasks respecting dependencies (parallel where independent)
  const tasks = (plan.tasks || []).filter((t) => agentMap.has(t.agent_id));
  const outputs = {}; // agent_id -> output
  const results = [];
  const completed = new Set();

  // Simple topological execution: repeat passes until no progress
  let passes = 0;
  while (completed.size < tasks.length && passes < tasks.length + 2) {
    passes++;
    const ready = tasks.filter(
      (t) => !completed.has(t.id) && (t.depends_on || []).every((d) => outputs[d] !== undefined || completed.has(d))
    );
    // Run ready tasks in parallel
    const runResults = await Promise.all(
      ready.map((t) => runAgent(agentMap.get(t.agent_id), t, outputs))
    );
    for (const r of runResults) {
      outputs[r.agent_id] = r.output;
      results.push(r);
      completed.add(tasks.find((t) => t.agent_id === r.agent_id)?.id || r.agent_id);
    }
  }

  // 5. Validate
  await updateLog(logRec?.id, { status: "validating", agent_results: results });
  let validation = { passed: true, conflicts: [], notes: "" };
  if (results.length > 1) {
    try {
      const vRes = await base44.integrations.Core.InvokeLLM({
        prompt: [
          "You are Spark validation. Check these specialist agent outputs for conflicts, gaps, or inconsistencies. Approve or flag.",
          `\nUser request: ${userPrompt}`,
          `\nAgent outputs:`,
          ...results.map((r) => `\n[${r.agent_id}] ${r.output}`),
          `\nRespond as JSON.`,
        ].join(""),
        response_json_schema: VALIDATOR_SCHEMA,
      });
      validation = vRes || validation;
    } catch {
      validation = { passed: true, conflicts: [], notes: "validation skipped" };
    }
  }

  // 6. Merge into one unified Bud answer
  let merged;
  if (results.length === 0) {
    // No specialist needed — answer directly as Bud.
    try {
      merged = await base44.integrations.Core.InvokeLLM({
        prompt: [
          "You are Bud, UNIBUD's calm, supportive mentor companion.",
          ctxLine ? `\n${ctxLine}` : "",
          `\nStudent: ${userPrompt}`,
          `\nAnswer warmly and helpfully. Never mention internal agents or orchestration.`,
        ].join(""),
        ...fileArg,
      });
    } catch {
      merged = "I'm having trouble connecting right now. Let's try again in a moment!";
    }
  } else {
    try {
      merged = await base44.integrations.Core.InvokeLLM({
        prompt: [
          "You are Bud, UNIBUD's calm, supportive mentor companion. Spark gathered specialist input for you. Merge it into ONE unified, natural answer for the student.",
          ctxLine ? `\n${ctxLine}` : "",
          `\nStudent request: ${userPrompt}`,
          `\nSpecialist inputs:`,
          ...results.map((r) => `\n[${r.agent_id}] ${r.output}`),
          validation?.conflicts?.length ? `\nKnown conflicts to resolve: ${validation.conflicts.join("; ")}` : "",
          `\nRespond as Bud directly to the student. Never mention Spark, agents, orchestration, or internal steps. Be warm and concise.`,
        ].join(""),
        ...fileArg,
      });
    } catch {
      merged = "I'm having trouble connecting right now. Let's try again in a moment!";
    }
  }

  await updateLog(logRec?.id, {
    status: "complete",
    validation,
    merged_output: merged,
    total_latency_ms: Date.now() - started,
  });

  return {
    runId,
    answer: merged,
    agentsUsed: results.map((r) => r.agent_id),
    latencyMs: Date.now() - started,
  };
}