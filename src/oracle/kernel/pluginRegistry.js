/**
 * Oracle Kernel — Plugin Registry
 *
 * Supports dynamic, loosely-coupled extension of the platform via a
 * plugin/hook system. Plugins can attach new behaviour at named hook
 * points without touching core code.
 *
 * A plugin descriptor must contain at minimum:
 *   - `id`    {string}   – unique, kebab-case identifier
 *   - `name`  {string}   – human-readable display name
 *
 * Optional well-known fields:
 *   - `version`     {string}   – semver string
 *   - `description` {string}
 *   - `hooks`       {Record<string, Function>} – map of `hookName → fn`
 *     The registry will automatically register these hooks on `register()`.
 *   - `onInstall`   {() => void} – called when the plugin is registered
 *   - `onUninstall` {() => void} – called when the plugin is unregistered
 *
 * Hook behaviour:
 *  - Multiple handlers can be registered for the same hook name.
 *  - `runHook(name, ...args)` calls all handlers in registration order.
 *  - Results are returned as an array (one element per handler).
 *  - Async handlers are all awaited in parallel via `Promise.allSettled`.
 *
 * Usage:
 *   import { pluginRegistry } from '@/oracle/kernel/pluginRegistry';
 *
 *   pluginRegistry.register({
 *     id: 'analytics-plugin',
 *     name: 'Analytics Plugin',
 *     hooks: {
 *       'service:registered': (serviceId) => trackEvent('service_registered', { serviceId }),
 *     },
 *   });
 *
 *   await pluginRegistry.runHook('service:registered', 'auth-service');
 */

import { logger } from './logger.js';

const log = logger.child('pluginRegistry');

class PluginRegistry {
  constructor() {
    /** @type {Map<string, object>} */
    this._plugins = new Map();
    /** @type {Map<string, Array<{ pluginId: string, fn: Function }>>} */
    this._hooks = new Map();
  }

  /**
   * Registers a plugin. If a plugin with the same `id` already exists
   * it is first unregistered (triggering its `onUninstall` callback)
   * before the new version is installed.
   *
   * @param {{ id: string, name: string, [key: string]: * }} descriptor
   * @returns {PluginRegistry} – fluent interface.
   * @throws {Error} when `id` or `name` is missing.
   */
  register(descriptor) {
    if (!descriptor?.id) {
      throw new Error('[OracleKernel:PluginRegistry] Plugin descriptor must include an "id" field.');
    }
    if (!descriptor?.name) {
      throw new Error('[OracleKernel:PluginRegistry] Plugin descriptor must include a "name" field.');
    }

    // Unregister previous version if present
    if (this._plugins.has(descriptor.id)) {
      this.unregister(descriptor.id);
    }

    this._plugins.set(descriptor.id, descriptor);

    // Auto-register hooks declared in the descriptor
    if (descriptor.hooks && typeof descriptor.hooks === 'object') {
      for (const [hookName, fn] of Object.entries(descriptor.hooks)) {
        if (typeof fn === 'function') {
          this.addHook(hookName, fn, descriptor.id);
        }
      }
    }

    if (typeof descriptor.onInstall === 'function') {
      try { descriptor.onInstall(); } catch (err) {
        log.warn('Plugin onInstall threw an error', { id: descriptor.id, error: err });
      }
    }

    log.debug('Plugin registered', { id: descriptor.id });
    return this;
  }

  /**
   * Unregisters a plugin, removing all of its hook handlers and
   * calling its `onUninstall` callback.
   *
   * @param {string} id
   * @returns {boolean} – `true` if the plugin existed and was removed.
   */
  unregister(id) {
    const plugin = this._plugins.get(id);
    if (!plugin) return false;

    // Remove all hook handlers that belong to this plugin
    for (const [hookName, handlers] of this._hooks) {
      const filtered = handlers.filter((h) => h.pluginId !== id);
      if (filtered.length === 0) {
        this._hooks.delete(hookName);
      } else {
        this._hooks.set(hookName, filtered);
      }
    }

    if (typeof plugin.onUninstall === 'function') {
      try { plugin.onUninstall(); } catch (err) {
        log.warn('Plugin onUninstall threw an error', { id, error: err });
      }
    }

    this._plugins.delete(id);
    log.debug('Plugin unregistered', { id });
    return true;
  }

  /**
   * Returns a plugin descriptor, or `undefined` when not found.
   *
   * @param {string} id
   * @returns {object|undefined}
   */
  get(id) {
    return this._plugins.get(id);
  }

  /** @param {string} id @returns {boolean} */
  has(id) {
    return this._plugins.has(id);
  }

  /** Returns all registered plugin descriptors. @returns {object[]} */
  list() {
    return Array.from(this._plugins.values());
  }

  /**
   * Adds a hook handler independently of any plugin.
   * Useful for ad-hoc, anonymous hook registrations.
   *
   * @param {string}   hookName
   * @param {Function} fn
   * @param {string}   [pluginId='anonymous']
   * @returns {PluginRegistry} – fluent interface.
   */
  addHook(hookName, fn, pluginId = 'anonymous') {
    if (typeof fn !== 'function') {
      throw new Error('[OracleKernel:PluginRegistry] Hook handler must be a function.');
    }
    if (!this._hooks.has(hookName)) {
      this._hooks.set(hookName, []);
    }
    this._hooks.get(hookName).push({ pluginId, fn });
    log.debug('Hook handler added', { hookName, pluginId });
    return this;
  }

  /**
   * Removes a specific hook handler function.
   *
   * @param {string}   hookName
   * @param {Function} fn
   * @returns {boolean}
   */
  removeHook(hookName, fn) {
    const handlers = this._hooks.get(hookName);
    if (!handlers) return false;
    const filtered = handlers.filter((h) => h.fn !== fn);
    if (filtered.length === handlers.length) return false;
    this._hooks.set(hookName, filtered);
    return true;
  }

  /**
   * Runs all handlers registered for `hookName`.
   * All handlers are awaited concurrently via `Promise.allSettled`.
   * Failed handlers are logged but do not prevent other handlers
   * from running.
   *
   * @param {string} hookName
   * @param {...*}   args     – arguments forwarded to every handler
   * @returns {Promise<Array<*>>} – resolved results (settled values)
   */
  async runHook(hookName, ...args) {
    const handlers = this._hooks.get(hookName) ?? [];
    if (handlers.length === 0) return [];

    const results = await Promise.allSettled(
      handlers.map(({ fn, pluginId }) =>
        Promise.resolve().then(() => fn(...args)).catch((err) => {
          log.warn('Hook handler threw an error', { hookName, pluginId, error: err });
          throw err;
        })
      )
    );

    return results.map((r) => (r.status === 'fulfilled' ? r.value : undefined));
  }

  /** Returns the total number of registered plugins. */
  get size() {
    return this._plugins.size;
  }

  /** Removes all plugins and hooks. Primarily useful in tests. */
  clear() {
    // Trigger onUninstall for each plugin
    for (const id of [...this._plugins.keys()]) {
      this.unregister(id);
    }
    this._hooks.clear();
    log.debug('Plugin registry cleared');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const pluginRegistry = new PluginRegistry();
