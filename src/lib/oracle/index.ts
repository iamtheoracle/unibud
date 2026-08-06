/**
 * Oracle Service — Public SDK
 *
 * Oracle is the research and knowledge discovery intelligence of UNIBUD.
 *
 * Consumers (Spark only) should import from here:
 *   import { createOracle } from "@/lib/oracle";
 *
 * The bus integration wires Oracle to the Intelligence Event Bus so Spark
 * can dispatch `oracle:research` and `oracle:fact_check` events and receive
 * `oracle:result` and `oracle:fact_checked` responses.
 *
 * Direct function calls (via `createOracle`) are also fully supported for
 * backward compatibility and simple use cases.
 */

export type {
  OracleService,
  OracleResearchRequest,
  OracleResearchResult,
  OracleFactCheckRequest,
  OracleFactCheckResult,
  OracleSource,
  OracleSourceType,
} from "./interface";

import type { OracleService } from "./interface";
import { LocalOracleService } from "./local";
import { intelligenceBus } from "@/lib/intelligence/bus";
import type {
  OracleResearchPayload,
  OracleFactCheckPayload,
} from "@/lib/intelligence/bus";

export interface OracleConfig {
  /** Swap in a live implementation. Defaults to LocalOracleService. */
  provider?: OracleService;
  /**
   * When true, Oracle listens on the Intelligence Bus for `oracle:research`
   * and `oracle:fact_check` events and publishes results back.
   * Defaults to true.
   */
  useBus?: boolean;
}

export interface Oracle extends OracleService {
  /** Detach all bus listeners registered by this Oracle instance. */
  dispose(): void;
}

/**
 * Create an Oracle instance.
 *
 * @example
 * const oracle = createOracle();
 * const result = await oracle.research({ topic: "photosynthesis" });
 */
export function createOracle(config: OracleConfig = {}): Oracle {
  const service: OracleService = config.provider ?? new LocalOracleService();
  const unsubs: Array<() => void> = [];

  if (config.useBus !== false) {
    // Listen for research requests from Spark
    unsubs.push(
      intelligenceBus.subscribe(
        "oracle:research",
        async (payload: OracleResearchPayload) => {
          const result = await service.research({
            topic: payload.topic,
            depth: payload.depth,
            preferredSources: payload.preferredSources,
            context: payload.context,
          });
          intelligenceBus.publish("oracle:result", {
            requestId: payload.requestId,
            topic: result.topic,
            findings: result.findings,
            sources: result.sources,
            confidence: result.confidence,
            timestamp: result.timestamp,
          });
        }
      )
    );

    // Listen for fact-check requests from Spark
    unsubs.push(
      intelligenceBus.subscribe(
        "oracle:fact_check",
        async (payload: OracleFactCheckPayload) => {
          const result = await service.factCheck({
            claim: payload.claim,
            context: payload.context,
          });
          intelligenceBus.publish("oracle:fact_checked", {
            requestId: payload.requestId,
            claim: result.claim,
            verdict: result.verdict,
            evidence: result.evidence,
            confidence: result.confidence,
          });
        }
      )
    );
  }

  return {
    research: (req) => service.research(req),
    factCheck: (req) => service.factCheck(req),
    dispose() {
      for (const unsub of unsubs) unsub();
      unsubs.length = 0;
    },
  };
}
