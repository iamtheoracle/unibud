import type { BudSparkPort } from "../adapters/sparkPort";
import type { ReasoningResult } from "../../spark/core/reasoning/interface";
import type { MemoryRecord } from "../../spark/memory/interface";
import type { SearchResult } from "../../spark/intelligence/search/interface";

/**
 * Assembles the facts Spark's reasoning service should consider — from
 * recalled memory and search results — and delegates the actual
 * analysis to Spark. Bud does not reason on its own.
 */
export async function reason(
  spark: BudSparkPort,
  message: string,
  memoryRecords: MemoryRecord[],
  knowledgeResults: SearchResult[]
): Promise<ReasoningResult> {
  const facts = [
    ...memoryRecords.map((m) => m.content),
    ...knowledgeResults.map((k) => `${k.title}: ${k.snippet}`),
  ];
  return spark.reasoning.analyze({ question: message, facts });
}
