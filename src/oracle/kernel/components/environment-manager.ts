import type { IEnvironmentManager } from '../types/index';

export class EnvironmentManager implements IEnvironmentManager {
  private env: Record<string, string | undefined>;

  constructor(env?: Record<string, string | undefined>) {
    this.env = env ?? (typeof process !== 'undefined' ? { ...process.env } : {});
  }

  get(key: string, defaultValue?: string): string | undefined {
    const value = this.env[key];
    return value !== undefined ? value : defaultValue;
  }

  getRequired(key: string): string {
    const value = this.env[key];
    if (value === undefined || value === '') {
      throw new Error(`Required environment variable not set: ${key}`);
    }
    return value;
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.env[key];
    if (value === undefined) {
      return defaultValue ?? false;
    }
    return value.toLowerCase() === 'true' || value === '1';
  }

  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} is not a valid number: ${value}`);
    }
    return parsed;
  }

  has(key: string): boolean {
    const val = this.env[key];
    return val !== undefined && val !== '';
  }

  getAll(): Record<string, string | undefined> {
    return { ...this.env };
  }
}
