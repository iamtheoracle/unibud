// Spark Agent Runner — executes a single specialist agent via InvokeLLM.
// Builds a specialist system prompt from the agent's config and runs it
// with scoped context + prior outputs from the workflow. Includes retry.

import { base44 } from "@/api/base44Client";

function buildSystemPrompt(agent) {
  return [
    `You are ${agent.name}, the ${agent.role} specialist agent in UNIBUD's Spark multi-agent system (${agent.division} Division).`,
    ``,
    `Focus: ${agent.focus}`,
    ``,
    `Responsibilities:`,
    ...(agent.responsibilities || []).map((r) => `- ${r}`),
    ``,
    `Tools you may reference: ${(agent.tools || []).join(", ") || "none"}`,
    `Context scope: ${agent.context_scope}`,
    `Memory scope: ${agent.memory_scope}`,
    ``,
    `Validation rules:`,
    ...(agent.validation_rules || []).map((r) => `- ${r}`),
    ``,
    `Success criteria:`,
    ...(agent.success_criteria || []).map((r) => `- ${r}`),
    ``,
    `Failure handling: ${agent.failure_handling}`,
    `Handoff rules: ${agent.handoff_rules}`,
    ``,
    `Produce a focused, accurate specialist response. Do not pretend to have capabilities you don't. If the task is outside your scope, say so and return to Spark.`,
  ].join("\n");
}

/**
 * Run one agent. Returns { agent_id, status, output, latency_ms, retries }.
 * `priorOutputs` is a map of agent_id -> output for dependency threading.
 */
export async function runAgent(agent, task, priorOutputs = {}) {
  const started = Date.now();
  const depContext = (agent.dependencies || [])
    .map((dep) => `Prior output from ${dep}: ${priorOutputs[dep] || "(none)"}`)
    .join("\n");

  const userPrompt = [
    `Task: ${task.input_summary || task.input || ""}`,
    depContext ? `\n${depContext}` : "",
    `\nReturn your specialist result as a concise, self-contained answer.`,
  ].join("\n");

  let attempts = 0;
  const max = (agent.retry_max ?? 2) + 1;
  let lastErr = null;
  while (attempts < max) {
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: userPrompt,
      });
      return {
        agent_id: agent.agent_id,
        status: "success",
        output: typeof res === "string" ? res : JSON.stringify(res),
        latency_ms: Date.now() - started,
        retries: attempts,
      };
    } catch (err) {
      lastErr = err;
      attempts++;
      if (attempts < max) {
        await new Promise((r) => setTimeout(r, 400 * attempts));
      }
    }
  }
  return {
    agent_id: agent.agent_id,
    status: "failed",
    output: lastErr?.message || "Agent failed after retries",
    latency_ms: Date.now() - started,
    retries: attempts - 1,
  };
}

export { buildSystemPrompt };