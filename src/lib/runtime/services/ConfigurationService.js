/**
 * Configuration Service — Runtime Configuration
 *
 * Provides centralized runtime configuration. Agents read config from here
 * rather than hardcoding values.
 */

import { logger } from '../logger';

const DEFAULTS = {
  'runtime.environment': 'production',
  'runtime.strictMode': true,
  'guardian.defaultPolicy': 'deny',
  'guardian.logDenied': true,
  'nexus.maxConcurrency': 5,
  'nexus.timeout': 30000,
  'orbit.maxRetries': 3,
  'orbit.retryDelay': 1000,
  'spark.maxContextTokens': 8000,
  'bud.streamOutput': true,
  'model.defaultTier': 'standard',
};

class ConfigurationService {
  constructor() {
    this._config = { ...DEFAULTS };
    this._ready = false;
  }

  async init() {
    this._ready = true;
    logger.info('ConfigurationService initialized', { configKeys: Object.keys(this._config).length });
  }

  /** Get a configuration value. */
  get(key, fallback = null) {
    return this._config[key] ?? fallback;
  }

  /** Set a configuration value (runtime override). */
  set(key, value) {
    const old = this._config[key];
    this._config[key] = value;
    logger.debug('Configuration updated', { key, old, new: value });
  }

  /** Get all keys in a section (prefix). */
  getSection(prefix) {
    const result = {};
    for (const [key, value] of Object.entries(this._config)) {
      if (key.startsWith(prefix)) result[key] = value;
    }
    return result;
  }

  get ready() { return this._ready; }
}

export const configurationService = new ConfigurationService();
export default configurationService;