import type { Spark } from "../../spark";
import type { BudSparkPort } from "./sparkPort";

/**
 * Wraps a concrete Spark instance so Bud's orchestrator only ever sees
 * the narrow BudSparkPort surface. Swapping this file for a test double
 * (e.g. an in-memory fake) is the only thing needed to unit-test Bud
 * without a real Spark instance.
 */
export function createLiveSparkAdapter(spark: Spark): BudSparkPort {
  return {
    identity: {
      createContext: (input) => spark.identity.createContext(input),
      getContext: (sessionId) => spark.identity.getContext(sessionId),
    },
    memory: {
      remember: (input) => spark.memory.remember(input),
      recall: (query) => spark.memory.recall(query),
    },
    search: {
      search: (query, limit) => spark.search.search(query, limit),
    },
    reasoning: {
      analyze: (input) => spark.reasoning.analyze(input),
    },
    planning: {
      createPlan: (goal, taskTitles) => spark.planning.createPlan(goal, taskTitles),
    },
    writing: {
      draft: (input) => spark.writing.draft(input),
    },
  };
}
