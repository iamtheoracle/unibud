import type { Recommendation, RecommendationsService } from "./interface";

/**
 * Deterministic tag-overlap recommender. No model call required; this
 * can be replaced with a learned ranker later behind the same interface.
 */
export class LocalRecommendationsService implements RecommendationsService {
  recommend(input: {
    userId?: string;
    sessionId?: string;
    candidateItems: Array<{ id: string; tags?: string[] }>;
    basedOnTags?: string[];
    limit?: number;
  }): Recommendation[] {
    const wanted = new Set(input.basedOnTags ?? []);
    const scored: Recommendation[] = input.candidateItems.map((item) => {
      const tags = item.tags ?? [];
      const overlap = tags.filter((t) => wanted.has(t)).length;
      const score = wanted.size ? overlap / wanted.size : 0;
      return {
        itemId: item.id,
        reason: overlap
          ? `Matches ${overlap} of ${wanted.size} preferred tag(s).`
          : "No tag overlap; ranked by default order.",
        score,
      };
    });
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit ?? 10);
  }
}
