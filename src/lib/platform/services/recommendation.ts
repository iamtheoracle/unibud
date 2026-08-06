/**
 * Platform Services — Recommendation Service Interface
 *
 * The Recommendation Service ranks content, people, and actions for each
 * student based on their Digital Twin, context, and activity.
 *
 * Promoted from Spark's internal recommendations service to a top-level
 * platform service so all experiences (Square, Quad, Marketplace, etc.)
 * can consume it directly.
 *
 * Underlying implementation: src/lib/spark/intelligence/recommendations/
 */

export interface RecommendationCandidate {
  id: string;
  type: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface Recommendation {
  itemId: string;
  type: string;
  reason: string;
  score: number;
}

export interface RecommendationRequest {
  userId?: string;
  sessionId?: string;
  candidateItems: RecommendationCandidate[];
  basedOnTags?: string[];
  context?: string;
  limit?: number;
}

export interface RecommendationService {
  recommend(request: RecommendationRequest): Recommendation[];
}
