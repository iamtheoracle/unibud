/**
 * Orbit Service — Public SDK
 *
 * Orbit continuously monitors campus updates, education, technology,
 * scholarships, competitions, research, AI, global news, and trending topics,
 * returning live intelligence to Spark and Square.
 *
 * Consumers (Spark, Square) should import from here:
 *   import { createOrbit } from "@/lib/orbit";
 *
 * The bus integration wires Orbit to the Intelligence Event Bus so:
 *   - Spark/Square can send `orbit:subscribe` events
 *   - Orbit publishes `orbit:pulse` and `orbit:alert` events automatically
 */

export type {
  OrbitService,
  OrbitCategory,
  OrbitItem,
  OrbitTrendItem,
  OrbitAlert,
  OrbitPulseCallback,
} from "./interface";

export { ORBIT_CATEGORIES } from "./interface";

import type { OrbitService, OrbitCategory, OrbitPulseCallback } from "./interface";
import { LocalOrbitService } from "./local";
import { intelligenceBus } from "@/lib/intelligence/bus";
import type { OrbitSubscribePayload } from "@/lib/intelligence/bus";

export interface OrbitConfig {
  provider?: OrbitService;
  /** Wire Orbit to the Intelligence Bus. Defaults to true. */
  useBus?: boolean;
}

export interface Orbit extends OrbitService {
  dispose(): void;
}

export function createOrbit(config: OrbitConfig = {}): Orbit {
  const service: OrbitService = config.provider ?? new LocalOrbitService();
  const unsubs: Array<() => void> = [];

  if (config.useBus !== false) {
    // Listen for category subscription requests from Spark or Square
    unsubs.push(
      intelligenceBus.subscribe(
        "orbit:subscribe",
        (payload: OrbitSubscribePayload) => {
          const categories = payload.categories as OrbitCategory[];
          const unsubFeed = service.subscribe(categories, (items) => {
            intelligenceBus.publish("orbit:pulse", {
              items,
              batchId: `${payload.subscriberId}-${Date.now()}`,
              timestamp: new Date().toISOString(),
            });
          });
          // Store so it can be cleaned up on dispose
          unsubs.push(unsubFeed);
        }
      )
    );
  }

  return {
    getLatest: (cats, limit) => service.getLatest(cats, limit),
    getTrending: (cat) => service.getTrending(cat),
    subscribe: (cats: OrbitCategory[], cb: OrbitPulseCallback) =>
      service.subscribe(cats, cb),
    getAlerts: () => service.getAlerts(),
    dispose() {
      for (const unsub of unsubs) unsub();
      unsubs.length = 0;
    },
  };
}
