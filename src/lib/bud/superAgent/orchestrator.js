/**
 * Super Agent Orchestrator
 *
 * Coordinates Bud's cognitive specialists. This is the brain that:
 *   1. Routes messages to the right specialist(s)
 *   2. Builds specialist-aware prompts
 *   3. Calls the LLM through the existing InvokeLLM integration
 *   4. Combines results into one natural Bud response
 *   5. Stores interaction in shared memory
 *
 * Bud always owns the response. Specialists shape the thinking, never the voice.
 */

import { base44 } from "@/api/base44Client";
import { routeMessage, getStatusMessage } from "./router";
import { SPECIALISTS, buildSpecialistLens, isDestructiveAction } from "./personas";
import { buildExperienceContext } from "./packManager";
import { buildSystemPrompt } from "@/lib/bud/prompts/systemPrompt";
import { createPersonality } from "@/lib/bud/personality";
import { retrieveRelevant, store as storeMemory, markAccessed } from "@/lib/bud/memoryBank";
import { buildAcademicContext, formatAcademicContext } from "@/lib/bud/contextBuilder";

const personality = createPersonality();

/**
 * Process a user message through the Super Agent pipeline.
 *
 * @param {object} params
 * @param {string} params.message — User's message
 * @param {string} params.userId — Current user ID
 * @param {object} params.user — Full user object
 * @param {string} params.screenContext — Current screen context name
 * @param {"auto"|"spark"|"oracle"|"orbit"} params.mode — Routing mode
 * @param {string[]} params.fileUrls — Attached file URLs
 * @param {object} params.conversationHistory — Prior messages for context
 * @param {string[]} params.activePacks — Active Experience Pack IDs (e.g. ["student", "health"])
 * @returns {Promise<{ text: string, specialists: string[], statusMessage: string, isDestructive: boolean, confidence: number, memoryUsed: number }>}
 */
export async function processSuperAgent({
  message,
  userId,
  user,
  screenContext,
  mode = "auto",
  fileUrls = [],
  conversationHistory = [],
  activePacks = ["student"],
}) {
  // 1. Route to specialist(s)
  const routing = routeMessage(message, mode);

  // 2. Retrieve shared memory
  const { memories, contextBlock } = await retrieveRelevant(message, {});
  if (memories.length > 0) {
    markAccessed(memories.map((m) => m.id));
  }

  // 3. Build academic context (lightweight)
  let academicContext = "";
  try {
    const ctx = await buildAcademicContext(userId, user?.data?.institution_id);
    academicContext = formatAcademicContext(ctx);
  } catch { /* context is optional */ }

  // 4. Build the combined system prompt
  const baseSystemPrompt = buildSystemPrompt(personality);
  const specialistLens = buildSpecialistLens(routing.specialists);
  const experienceCtx = buildExperienceContext(activePacks);
  const statusMessage = getStatusMessage(routing.specialists);

  // 5. Build conversation context from history (last 6 messages)
  const historyBlock = conversationHistory.slice(-6).map((m) =>
    `${m.role === "user" ? "Student" : "Bud"}: ${m.content}`
  ).join("\n");

  // 6. Build the full prompt
  const fullPrompt = [
    baseSystemPrompt,
    specialistLens,
    "\n# EXPERIENCE CONTEXT",
    experienceCtx.knowledgeBlock,
    `\nCommunication style: ${experienceCtx.styleNote}`,
    `\nAvailable tools: ${experienceCtx.tools.join(", ")}`,
    "\n# CONTEXT",
    `Screen: ${screenContext || "general"}`,
    academicContext ? `\n## Academic Data\n${academicContext}` : "",
    contextBlock ? `\n## Known Preferences\n${contextBlock}` : "",
    historyBlock ? `\n## Conversation History\n${historyBlock}` : "",
    routing.isDestructive ? "\n⚠️ SAFETY: This request may involve a destructive action. If confirmation is needed, ask the user before proceeding. Never execute destructive actions without explicit confirmation." : "",
    "\n# STUDENT MESSAGE",
    message,
    fileUrls.length > 0 ? `\n(Attached files: ${fileUrls.join(", ")})` : "",
    "\nRespond as Bud. Be warm, concise, and helpful. Never mention the specialists, routing, or internal processes.",
  ].filter(Boolean).join("\n");

  // 7. Call the LLM
  let responseText;
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      file_urls: fileUrls.length > 0 ? fileUrls : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          memory_candidate: {
            type: "object",
            properties: {
              key: { type: "string" },
              value: { type: "string" },
              category: { type: "string" },
              reason: { type: "string" },
            },
          },
        },
        required: ["response"],
      },
    });
    responseText = result.response || "I'm here — what can I help you with?";

    // 8. Store memory if the LLM identified something worth remembering
    if (result.memory_candidate?.key && result.memory_candidate?.value) {
      storeMemory({
        key: result.memory_candidate.key,
        value: result.memory_candidate.value,
        category: result.memory_candidate.category || "conversation",
        source_type: "inferred",
        reason: result.memory_candidate.reason || "Extracted from conversation",
        confidence: 0.75,
      }).catch(() => {});
    }
  } catch {
    responseText = "I'm having trouble connecting right now. Let's try again in a moment!";
  }

  // 9. Store interaction in shared memory (always)
  storeMemory({
    key: `conversation_${Date.now()}`,
    value: `User: ${message.slice(0, 200)}`,
    category: "conversation",
    source_type: "conversation",
    reason: "Conversation history for context continuity",
    confidence: 0.5,
  }).catch(() => {});

  return {
    text: responseText,
    specialists: routing.specialists,
    statusMessage,
    isDestructive: routing.isDestructive,
    confidence: routing.confidence,
    memoryUsed: memories.length,
  };
}

/**
 * Get specialist info for UI display.
 */
export function getSpecialistInfo(specialistId) {
  return SPECIALISTS[specialistId] || null;
}