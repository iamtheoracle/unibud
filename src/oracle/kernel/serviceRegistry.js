/**
 * Oracle Kernel — Service Registry
 *
 * A centralised registry for platform services. Services are the
 * runtime units of functionality that modules expose (e.g.
 * `auth-service`, `notification-service`). The registry manages their
 * lifecycle metadata — registration, discovery, status tracking, and
 * type-based lookup.
 *
 * A service descriptor must contain at minimum:
 *   - `id`   {string} – unique, kebab-case identifier
 *   - `name` {string} – human-readable display name
 *
 * Optional well-known fields:
 *   - `type`         {string}   – logical type (e.g. `'data'`, `'integration'`)
 *   - `version`      {string}   – semver string
 *   - `module`       {string}   – owning module id
 *   - `dependencies` {string[]} – other service IDs this service needs
 *   - `instance`     {*}        – the live service object / class instance
 *
 * Usage:
 *   import { serviceRegistry } from '@/oracle/kernel/serviceRegistry';
 *
 *   serviceRegistry.register({
 *     id: 'auth-service',
 *     name: 'Authentication Service',
 *     type: 'security',
 *     instance: authServiceInstance,
 *   });
 *   const svc = serviceRegistry.get('auth-service');
 */

import { logger } from './logger.js';

const log = logger.child('serviceRegistry');

class ServiceRegistry {
  constructor() {
    /** @type {Map<string, ServiceDescriptor>} */
    this._services = new Map();
  }

  /**
   * Registers a service.  Re-registration of the same id is allowed
   * and silently replaces the previous entry.
   *
   * @param {{ id: string, name: string, [key: string]: * }} descriptor
   * @returns {ServiceRegistry} – fluent interface.
   * @throws {Error} when `id` or `name` is missing.
   */
  register(descriptor) {
    if (!descriptor?.id) {
      throw new Error('[OracleKernel:ServiceRegistry] Service descriptor must include an "id" field.');
    }
    if (!descriptor?.name) {
      throw new Error('[OracleKernel:ServiceRegistry] Service descriptor must include a "name" field.');
    }

    const entry = {
      type: 'generic',
      status: 'registered',
      ...descriptor,
      id: String(descriptor.id),
      registeredAt: new Date().toISOString(),
    };

    const existed = this._services.has(entry.id);
    this._services.set(entry.id, entry);
    log.debug(existed ? 'Service re-registered' : 'Service registered', { id: entry.id, type: entry.type });
    return this;
  }

  /**
   * Removes a service from the registry.
   *
   * @param {string} id
   * @returns {boolean} – `true` if the service existed and was removed.
   */
  unregister(id) {
    const removed = this._services.delete(id);
    if (removed) log.debug('Service unregistered', { id });
    return removed;
  }

  /**
   * Returns the descriptor for a service, or `undefined` when not found.
   *
   * @param {string} id
   * @returns {object|undefined}
   */
  get(id) {
    return this._services.get(id);
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this._services.has(id);
  }

  /**
   * Returns all registered service descriptors.
   *
   * @returns {object[]}
   */
  list() {
    return Array.from(this._services.values());
  }

  /**
   * Returns all services of a specific type.
   *
   * @param {string} type
   * @returns {object[]}
   */
  listByType(type) {
    return this.list().filter((s) => s.type === type);
  }

  /**
   * Returns all services belonging to a specific module.
   *
   * @param {string} moduleId
   * @returns {object[]}
   */
  listByModule(moduleId) {
    return this.list().filter((s) => s.module === moduleId);
  }

  /**
   * Updates the `status` field of a registered service.
   *
   * @param {string} id
   * @param {string} status
   * @returns {boolean} – `true` if the service was found and updated.
   */
  setStatus(id, status) {
    const svc = this._services.get(id);
    if (!svc) return false;
    svc.status = status;
    return true;
  }

  /** Returns the total number of registered services. */
  get size() {
    return this._services.size;
  }

  /** Removes all registered services. Primarily useful in tests. */
  clear() {
    this._services.clear();
    log.debug('Service registry cleared');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const serviceRegistry = new ServiceRegistry();
