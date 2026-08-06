/**
 * Bud never defines its own memory, reasoning, or knowledge types —
 * those belong to Spark. This file only defines the shapes Bud needs
 * for orchestration: sessions, messages, and the final response.
 */
export interface BudSession {
  sessionId: string;
  userId: string;
  /** The product Bud is embedded in (e.g. "unibud", "campus"). Passed through to Spark's Identity/Context services untouched. */
  product: string;
  locale?: string;
  timezone?: string;
}

export interface BudMessage {
  role: "user" | "bud";
  content: string;
  timestamp: string;
}

export interface BudResponse {
  message: string;
  sessionId: string;
  /** Surfaced for debugging/observability — never re-derived by Bud itself. */
  trace: {
    memoryHits: number;
    knowledgeHits: number;
    reasoningConfidence: number;
    plannedTaskCount: number;
    provider: string;
  };
}

export interface ConversationTurn {
  user: BudMessage;
  bud: BudMessage;
}
