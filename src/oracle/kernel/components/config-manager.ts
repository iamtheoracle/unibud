import type { IConfigManager } from "../types/index.js";

export class ConfigManager implements IConfigManager {
  private readonly values = new Map<string, unknown>();

  public load(values: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(values)) {
      this.values.set(key, value);
    }
  }

  public get<T = unknown>(key: string, fallback?: T): T | undefined {
    if (!this.values.has(key)) {
      return fallback;
    }
    return this.values.get(key) as T;
  }

  public set(key: string, value: unknown): void {
    this.values.set(key, value);
  }

  public has(key: string): boolean {
    return this.values.has(key);
  }
}
