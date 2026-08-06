/**
 * Oracle Service — Interface
 *
 * Oracle owns: research, knowledge discovery, verification, academic sources,
 * web knowledge, and fact validation.
 *
 * Oracle NEVER communicates directly with students.
 * Oracle returns structured research to Spark only.
 *
 * See src/lib/intelligence/registry.ts for the full Oracle definition.
 */

export type OracleSourceType = "academic" | "web" | "campus";

export interface OracleSource {
  title: string;
  url?: string;
  author?: string;
  date?: string;
  type: OracleSourceType;
}

export interface OracleResearchRequest {
  topic: string;
  depth?: "shallow" | "deep";
  /** Preferred source types in priority order */
  preferredSources?: OracleSourceType[];
  /** Additional context that helps focus the research */
  context?: string;
}

export interface OracleResearchResult {
  topic: string;
  findings: string[];
  sources: OracleSource[];
  /** 0–1 confidence score. Low values mean the findings may be incomplete. */
  confidence: number;
  timestamp: string;
  /** True when result is served from cache, not a fresh fetch */
  stale?: boolean;
}

export interface OracleFactCheckRequest {
  claim: string;
  /** Additional context helps Oracle find relevant evidence */
  context?: string;
}

export interface OracleFactCheckResult {
  claim: string;
  verdict: "verified" | "refuted" | "uncertain";
  evidence: string[];
  /** 0–1 confidence score */
  confidence: number;
}

/**
 * OracleService — the contract every Oracle implementation must satisfy.
 *
 * Implementations:
 *   - LocalOracleService  (no external calls, for dev/test)
 *   - LiveOracleService   (calls real search and academic APIs)
 */
export interface OracleService {
  /**
   * Research a topic. Returns structured findings with source citations.
   * Called by Spark only.
   */
  research(request: OracleResearchRequest): Promise<OracleResearchResult>;

  /**
   * Verify a factual claim. Returns a verdict with supporting evidence.
   * Called by Spark only.
   */
  factCheck(request: OracleFactCheckRequest): Promise<OracleFactCheckResult>;
}
