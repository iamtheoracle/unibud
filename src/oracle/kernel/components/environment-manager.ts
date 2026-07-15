import type { IEnvironmentManager } from "../types/index.js";

export class EnvironmentManager implements IEnvironmentManager {
  public constructor(private readonly source: Record<string, string | undefined> = process.env) {}

  public get(key: string, fallback?: string): string | undefined {
    const value = this.source[key];
    return value === undefined || value === "" ? fallback : value;
  }

  public getRequired(key: string): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  public getNumber(key: string, fallback?: number): number | undefined {
    const value = this.get(key);
    if (value === undefined) {
      return fallback;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number environment variable: ${key}`);
    }
    return parsed;
  }

  public getBoolean(key: string, fallback?: boolean): boolean | undefined {
    const value = this.get(key);
    if (value === undefined) {
      return fallback;
    }
    if (value === "true" || value === "1") {
      return true;
    }
    if (value === "false" || value === "0") {
      return false;
    }
    throw new Error(`Invalid boolean environment variable: ${key}`);
  }
}
