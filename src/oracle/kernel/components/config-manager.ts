import type { IConfigManager } from '../types/index';

export class ConfigManager implements IConfigManager {
  private store: Map<string, unknown> = new Map();

  get<T>(key: string, defaultValue?: T): T {
    if (this.store.has(key)) {
      return this.store.get(key) as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Configuration key not found: ${key}`);
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.store);
  }

  load(config: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(config)) {
      this.store.set(key, value);
    }
  }
}
