import type { SummaryRequest, SummaryResult, SummariesService } from "./interface";

/**
 * Deterministic extractive summarizer (first-N-sentences heuristic).
 * No AI provider required. Can be upgraded to abstractive summarization
 * via a provider later without changing the interface.
 */
export class LocalSummariesService implements SummariesService {
  summarize(request: SummaryRequest): SummaryResult {
    const sentences = request.text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const maxSentences = request.maxSentences ?? 3;
    const summary = sentences.slice(0, maxSentences).join(" ");
    return {
      summary,
      originalLength: request.text.length,
      summaryLength: summary.length,
    };
  }
}
