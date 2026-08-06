import { base44 } from "@/api/base44Client";
import { getAgentEntityContext } from "./entityFetchers";

/**
 * executeAgent — runs a single domain agent.
 *
 * Flow:
 *   1. Check SharedMemory for duplicate (skip if already processed)
 *   2. Fetch entity context for the agent's domain (cached in SharedMemory)
 *   3. Build the agent's specialized prompt (system prompt + entity data + history)
 *   4. Call InvokeLLM with the agent's specialized prompt
 *   5. Store the result in SharedMemory for Oracle's combine step
 *
 * Returns: { agentId, domain, response }
 */
export async function executeAgent(agent, message, screenContext, history, memory) {
  // Duplicate prevention — skip if already processed for this query
  if (memory.isProcessed(agent.id, message)) {
    const cached = memory.getResults().find((r) => r.agentId === agent.id);
    if (cached) return cached;
  }

  // Fetch entity data (cached per turn in SharedMemory)
  const entityContext = await getAgentEntityContext(agent.id, memory);

  // Build conversation history (last 4 messages for context)
  const historyStr =
    history.length > 0
      ? history
          .slice(-4)
          .map((m) => `${m.role === "user" ? "Student" : "Bud"}: ${m.content}`)
          .join("\n")
      : "";

  const prompt =
    `${agent.systemPrompt}\n\n` +
    `Current screen: ${screenContext.name} — ${screenContext.description || "general"}\n\n` +
    (entityContext ? `Relevant data:\n${entityContext}\n\n` : "") +
    (historyStr ? `Recent conversation:\n${historyStr}\n\n` : "") +
    `Student request: ${message}\n\n` +
    `Provide a focused analysis. Do not address the student directly — Oracle will combine your response.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  const response = typeof res === "string" ? res : res?.response || res?.text || "";

  const result = { agentId: agent.id, domain: agent.domain, response };
  memory.addResult(result);
  memory.markProcessed(agent.id, message);
  return result;
}