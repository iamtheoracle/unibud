export interface Recommendation {
  itemId: string;
  reason: string;
  score: number;
}

export interface RecommendationsService {
  recommend(input: {
    userId?: string;
    sessionId?: string;
    candidateItems: Array<{ id: string; tags?: string[] }>;
    basedOnTags?: string[];
    limit?: number;
  }): Recommendation[];
}
