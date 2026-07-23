import type { BudSparkPort } from "../adapters/sparkPort";
import type { SearchResult } from "../../spark/intelligence/search/interface";

/**
 * Thin wrapper around Spark's search service. Bud never implements its
 * own search or retrieval — it only asks Spark.
 */
export async function searchKnowledge(
  spark: BudSparkPort,
  query: string,
  limit: number
): Promise<SearchResult[]> {
  return spark.search.search(query, limit);
}
