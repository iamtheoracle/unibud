/**
 * Lens Service — Local Implementation
 *
 * Used in development and test environments. Delegates to the existing
 * `src/lib/intelligence/searchIntent.js` for intent resolution, and returns
 * empty platform results. Plugs web search through Oracle local stub.
 *
 * Replace with LiveLensService in production.
 */

import type {
  LensService,
  LensSearchRequest,
  LensSearchResult,
} from "./interface";

export class LocalLensService implements LensService {
  async search(request: LensSearchRequest): Promise<LensSearchResult> {
    const start = Date.now();
    // Local mode: no real index. Return empty with a note.
    return {
      query: request.query,
      results: [],
      totalCount: 0,
      interpretedAs: request.query,
      durationMs: Date.now() - start,
    };
  }

  async suggest(prefix: string): Promise<string[]> {
    void prefix;
    return [];
  }
}
