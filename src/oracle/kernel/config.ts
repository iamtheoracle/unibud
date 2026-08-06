/**
 * Oracle Kernel — Config Manager
 *
 * Simple key-value configuration store. Domain-agnostic.
 */

import type { IConfigManager } from './types.js';

export class OracleConfigManager implements IConfigManager {
  private readonly store: Map<string, unknown> = new Map();

  constructor(initial?: Record<string, unknown>) {
    if (initial) {
      for (const [key, value] of Object.entries(initial)) {
        this.store.set(key, value);
      }
    }
  }

  get<T = unknown>(key: string, defaultValue?: T): T {
    if (this.store.has(key)) {
      return this.store.get(key) as T;
    }
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Config key not found: "${key}"`);
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.store.entries());
  }
}
