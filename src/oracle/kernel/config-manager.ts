import { EnvironmentLoader } from './environment-loader.ts';
import type { ConfigManagerOptions, ConfigSchemaEntry } from './types.ts';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const nextTarget = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(nextTarget[key])) {
      nextTarget[key] = deepMerge(nextTarget[key] as Record<string, unknown>, value);
      continue;
    }

    nextTarget[key] = value;
  }

  return nextTarget;
}


function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (value instanceof Date) {
    return new Date(value);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
  }

  return value;
}

function getByPath(config: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (!isPlainObject(current) || !(segment in current)) {
      return undefined;
    }

    return current[segment];
  }, config);
}

function setByPath(config: Record<string, unknown>, key: string, value: unknown): void {
  const segments = key.split('.');
  let cursor: Record<string, unknown> = config;

  for (const segment of segments.slice(0, -1)) {
    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }

  cursor[segments.at(-1) as string] = value;
}

export class ConfigManager {
  environmentLoader: EnvironmentLoader;
  config: Record<string, unknown>;

  constructor(environmentLoader = new EnvironmentLoader()) {
    this.environmentLoader = environmentLoader;
    this.config = {};
  }

  initialize(options: ConfigManagerOptions = {}): Record<string, unknown> {
    const envConfig = this.environmentLoader.load(options);
    this.config = deepMerge({}, envConfig as Record<string, unknown>);

    if (options.fileConfig) {
      this.config = deepMerge(this.config, options.fileConfig);
    }

    if (options.overrides) {
      this.config = deepMerge(this.config, options.overrides);
    }

    this.validate(options.schema ?? {});
    return this.snapshot();
  }

  validate(schema: Record<string, ConfigSchemaEntry>): void {
    for (const [key, schemaEntry] of Object.entries(schema)) {
      const value = this.get(key);
      if (schemaEntry.required && value === undefined) {
        throw new Error(`Missing required configuration value: ${key}`);
      }

      if (value !== undefined && schemaEntry.validate && !schemaEntry.validate(value)) {
        throw new Error(`Configuration validation failed for ${key}`);
      }
    }
  }

  get(key: string, fallback?: unknown): unknown {
    const value = getByPath(this.config, key);
    return value === undefined ? fallback : value;
  }

  set(key: string, value: unknown): void {
    setByPath(this.config, key, value);
  }

  merge(values: Record<string, unknown>): void {
    this.config = deepMerge(this.config, values);
  }

  snapshot(): Record<string, unknown> {
    return cloneValue(this.config) as Record<string, unknown>;
  }
}
