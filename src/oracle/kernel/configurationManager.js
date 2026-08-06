/**
 * @typedef {Record<string, unknown>} KernelConfig
 */

export class ConfigurationManager {
  /** @param {KernelConfig} [initialConfig] */
  constructor(initialConfig = {}) {
    /** @type {KernelConfig} */
    this.config = structuredClone(initialConfig);
  }

  /**
   * @param {KernelConfig} nextConfig
   * @returns {KernelConfig}
   */
  merge(nextConfig) {
    this.config = mergeObjects(this.config, nextConfig);
    return this.getAll();
  }

  /** @returns {KernelConfig} */
  getAll() {
    return structuredClone(this.config);
  }

  /**
   * @param {string} path
   * @param {unknown} [defaultValue]
   */
  get(path, defaultValue = undefined) {
    const keys = path.split(".");
    /** @type {unknown} */
    let cursor = this.config;

    for (const key of keys) {
      if (!isObject(cursor) || !(key in cursor)) {
        return defaultValue;
      }
      cursor = asRecord(cursor)[key];
    }

    return cursor;
  }

  /**
   * @param {string} path
   * @param {unknown} value
   */
  set(path, value) {
    const keys = path.split(".");
    /** @type {Record<string, unknown>} */
    let cursor = this.config;

    for (let index = 0; index < keys.length - 1; index += 1) {
      const key = keys[index];
      if (isUnsafeKey(key)) {
        throw new Error(unsafeKeyMessage(key));
      }
      const current = cursor[key];

      if (!isObject(current)) {
        cursor[key] = {};
      }

      cursor = /** @type {Record<string, unknown>} */ (cursor[key]);
    }

    const finalKey = keys[keys.length - 1];
    if (isUnsafeKey(finalKey)) {
      throw new Error(unsafeKeyMessage(finalKey));
    }

    cursor[finalKey] = value;
  }
}

/**
 * @param {Record<string, unknown>} target
 * @param {Record<string, unknown>} source
 * @returns {Record<string, unknown>}
 */
function mergeObjects(target, source) {
  /** @type {Record<string, unknown>} */
  const merged = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (isUnsafeKey(key)) {
      throw new Error(unsafeKeyMessage(key));
    }

    const current = merged[key];

    if (isObject(current) && isObject(value)) {
      merged[key] = mergeObjects(asRecord(current), asRecord(value));
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** @param {unknown} value @returns {Record<string, unknown>} */
function asRecord(value) {
  return /** @type {Record<string, unknown>} */ (value);
}

/** @param {string} key */
function isUnsafeKey(key) {
  return key === "__proto__" || key === "prototype" || key === "constructor";
}

/** @param {string} key */
function unsafeKeyMessage(key) {
  return `Unsafe configuration key "${key}" blocked to prevent prototype pollution. Use a different key name.`;
}
