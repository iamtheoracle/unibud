/**
 * Public Bud SDK — Consolidated through Oracle
 *
 * Bud is now ONLY the conversational interface. All requests route through
 * Oracle, making it the single execution path:
 *
 *   User → Bud → Oracle → Guardian → Nexus → Platform Core → Spark → LLM
 *
 * Bud no longer creates its own Spark instance or runs a parallel
 * orchestration pipeline. Personality is passed as context so Spark
 * can use Bud's voice guidelines in its prompt.
 *
 * Consumers should only ever import from here:
 *   import { createBud } from "@/lib/bud";
 */

import { oracle } from "@/lib/runtime/kernel";
import { buildSystemPrompt } from "./prompts/systemPrompt";
import { createPersonality, type BudPersonality } from "./personality";
import { resolveLimits, type BudLimits } from "./config";
import type { BudResponse, BudSession, ConversationTurn } from "./types";

export interface BudConfig {
  personality?: Partial<BudPersonality>;
  limits?: Partial<BudLimits>;
}

export interface Bud {
  respond(message: string, session: BudSession): Promise<BudResponse>;
  transcript(sessionId: string, limit?: number): ConversationTurn[];
  readonly personality: BudPersonality;
}

/**
 * Create a Bud instance that routes all requests through Oracle.
 * Bud applies its personality (voice, tone) to the system prompt;
 * Oracle handles identity, policy, memory, knowledge, and LLM invocation.
 */
export function createBud(config: BudConfig = {}): Bud {
  const personality = createPersonality(config.personality);
  resolveLimits(config.limits); // resolved for API compat; Oracle manages limits internally

  // Local transcript cache — populated as conversations happen.
  // Oracle/Nexus stores interactions via memoryService; this cache
  // provides sync access for the transcript() interface.
  const transcriptCache = new Map<string, ConversationTurn[]>();

  return {
    personality,

    async respond(message: string, session: BudSession): Promise<BudResponse> {
      // Guard: if Oracle isn't ready (boot not complete), return gracefully
      if (!oracle.ready) {
        return {
          message: "I'm still waking up — give me just a moment!",
          sessionId: session.sessionId,
          trace: {
            memoryHits: 0,
            knowledgeHits: 0,
            reasoningConfidence: 0,
            plannedTaskCount: 0,
            provider: "none",
          },
        };
      }

      // Build personality system prompt — Bud owns the voice, Oracle owns the pipeline
      const systemPrompt = buildSystemPrompt(personality);

      // Route through Oracle — the single execution path
      const result = await oracle.process({
        message,
        userId: session.userId,
        context: {
          systemPrompt,
          sessionId: session.sessionId,
          product: session.product,
          locale: session.locale,
          timezone: session.timezone,
          personality: personality.name,
          tone: personality.tone,
        },
      });

      // Cache the conversation turn for sync transcript access
      const now = new Date().toISOString();
      const turns = transcriptCache.get(session.sessionId) || [];
      turns.push({
        user: { role: "user", content: message, timestamp: now },
        bud: { role: "bud", content: result.text, timestamp: now },
      });
      transcriptCache.set(session.sessionId, turns);

      return {
        message: result.text,
        sessionId: session.sessionId,
        trace: {
          memoryHits: 0,
          knowledgeHits: 0,
          reasoningConfidence: 0,
          plannedTaskCount: 0,
          provider: result.agentsUsed?.join(",") || result.capabilitiesUsed?.join(",") || "oracle",
        },
      };
    },

    transcript(sessionId: string, limit = 50): ConversationTurn[] {
      const turns = transcriptCache.get(sessionId) || [];
      return turns.slice(-limit);
    },
  };
}

export type {
  BudSession,
  BudResponse,
  BudMessage,
  ConversationTurn,
} from "./types";
export type { BudPersonality } from "./personality";
export type { BudLimits } from "./config";