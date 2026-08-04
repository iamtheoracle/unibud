/**
 * Lens Service — Interface
 *
 * Lens owns: universal search across all platform surfaces and the web.
 *
 * Lens NEVER communicates directly with students.
 * Lens returns ranked, structured search results to Spark only.
 * Web search is always delegated to Oracle.
 *
 * See src/lib/intelligence/registry.ts for the full Lens definition.
 */

export type LensScope =
  | "all"
  | "platform"
  | "web"
  | "communities"
  | "courses"
  | "library"
  | "people"
  | "media"
  | "campus"
  | "knowledge";

export type LensResultType =
  | "community"
  | "course"
  | "library_item"
  | "note"
  | "person"
  | "media"
  | "campus_item"
  | "knowledge_article"
  | "web_result";

export interface LensFilters {
  type?: LensResultType;
  dateRange?: { from?: string; to?: string };
  campus?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface LensResult {
  id: string;
  type: LensResultType;
  title: string;
  snippet: string;
  imageUrl?: string;
  deepLink: string;
  /** Relevance score 0–1 */
  score: number;
  source: "platform" | "web";
}

export interface LensSearchRequest {
  query: string;
  scope?: LensScope;
  filters?: LensFilters;
  limit?: number;
  /** Student userId for personalised ranking */
  userId?: string;
}

export interface LensSearchResult {
  query: string;
  results: LensResult[];
  totalCount: number;
  /** Natural-language interpretation of the query, if different from raw input */
  interpretedAs?: string;
  durationMs: number;
}

/**
 * LensService — the contract every Lens implementation must satisfy.
 */
export interface LensService {
  /**
   * Universal search. Returns ranked results across the requested scope.
   * Called by Spark only.
   */
  search(request: LensSearchRequest): Promise<LensSearchResult>;

  /**
   * Returns autocomplete suggestions for the given prefix.
   * May be called directly by UI components.
   */
  suggest(prefix: string): Promise<string[]>;
}
