/**
 * @typedef {'string'|'number'|'boolean'} EnvironmentType
 * @typedef {{ key: string; required?: boolean; defaultValue?: string|number|boolean; type?: EnvironmentType }} EnvironmentSchemaEntry
 */

export class EnvironmentManager {
  /**
   * @param {{ source?: Record<string, string|undefined>; schema?: EnvironmentSchemaEntry[] }} [options]
   */
  constructor(options = {}) {
    this.source = options.source ?? process.env;
    this.schema = options.schema ?? [];
    this.values = {};
  }

  /** @returns {Record<string, string|number|boolean>} */
  load() {
    /** @type {Record<string, string|number|boolean>} */
    const loaded = {};

    for (const entry of this.schema) {
      const raw = this.source[entry.key];

      if ((raw === undefined || raw === "") && entry.required && entry.defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${entry.key}`);
      }

      const resolved = raw === undefined || raw === "" ? entry.defaultValue : raw;
      loaded[entry.key] = this.#coerce(resolved, entry.type ?? "string");
    }

    this.values = loaded;
    return { ...loaded };
  }

  /** @param {string} key */
  get(key) {
    return this.values[key];
  }

  /**
   * @param {string|number|boolean|undefined} value
   * @param {EnvironmentType} type
   */
  #coerce(value, type) {
    if (value === undefined) {
      return undefined;
    }

    if (type === "number") {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        throw new Error(`Invalid numeric environment value: ${value}`);
      }

      return numeric;
    }

    if (type === "boolean") {
      if (typeof value === "boolean") {
        return value;
      }

      return value === "true" || value === "1";
    }

    return String(value);
  }
}
