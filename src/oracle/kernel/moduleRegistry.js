/**
 * Oracle Kernel — Module Registry
 *
 * A centralised registry for platform modules. Modules are the
 * high-level feature areas that power UNIBUD (e.g. `academics`,
 * `campus`, `community`). The registry tracks their metadata,
 * enabled / disabled state, and category membership.
 *
 * A module descriptor must contain at minimum:
 *   - `id`       {string}  – unique, kebab-case identifier
 *   - `name`     {string}  – human-readable display name
 *
 * Optional well-known fields:
 *   - `category` {string}  – logical grouping (e.g. `'academic'`)
 *   - `enabled`  {boolean} – defaults to `true`
 *   - `version`  {string}  – semver string
 *   - `dependencies` {string[]} – other module IDs this module requires
 *
 * Usage:
 *   import { moduleRegistry } from '@/oracle/kernel/moduleRegistry';
 *
 *   moduleRegistry.register({ id: 'academics', name: 'Academics', category: 'academic' });
 *   const mod = moduleRegistry.get('academics');
 *   const active = moduleRegistry.listEnabled();
 */

import { logger } from './logger.js';

const log = logger.child('moduleRegistry');

class ModuleRegistry {
  constructor() {
    /** @type {Map<string, ModuleDescriptor>} */
    this._modules = new Map();
  }

  /**
   * Registers a module.  If a module with the same `id` is already
   * registered it is silently overwritten (re-registration is allowed
   * to support hot-reload scenarios).
   *
   * @param {{ id: string, name: string, [key: string]: * }} descriptor
   * @returns {ModuleRegistry} – fluent interface.
   * @throws {Error} when `id` or `name` is missing.
   */
  register(descriptor) {
    if (!descriptor?.id) {
      throw new Error('[OracleKernel:ModuleRegistry] Module descriptor must include an "id" field.');
    }
    if (!descriptor?.name) {
      throw new Error('[OracleKernel:ModuleRegistry] Module descriptor must include a "name" field.');
    }

    const entry = {
      enabled: true,
      ...descriptor,
      id: String(descriptor.id),
    };

    const existed = this._modules.has(entry.id);
    this._modules.set(entry.id, entry);
    log.debug(existed ? 'Module re-registered' : 'Module registered', { id: entry.id });
    return this;
  }

  /**
   * Removes a module from the registry.
   *
   * @param {string} id
   * @returns {boolean} – `true` if the module existed and was removed.
   */
  unregister(id) {
    const removed = this._modules.delete(id);
    if (removed) log.debug('Module unregistered', { id });
    return removed;
  }

  /**
   * Returns the descriptor for a module, or `undefined` when not found.
   *
   * @param {string} id
   * @returns {object|undefined}
   */
  get(id) {
    return this._modules.get(id);
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this._modules.has(id);
  }

  /**
   * Returns all registered module descriptors.
   *
   * @returns {object[]}
   */
  list() {
    return Array.from(this._modules.values());
  }

  /**
   * Returns only modules whose `enabled` flag is `true` (or absent).
   *
   * @returns {object[]}
   */
  listEnabled() {
    return this.list().filter((m) => m.enabled !== false);
  }

  /**
   * Returns all modules belonging to a specific category.
   *
   * @param {string} category
   * @returns {object[]}
   */
  listByCategory(category) {
    return this.list().filter((m) => m.category === category);
  }

  /**
   * Enables or disables a module by id.
   *
   * @param {string}  id
   * @param {boolean} enabled
   * @returns {boolean} – `true` if the module was found and updated.
   */
  setEnabled(id, enabled) {
    const mod = this._modules.get(id);
    if (!mod) return false;
    mod.enabled = Boolean(enabled);
    log.debug(`Module ${enabled ? 'enabled' : 'disabled'}`, { id });
    return true;
  }

  /** Returns the total number of registered modules. */
  get size() {
    return this._modules.size;
  }

  /** Removes all registered modules. Primarily useful in tests. */
  clear() {
    this._modules.clear();
    log.debug('Module registry cleared');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const moduleRegistry = new ModuleRegistry();
