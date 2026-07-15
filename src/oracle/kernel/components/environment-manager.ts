import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IEnvironmentManager } from '../types/index.ts';

function parseDotEnv(content: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/gu, '');
    parsed[key] = value;
  }

  return parsed;
}

function getBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (['true', '1', 'yes', 'on'].includes(value.toLowerCase())) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(value.toLowerCase())) {
    return false;
  }

  return undefined;
}

interface EnvironmentOptions {
  env?: Record<string, string | undefined>;
  dotenvPath?: string;
}

export function createEnvironmentManager(options: EnvironmentOptions = {}): IEnvironmentManager {
  const inheritedEnv = options.env ?? (typeof process !== 'undefined' ? process.env : {});
  const env: Record<string, string | undefined> = { ...inheritedEnv };

  const dotenvPath = options.dotenvPath ? resolve(options.dotenvPath) : resolve(process.cwd(), '.env');
  if (existsSync(dotenvPath)) {
    const fromFile = parseDotEnv(readFileSync(dotenvPath, 'utf-8'));
    for (const [key, value] of Object.entries(fromFile)) {
      if (env[key] === undefined) {
        env[key] = value;
      }
    }
  }

  return {
    get(key: string, defaultValue?: string): string | undefined {
      return env[key] ?? defaultValue;
    },

    getAsNumber(key: string, defaultValue?: number): number | undefined {
      const value = env[key];
      if (value === undefined) {
        return defaultValue;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : defaultValue;
    },

    getAsBoolean(key: string, defaultValue?: boolean): boolean | undefined {
      const parsed = getBoolean(env[key]);
      return parsed ?? defaultValue;
    },

    require(key: string): string {
      const value = env[key];
      if (!value) {
        throw new Error(`Required environment variable missing: ${key}`);
      }
      return value;
    },

    getAll(): Record<string, string | undefined> {
      return { ...env };
    },
  };
}
