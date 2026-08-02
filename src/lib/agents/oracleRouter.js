import { base44 } from "@/api/base44Client";
import { DOMAIN_AGENTS, getAgentById, getGeneralAgent } from "./domainRegistry";
import { executeAgent } from "./agentExecutor";
import { SharedMemory } from "./sharedMemory";

/**
 * Oracle Router — the master coordinator of the Bud Agent Operating System.
 *
 * Flow:
 *   1. Classify the user's message → determine which domain agents to invoke
 *   2. Execute selected agents in parallel (each fetches entity data + calls LLM)
 *   3. Combine all agent results into ONE unified Bud response
 *
 * Bud is the sole visible AI — internal agents are never exposed to the user.
 * Multiple agents may execute simultaneously for complex requests.
 * SharedMemory prevents duplicate entity fetches and agent re-execution.
 */

const BUD_PERSONALITY =
  "You are Bud, a warm, calm, and encouraging academic companion for a university student. " +
  "Keep replies short, friendly, and helpful — never robotic. " +
  "Never mention internal agents, systems, or processes — present everything as your own knowledge. " +
  "If multiple analyses are provided, weave them into one seamless response.";

/**
 * Fast keyword-based classification — no LLM call needed.
 * Scans the message for domain-specific keywords and returns matching agent IDs.
 */
function classifyByKeywords(message) {
  const text = message.toLowerCase();
  const matched = new Set();
  for (const agent of DOMAIN_AGENTS) {
    if (agent.keywords.some((kw) => text.includes(kw))) {
      matched.add(agent.id);
    }
  }
  return Array.from(matched);
}

/**
 * routeAndRespond — the main entry point called by BudSheet.
 *
 * @param {string} message — the user's message
 * @param {object} screenContext — { name, description } from budScreenContext
 * @param {array} history — conversation history [{ role, content }]
 * @returns {string} — Bud's unified response
 */
export async function routeAndRespond(message, screenContext, history = []) {
  const memory = new SharedMemory();
  memory.setContext("screen", screenContext);
  memory.setContext("history", history);

  // Step 1: Classify — which agents are needed?
  let agentIds = classifyByKeywords(message);

  // Step 2: Execute selected agents in parallel (max 3 per request)
  let agentResults = [];
  if (agentIds.length > 0) {
    const agents = agentIds
      .map((id) => getAgentById(id))
      .filter(Boolean)
      .slice(0, 3);

    const results = await Promise.allSettled(
      agents.map((agent) =>
        executeAgent(agent, message, screenContext, history, memory)
      )
    );
    agentResults = results
      .filter((r) => r.status === "fulfilled" && r.value?.response)
      .map((r) => r.value);
  }

  // Step 3: Combine results into one unified Bud response
  if (agentResults.length === 0) {
    // No domain agents matched — use general conversational agent
    const general = getGeneralAgent();
    const result = await executeAgent(
      general,
      message,
      screenContext,
      history,
      memory
    );
    // For the general agent, return its response directly (it speaks as Bud)
    return result.response || "I'm here for you.";
  }

  if (agentResults.length === 1) {
    // Single agent — present as Bud (revoice through Bud's personality)
    return combineAsBud(message, screenContext, history, agentResults);
  }

  // Multiple agents — combine their analyses
  return combineAsBud(message, screenContext, history, agentResults);
}

/**
 * Combines agent results into a single unified Bud response.
 * Oracle calls this with all agent outputs, and Bud's personality
 * wraps them into one natural, seamless reply.
 */
async function combineAsBud(message, screenContext, history, agentResults) {
  const agentOutputs = agentResults
    .map((r) => `[${r.domain}]: ${r.response}`)
    .join("\n\n");

  const historyStr =
    history.length > 0
      ? history
          .slice(-4)
          .map((m) => `${m.role === "user" ? "Student" : "Bud"}: ${m.content}`)
          .join("\n")
      : "";

  const prompt =
    `${BUD_PERSONALITY}\n\n` +
    `Current screen: ${screenContext.name} — ${screenContext.description || "general"}\n\n` +
    (historyStr ? `Recent conversation:\n${historyStr}\n\n` : "") +
    `Student request: ${message}\n\n` +
    `Specialist analysis:\n${agentOutputs}\n\n` +
    `Combine the above into ONE unified, natural response in Bud's voice. ` +
    `Be warm, concise, and helpful. Never mention agents, systems, or internal processes. ` +
    `If the analyses conflict, use the most relevant one. ` +
    `If entity data was provided, reference real dates and details naturally.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  return typeof res === "string" ? res : res?.response || res?.text || "I'm here for you.";
}

/**
 * Get a summary of which agents would handle a message (for debugging/monitoring).
 * Not exposed to users — internal Oracle intelligence only.
 */
export function getRoutingPlan(message) {
  return classifyByKeywords(message);
}