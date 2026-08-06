/**
 * Orbit Service — Local Implementation
 *
 * Used in development and test environments. Makes no external network calls.
 * Returns empty or stub responses so the rest of the system operates correctly.
 *
 * Replace with LiveOrbitService in production.
 */

import type {
  OrbitService,
  OrbitCategory,
  OrbitItem,
  OrbitTrendItem,
  OrbitAlert,
  OrbitPulseCallback,
} from "./interface";

export class LocalOrbitService implements OrbitService {
  private readonly subscribers = new Map<string, Set<OrbitPulseCallback>>();

  async getLatest(categories: OrbitCategory[], limit = 20): Promise<OrbitItem[]> {
    // Stub: no live data in local mode
    void categories;
    void limit;
    return [];
  }

  async getTrending(category?: OrbitCategory): Promise<OrbitTrendItem[]> {
    void category;
    return [];
  }

  subscribe(categories: OrbitCategory[], callback: OrbitPulseCallback): () => void {
    const key = categories.sort().join(",");
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  async getAlerts(): Promise<OrbitAlert[]> {
    return [];
  }

  /**
   * Test helper — push mock items to all subscribers for a given category set.
   * Not part of the OrbitService interface; only used in tests.
   */
  _simulatePulse(categories: OrbitCategory[], items: OrbitItem[]): void {
    const key = categories.sort().join(",");
    this.subscribers.get(key)?.forEach((cb) => cb(items));
  }
}
