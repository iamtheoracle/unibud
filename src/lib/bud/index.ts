/**
 * Public Bud SDK.
 *
 * Consumers should only ever import from here:
 *
 *   import { createBud } from "@/lib/bud";
 *
 * Never import from bud/orchestrator, bud/actions/*, bud/adapters/*,
 * etc. directly — those are internal implementation detail.
 */
import { createSpark, type Spark } from "../spark";
import { createLiveSparkAdapter } from "./adapters/liveSparkAdapter";
import type { BudSparkPort } from "./adapters/sparkPort";
import { createPersonality, type BudPersonality } from "./personality";
import { resolveLimits, type BudLimits } from "./config";
import { orchestrateRespond } from "./orchestrator";
import { getTranscript } from "./conversation";
import type { BudResponse, BudSession, ConversationTurn } from "./types";

export interface BudConfig {
  /** Provide an existing Spark instance to share it across products; otherwise Bud creates its own. */
  spark?: Spark;
  personality?: Partial<BudPersonality>;
  limits?: Partial<BudLimits>;
}

export interface Bud {
  respond(message: string, session: BudSession): Promise<BudResponse>;
  transcript(sessionId: string, limit?: number): ConversationTurn[];
  readonly personality: BudPersonality;
}

export function createBud(config: BudConfig = {}): Bud {
  const spark = config.spark ?? createSpark();
  const sparkPort: BudSparkPort = createLiveSparkAdapter(spark);
  const personality = createPersonality(config.personality);
  const limits = resolveLimits(config.limits);
  return {
    personality,
    async respond(message: string, session: BudSession): Promise<BudResponse> {
      return orchestrateRespond(sparkPort, personality, limits, message, session);
    },
    transcript(sessionId: string, limit?: number): ConversationTurn[] {
      return getTranscript(sparkPort, sessionId, limit);
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
