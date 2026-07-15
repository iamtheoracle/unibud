/**
 * Oracle Kernel — Environment Loader
 *
 * Provides a safe, centralised interface for reading environment
 * variables. In a Vite-based application every variable is exposed
 * through `import.meta.env`; this loader wraps that object so the
 * rest of the kernel never has to interact with it directly.
 *
 * Features:
 *  - Lazy loading — variables are read once on the first `load()` call.
 *  - Safe access — `get()` always returns a value or a supplied default;
 *    it never throws.
 *  - Required-variable assertion — `require()` throws a descriptive error
 *    when a mandatory variable is absent, making misconfiguration
 *    immediately visible during startup.
 *  - Mode helpers — convenience methods for checking the runtime mode.
 *
 * Usage:
 *   import { environmentLoader } from '@/oracle/kernel/environmentLoader';
 *
 *   environmentLoader.load();
 *   const apiUrl = environmentLoader.require('VITE_API_URL');
 *   const debug  = environmentLoader.get('VITE_DEBUG', 'false');
 */

class EnvironmentLoader {
  constructor() {
    /** @type {Record<string, string>} */
    this._env = {};
    /** @type {boolean} */
    this._loaded = false;
  }

  /**
   * Reads all environment variables from `import.meta.env` (Vite) and
   * caches them internally. Subsequent calls are no-ops.
   *
   * @returns {EnvironmentLoader} – fluent interface.
   */
  load() {
    if (this._loaded) return this;

    try {
      const source =
        typeof import.meta !== 'undefined' && import.meta.env
          ? import.meta.env
          : {};

      for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'string') {
          this._env[key] = value;
        }
      }
    } catch {
      // In non-Vite environments (e.g. pure Node tests) import.meta may
      // not be available — treat this as an empty environment.
    }

    this._loaded = true;
    return this;
  }

  /**
   * Returns the value of an environment variable, or `defaultValue`
   * when the variable is absent or empty.
   *
   * @param {string} key
   * @param {string|undefined} [defaultValue]
   * @returns {string|undefined}
   */
  get(key, defaultValue = undefined) {
    if (!this._loaded) this.load();
    const val = this._env[key];
    return val !== undefined && val !== '' ? val : defaultValue;
  }

  /**
   * Returns the value of an environment variable, throwing when it is
   * absent or empty.
   *
   * @param {string} key
   * @returns {string}
   * @throws {Error} when the variable is not defined.
   */
  require(key) {
    const val = this.get(key);
    if (val === undefined) {
      throw new Error(
        `[OracleKernel:EnvironmentLoader] Required environment variable "${key}" is not defined.`
      );
    }
    return val;
  }

  /**
   * Returns an immutable copy of all loaded environment variables.
   *
   * @returns {Record<string, string>}
   */
  getAll() {
    if (!this._loaded) this.load();
    return { ...this._env };
  }

  /** @returns {boolean} – true once `load()` has been called. */
  isLoaded() {
    return this._loaded;
  }

  /**
   * Returns the current Vite mode (e.g. `'development'`, `'production'`).
   *
   * @returns {string}
   */
  getMode() {
    return this.get('MODE', 'production');
  }

  /** @returns {boolean} */
  isDevelopment() {
    return this.getMode() === 'development';
  }

  /** @returns {boolean} */
  isProduction() {
    return this.getMode() === 'production';
  }

  /**
   * Resets the loader to its initial state. Primarily useful in tests.
   */
  reset() {
    this._env = {};
    this._loaded = false;
  }
}

/** Singleton instance — shared across the entire kernel. */
export const environmentLoader = new EnvironmentLoader();
