/**
 * Oracle Kernel — Configuration Manager
 *
 * Provides a single source of truth for all runtime configuration.
 * Configuration is built from three layers (highest wins):
 *
 *   1. Built-in defaults (hardcoded inside this file)
 *   2. Environment variables (loaded via EnvironmentLoader)
 *   3. Runtime overrides (passed to `initialize()`)
 *
 * Features:
 *  - Deep-merge of all layers on `initialize()`.
 *  - Per-key validator functions registered via `registerValidator()`.
 *  - `validate()` throws a descriptive error when any validator fails.
 *  - `freeze()` prevents further mutations after the bootstrap phase.
 *
 * Usage:
 *   import { configManager } from '@/oracle/kernel/configManager';
 *   import { environmentLoader } from '@/oracle/kernel/environmentLoader';
 *
 *   environmentLoader.load();
 *   configManager.initialize({
 *     app: { debug: environmentLoader.isDevelopment() }
 *   });
 *   const appId = configManager.get('app.id');
 */

import { environmentLoader } from './environmentLoader.js';

/** Built-in configuration defaults. */
const DEFAULTS = Object.freeze({
  app: {
    id:      null,
    name:    'UNIBUD',
    version: '1.0.0',
    debug:   false,
  },
  oracle: {
    kernel: {
      logLevel:        'info',
      healthInterval:  30_000,
      shutdownTimeout: 10_000,
    },
  },
  features: {
    plugins: true,
    health:  true,
  },
});

/**
 * Recursively deep-merges `source` into `target`.
 * Arrays in `source` replace (not concat) arrays in `target`.
 *
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  const output = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

/**
 * Resolves a dot-separated key path against a nested object.
 *
 * @param {object} obj
 * @param {string} path  e.g. `'oracle.kernel.logLevel'`
 * @returns {*}
 */
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

class ConfigManager {
  constructor() {
    /** @type {object} */
    this._config = deepMerge({}, DEFAULTS);
    /** @type {boolean} */
    this._initialized = false;
    /** @type {boolean} */
    this._frozen = false;
    /** @type {Map<string, (value: *) => true|string>} */
    this._validators = new Map();
  }

  /**
   * Initialises configuration by merging environment-derived values
   * and any caller-supplied overrides.
   *
   * @param {object} [overrides={}] – Runtime configuration overrides.
   * @returns {ConfigManager} – fluent interface.
   */
  initialize(overrides = {}) {
    if (this._frozen) {
      throw new Error('[OracleKernel:ConfigManager] Cannot initialize after config has been frozen.');
    }

    // Layer 2 – environment variables
    const envLayer = {
      app: {
        id:    environmentLoader.get('VITE_BASE44_APP_ID') ?? null,
        debug: environmentLoader.isDevelopment(),
      },
      oracle: {
        kernel: {
          logLevel: environmentLoader.get('VITE_ORACLE_LOG_LEVEL') ?? DEFAULTS.oracle.kernel.logLevel,
        },
      },
    };

    // Merge: defaults → env → caller overrides
    this._config = deepMerge(deepMerge(this._config, envLayer), overrides);
    this._initialized = true;
    return this;
  }

  /**
   * Returns the value at `key` (dot-separated path), or `defaultValue`
   * when the path does not exist.
   *
   * @param {string} key
   * @param {*} [defaultValue]
   * @returns {*}
   */
  get(key, defaultValue = undefined) {
    const value = resolvePath(this._config, key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Sets a configuration value at the given dot-separated `key`.
   * Throws when the config has been frozen.
   *
   * @param {string} key
   * @param {*} value
   * @returns {ConfigManager} – fluent interface.
   */
  set(key, value) {
    if (this._frozen) {
      throw new Error(`[OracleKernel:ConfigManager] Cannot set "${key}" — config is frozen.`);
    }

    const parts = key.split('.');
    let cursor = this._config;
    for (let i = 0; i < parts.length - 1; i++) {
      if (cursor[parts[i]] === undefined || typeof cursor[parts[i]] !== 'object') {
        cursor[parts[i]] = {};
      }
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = value;
    return this;
  }

  /**
   * Registers a validator for a specific key.
   * The validator function should return `true` on success, or a string
   * describing the failure.
   *
   * @param {string}   key
   * @param {(value: *) => true|string} fn
   * @returns {ConfigManager} – fluent interface.
   */
  registerValidator(key, fn) {
    this._validators.set(key, fn);
    return this;
  }

  /**
   * Runs all registered validators. Throws an `Error` listing every
   * failing key on the first failing pass.
   *
   * @returns {ConfigManager} – fluent interface.
   * @throws {Error}
   */
  validate() {
    const failures = [];
    for (const [key, fn] of this._validators) {
      const result = fn(this.get(key));
      if (result !== true) {
        failures.push(`  • "${key}": ${result}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(
        `[OracleKernel:ConfigManager] Validation failed:\n${failures.join('\n')}`
      );
    }
    return this;
  }

  /**
   * Freezes the configuration, preventing any further mutation.
   * Called automatically by the Bootstrap after validation.
   *
   * @returns {ConfigManager} – fluent interface.
   */
  freeze() {
    this._frozen = true;
    return this;
  }

  /** @returns {boolean} */
  isInitialized() {
    return this._initialized;
  }

  /** @returns {boolean} */
  isFrozen() {
    return this._frozen;
  }

  /**
   * Returns an immutable snapshot of the entire configuration tree.
   *
   * @returns {object}
   */
  getAll() {
    return deepMerge({}, this._config);
  }

  /**
   * Resets the manager to its initial state. Primarily useful in tests.
   */
  reset() {
    this._config = deepMerge({}, DEFAULTS);
    this._initialized = false;
    this._frozen = false;
    this._validators = new Map();
  }
}

/** Singleton instance — shared across the entire kernel. */
export const configManager = new ConfigManager();
