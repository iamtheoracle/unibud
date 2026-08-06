/**
 * Oracle Service — Local Implementation
 *
 * Used in development and test environments. Makes no external network calls.
 * Returns plausible stub responses so the rest of the system can be developed
 * and tested without live search APIs.
 *
 * Replace with LiveOracleService in production.
 */

import type {
  OracleService,
  OracleResearchRequest,
  OracleResearchResult,
  OracleFactCheckRequest,
  OracleFactCheckResult,
} from "./interface";

export class LocalOracleService implements OracleService {
  async research(request: OracleResearchRequest): Promise<OracleResearchResult> {
    // Stub: return a minimal result so callers can operate.
    // In production this delegates to a real search + LLM pipeline.
    return {
      topic: request.topic,
      findings: [
        `[Oracle stub] Research on "${request.topic}" is not yet available in local mode.`,
        "Connect a live Oracle provider for real research results.",
      ],
      sources: [],
      confidence: 0,
      timestamp: new Date().toISOString(),
      stale: false,
    };
  }

  async factCheck(request: OracleFactCheckRequest): Promise<OracleFactCheckResult> {
    return {
      claim: request.claim,
      verdict: "uncertain",
      evidence: [
        "[Oracle stub] Fact-checking is not available in local mode.",
        "Connect a live Oracle provider for real fact-check results.",
      ],
      confidence: 0,
    };
  }
}
