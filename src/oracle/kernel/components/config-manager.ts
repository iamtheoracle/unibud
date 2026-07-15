import type { IConfigManager } from '../types/index.ts';

function getByPath(source: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, source);
}

function setByPath(source: Record<string, unknown>, key: string, value: unknown): void {
  const parts = key.split('.');
  const last = parts.pop();

  if (!last) {
    return;
  }

  let target = source;
  for (const part of parts) {
    const current = target[part];
    if (!current || typeof current !== 'object') {
      target[part] = {};
    }
    target = target[part] as Record<string, unknown>;
  }

  target[last] = value;
}

export function createConfigManager(initialConfig: Record<string, unknown> = {}): IConfigManager {
  const config: Record<string, unknown> = { ...initialConfig };

  return {
    get<T>(key: string, defaultValue?: T): T {
      const value = getByPath(config, key);
      return (value === undefined ? defaultValue : value) as T;
    },

    set(key: string, value: unknown): void {
      setByPath(config, key, value);
    },

    getAll(): Record<string, unknown> {
      return { ...config };
    },

    validate(schema: (value: Record<string, unknown>) => boolean): boolean {
      return schema(config);
    },
  };
}
