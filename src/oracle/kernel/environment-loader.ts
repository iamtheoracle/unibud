import type { ConfigSchemaEntry, ConfigValue, EnvironmentLoadOptions } from './types.ts';

function parseBoolean(value: string): boolean {
  if (/^(true|1|yes|on)$/i.test(value)) {
    return true;
  }

  if (/^(false|0|no|off)$/i.test(value)) {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

function getRuntimeEnvironment(): Record<string, string | undefined> {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env ?? {};
}

function coerceValue(rawValue: string, schemaEntry?: ConfigSchemaEntry): ConfigValue {
  switch (schemaEntry?.type) {
    case 'number': {
      const parsed = Number(rawValue);
      if (Number.isNaN(parsed)) {
        throw new Error(`Invalid numeric value: ${rawValue}`);
      }
      return parsed;
    }
    case 'boolean':
      return parseBoolean(rawValue);
    case 'json':
      return JSON.parse(rawValue) as ConfigValue;
    default:
      return rawValue;
  }
}

export class EnvironmentLoader {
  parseEnvFile(contents = ''): Record<string, string> {
    return contents.split(/\r?\n/).reduce<Record<string, string>>((accumulator, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return accumulator;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      accumulator[key] = value;
      return accumulator;
    }, {});
  }

  load(options: EnvironmentLoadOptions = {}): Record<string, ConfigValue> {
    const fileValues = this.parseEnvFile(options.envFileContents);
    const runtimeEnv = options.env ?? getRuntimeEnvironment();
    const schema = options.schema ?? {};
    const merged = {
      ...(options.defaults ?? {}),
      ...fileValues,
      ...runtimeEnv,
    } as Record<string, ConfigValue>;

    for (const [key, schemaEntry] of Object.entries(schema)) {
      if (merged[key] === undefined && schemaEntry.defaultValue !== undefined) {
        merged[key] = schemaEntry.defaultValue;
      }
    }

    for (const [key, value] of Object.entries(merged)) {
      const schemaEntry = schema[key];
      if (typeof value === 'string') {
        merged[key] = coerceValue(value, schemaEntry);
      }

      if (schemaEntry?.validate && !schemaEntry.validate(merged[key])) {
        throw new Error(`Environment validation failed for ${key}`);
      }
    }

    const requiredKeys = new Set(options.required ?? []);
    for (const [key, schemaEntry] of Object.entries(schema)) {
      if (schemaEntry.required) {
        requiredKeys.add(key);
      }
    }

    for (const key of requiredKeys) {
      if (merged[key] === undefined || merged[key] === null || merged[key] === '') {
        throw new Error(`Missing required configuration: ${key}`);
      }
    }

    return merged;
  }
}
