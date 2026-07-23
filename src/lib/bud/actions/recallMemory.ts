import type { BudSparkPort } from "../adapters/sparkPort";
import type { MemoryRecord } from "../../spark/memory/interface";

/**
 * Thin wrapper around Spark's memory recall. Bud does not implement
 * any memory logic itself — it only asks Spark for what it remembers.
 */
export function recallMemory(
  spark: BudSparkPort,
  sessionId: string,
  limit: number
): MemoryRecord[] {
  return spark.memory.recall({ sessionId, limit });
}
