/**
 * Lens Service — Public SDK
 *
 * Lens is the universal search intelligence of UNIBUD.
 * It searches the platform, communities, courses, library, files, notes,
 * media, people, campus, knowledge, and the web (via Oracle).
 *
 * Consumers (Spark) should import from here:
 *   import { createLens } from "@/lib/lens";
 *
 * The bus integration wires Lens to the Intelligence Event Bus so Spark
 * can dispatch `lens:search` events and receive `lens:results` responses.
 */

export type {
  LensService,
  LensSearchRequest,
  LensSearchResult,
  LensResult,
  LensResultType,
  LensScope,
  LensFilters,
} from "./interface";

import type { LensService } from "./interface";
import { LocalLensService } from "./local";
import { intelligenceBus } from "@/lib/intelligence/bus";
import type { LensSearchPayload } from "@/lib/intelligence/bus";

export interface LensConfig {
  provider?: LensService;
  /** Wire Lens to the Intelligence Bus. Defaults to true. */
  useBus?: boolean;
}

export interface Lens extends LensService {
  dispose(): void;
}

export function createLens(config: LensConfig = {}): Lens {
  const service: LensService = config.provider ?? new LocalLensService();
  const unsubs: Array<() => void> = [];

  if (config.useBus !== false) {
    unsubs.push(
      intelligenceBus.subscribe(
        "lens:search",
        async (payload: LensSearchPayload) => {
          const result = await service.search({
            query: payload.query,
            scope: payload.scope,
            filters: payload.filters,
            limit: payload.limit,
            userId: payload.userId,
          });
          intelligenceBus.publish("lens:results", {
            requestId: payload.requestId,
            query: result.query,
            results: result.results,
            totalCount: result.totalCount,
            interpretedAs: result.interpretedAs,
            durationMs: result.durationMs,
          });
        }
      )
    );
  }

  return {
    search: (req) => service.search(req),
    suggest: (prefix) => service.suggest(prefix),
    dispose() {
      for (const unsub of unsubs) unsub();
      unsubs.length = 0;
    },
  };
}
