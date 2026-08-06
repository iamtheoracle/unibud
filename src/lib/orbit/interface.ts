/**
 * Orbit Service — Interface
 *
 * Orbit owns: continuous monitoring of campus updates, education, technology,
 * scholarships, competitions, research, AI, global news, and trending topics.
 *
 * Orbit NEVER communicates directly with students.
 * Orbit returns live intelligence to Spark and Square only.
 *
 * See src/lib/intelligence/registry.ts for the full Orbit definition.
 */

export type OrbitCategory =
  | "campus"
  | "education"
  | "technology"
  | "scholarships"
  | "competitions"
  | "research"
  | "ai"
  | "global_news"
  | "trending";

export const ORBIT_CATEGORIES: OrbitCategory[] = [
  "campus",
  "education",
  "technology",
  "scholarships",
  "competitions",
  "research",
  "ai",
  "global_news",
  "trending",
];

export interface OrbitItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  category: OrbitCategory;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  /** True when served from cache past its freshness TTL */
  stale?: boolean;
}

export interface OrbitTrendItem {
  topic: string;
  category: OrbitCategory;
  score: number;
  relatedItems: string[];
}

export interface OrbitAlert {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  category: OrbitCategory;
  publishedAt: string;
  expiresAt?: string;
}

export type OrbitPulseCallback = (items: OrbitItem[]) => void;

/**
 * OrbitService — the contract every Orbit implementation must satisfy.
 */
export interface OrbitService {
  /**
   * Returns the latest intelligence items for the given categories.
   * Called by Spark and Square.
   */
  getLatest(categories: OrbitCategory[], limit?: number): Promise<OrbitItem[]>;

  /**
   * Returns currently trending topics, optionally filtered by category.
   */
  getTrending(category?: OrbitCategory): Promise<OrbitTrendItem[]>;

  /**
   * Subscribe to live Orbit updates for the given categories.
   * The callback is invoked whenever new items arrive.
   * Returns an unsubscribe function.
   */
  subscribe(categories: OrbitCategory[], callback: OrbitPulseCallback): () => void;

  /**
   * Returns any active time-sensitive alerts.
   */
  getAlerts(): Promise<OrbitAlert[]>;
}
