/**
 * Oracle Kernel — Health Manager
 *
 * Monitors the health of registered services and modules, aggregates
 * their individual statuses into a platform-wide health signal, and
 * notifies subscribers when the overall health changes.
 *
 * Health Status Values:
 *  - `'healthy'`   – component is operating normally
 *  - `'degraded'`  – component is operating but with reduced capacity
 *  - `'unhealthy'` – component has failed or is not responding
 *  - `'unknown'`   – no status has been reported yet
 *
 * Features:
 *  - Per-component status reporting via `report()`.
 *  - Optional async health-check functions registered via `registerCheck()`.
 *  - `runChecks()` invokes all registered check functions and updates
 *    statuses automatically.
 *  - `getOverallStatus()` aggregates: any `'unhealthy'` → `'unhealthy'`,
 *    any `'degraded'` → `'degraded'`, all `'healthy'` → `'healthy'`,
 *    else `'unknown'`.
 *  - `subscribe()` / `unsubscribe()` for reactive health monitoring.
 *
 * Usage:
 *   import { healthManager, HEALTH_STATUS } from '@/oracle/kernel/healthManager';
 *
 *   healthManager.registerCheck('auth-service', async () => {
 *     const ok = await authService.ping();
 *     return ok ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY;
 *   });
 *
 *   await healthManager.runChecks();
 *   console.log(healthManager.getOverallStatus());
 */

import { logger } from './logger.js';

const log = logger.child('healthManager');

/** @enum {string} */
export const HEALTH_STATUS = Object.freeze({
  HEALTHY:   'healthy',
  DEGRADED:  'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN:   'unknown',
});

/** Priority order for status aggregation (highest index wins). */
const STATUS_PRIORITY = {
  [HEALTH_STATUS.UNKNOWN]:   0,
  [HEALTH_STATUS.HEALTHY]:   1,
  [HEALTH_STATUS.DEGRADED]:  2,
  [HEALTH_STATUS.UNHEALTHY]: 3,
};

class HealthManager {
  constructor() {
    /** @type {Map<string, { status: string, detail: *, reportedAt: string }>} */
    this._statuses = new Map();
    /** @type {Map<string, () => Promise<string>|string>} */
    this._checks = new Map();
    /** @type {Array<(status: string, statuses: Map) => void>} */
    this._subscribers = [];
  }

  /**
   * Registers an async (or sync) health-check function for a component.
   * The function should return one of the `HEALTH_STATUS` values.
   *
   * @param {string}                      id
   * @param {() => Promise<string>|string} checkFn
   * @returns {HealthManager} – fluent interface.
   */
  registerCheck(id, checkFn) {
    if (typeof checkFn !== 'function') {
      throw new Error('[OracleKernel:HealthManager] checkFn must be a function.');
    }
    this._checks.set(id, checkFn);
    log.debug('Health check registered', { id });
    return this;
  }

  /**
   * Manually reports a health status for a component.
   *
   * @param {string} id
   * @param {string} status  – one of the HEALTH_STATUS values
   * @param {*}      [detail] – optional diagnostic payload
   * @returns {HealthManager} – fluent interface.
   */
  report(id, status, detail = undefined) {
    const validStatuses = Object.values(HEALTH_STATUS);
    if (!validStatuses.includes(status)) {
      throw new Error(
        `[OracleKernel:HealthManager] Unknown status "${status}". ` +
        `Use one of: ${validStatuses.join(', ')}.`
      );
    }

    this._statuses.set(id, { status, detail, reportedAt: new Date().toISOString() });

    if (status !== HEALTH_STATUS.HEALTHY) {
      log.warn('Health status reported', { id, status, detail });
    } else {
      log.debug('Health status reported', { id, status });
    }

    this._notifySubscribers();
    return this;
  }

  /**
   * Returns the stored health record for a component.
   *
   * @param {string} id
   * @returns {{ status: string, detail: *, reportedAt: string }|undefined}
   */
  getStatus(id) {
    return this._statuses.get(id);
  }

  /**
   * Computes the overall platform health from all reported statuses.
   * The most severe individual status wins.
   *
   * @returns {string} – one of the HEALTH_STATUS values
   */
  getOverallStatus() {
    if (this._statuses.size === 0) return HEALTH_STATUS.UNKNOWN;

    let worst = HEALTH_STATUS.HEALTHY;
    for (const { status } of this._statuses.values()) {
      if ((STATUS_PRIORITY[status] ?? 0) > STATUS_PRIORITY[worst]) {
        worst = status;
      }
    }
    return worst;
  }

  /**
   * Returns a snapshot of all component statuses.
   *
   * @returns {Record<string, { status: string, detail: *, reportedAt: string }>}
   */
  getAll() {
    const result = {};
    for (const [id, entry] of this._statuses) {
      result[id] = { ...entry };
    }
    return result;
  }

  /**
   * Invokes all registered check functions concurrently and updates
   * the status map accordingly.
   *
   * @returns {Promise<void>}
   */
  async runChecks() {
    const entries = Array.from(this._checks.entries());
    if (entries.length === 0) return;

    const results = await Promise.allSettled(
      entries.map(async ([id, fn]) => {
        const status = await fn();
        return { id, status };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { id, status } = result.value;
        this.report(id, status);
      } else {
        // Treat a thrown check as unhealthy
        const idx = results.indexOf(result);
        const id = entries[idx][0];
        this.report(id, HEALTH_STATUS.UNHEALTHY, result.reason?.message);
        log.error('Health check threw an error', { id, error: result.reason });
      }
    }
  }

  /**
   * Subscribes to overall-health-change notifications.
   * The callback receives the new overall status and the full
   * statuses map on every `report()` call.
   *
   * @param {(overallStatus: string, statuses: object) => void} fn
   * @returns {() => void} – unsubscribe function.
   */
  subscribe(fn) {
    this._subscribers.push(fn);
    return () => this.unsubscribe(fn);
  }

  /**
   * @param {Function} fn
   */
  unsubscribe(fn) {
    this._subscribers = this._subscribers.filter((s) => s !== fn);
  }

  /** @private */
  _notifySubscribers() {
    if (this._subscribers.length === 0) return;
    const overall = this.getOverallStatus();
    const all = this.getAll();
    for (const fn of this._subscribers) {
      try { fn(overall, all); } catch { /* swallow subscriber errors */ }
    }
  }

  /** Removes all statuses, checks, and subscribers. Primarily useful in tests. */
  clear() {
    this._statuses.clear();
    this._checks.clear();
    this._subscribers = [];
    log.debug('Health manager cleared');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const healthManager = new HealthManager();
