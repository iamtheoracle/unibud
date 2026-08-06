import type { BudSparkPort } from "./adapters/sparkPort";
import type { BudPersonality } from "./personality";
import type { BudLimits } from "./config";
import type { BudResponse, BudSession } from "./types";
import { buildContext } from "./context/buildContext";
import { recallMemory } from "./actions/recallMemory";
import { searchKnowledge } from "./actions/searchKnowledge";
import { reason } from "./actions/reason";
import { planIfNeeded } from "./actions/planIfNeeded";
import { generateResponse } from "./actions/generateResponse";
import { storeInteraction } from "./actions/storeInteraction";

/**
 * The entire orchestration Bud performs, in order:
 *
 *   1. Build conversation context (ensure Spark identity exists)
 *   2. Recall memory from Spark
 *   3. Search Spark's knowledge
 *   4. Ask Spark to reason over message + recalled facts
 *   5. Mechanically detect multi-step requests and hand planning to Spark
 *   6. Ask Spark to draft the final response text
 *   7. Store the turn back through Spark memory
 *
 * Every step above calls into `spark` (a BudSparkPort) and nothing else.
 * There is no branch here that reasons about content, generates text
 * itself, or calls a provider — that's the point.
 */
export async function orchestrateRespond(
  spark: BudSparkPort,
  personality: BudPersonality,
  limits: BudLimits,
  message: string,
  session: BudSession
): Promise<BudResponse> {
  const context = buildContext(spark, session);
  const memoryRecords = recallMemory(
    spark,
    context.sessionId,
    limits.memoryRecallLimit
  );
  const knowledgeResults = await searchKnowledge(
    spark,
    message,
    limits.knowledgeSearchLimit
  );
  const reasoning = await reason(spark, message, memoryRecords, knowledgeResults);
  const plan = planIfNeeded(spark, message);
  const writing = await generateResponse(spark, personality, {
    message,
    memoryRecords,
    knowledgeResults,
    reasoning,
  });
  storeInteraction(spark, {
    sessionId: context.sessionId,
    userId: context.userId,
    userMessage: message,
    budMessage: writing.text,
  });
  return {
    message: writing.text,
    sessionId: context.sessionId,
    trace: {
      memoryHits: memoryRecords.length,
      knowledgeHits: knowledgeResults.length,
      reasoningConfidence: reasoning.confidence,
      plannedTaskCount: plan?.tasks.length ?? 0,
      provider: writing.provider,
    },
  };
}
