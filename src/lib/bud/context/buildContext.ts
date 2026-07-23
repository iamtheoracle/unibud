import type { BudSparkPort } from "../adapters/sparkPort";
import type { BudSession } from "../types";

export interface ConversationContext {
  sessionId: string;
  userId: string;
  product: string;
}

/**
 * Ensures Spark has an identity context for this session (creating one
 * on first contact) and returns the minimal context the rest of the
 * orchestration needs. Bud does not track identity itself — Spark owns
 * that state.
 */
export function buildContext(
  spark: BudSparkPort,
  session: BudSession
): ConversationContext {
  const existing = spark.identity.getContext(session.sessionId);
  if (!existing) {
    spark.identity.createContext({
      userId: session.userId,
      sessionId: session.sessionId,
      product: session.product,
      locale: session.locale,
      timezone: session.timezone,
    });
  }
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    product: session.product,
  };
}
