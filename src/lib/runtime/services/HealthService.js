/**
 * Health Service — Health Checks & Status
 *
 * Registers and runs health checks for all runtime components. The boot
 * process calls this after all services are initialized.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';

class HealthService {
  constructor() {
    this._checks = new Map();
    this._status = {};
    this._ready = false;
  }

  async init() {
    this._ready = true;
    logger.info('HealthService initialized');
  }

  /** Register a health check. */
  registerCheck(name, fn) {
    this._checks.set(name, fn);
  }

  /** Run a single health check. */
  async check(name) {
    const fn = this._checks.get(name);
    if (!fn) return { name, status: 'unknown' };
    try {
      const result = await fn();
      const status = result?.healthy ? 'healthy' : 'unhealthy';
      this._status[name] = { name, status, detail: result?.detail || null, timestamp: new Date().toISOString() };
      return this._status[name];
    } catch (e) {
      this._status[name] = { name, status: 'unhealthy', detail: e.message, timestamp: new Date().toISOString() };
      return this._status[name];
    }
  }

  /** Run all health checks. */
  async checkAll() {
    const results = {};
    for (const name of this._checks.keys()) {
      results[name] = await this.check(name);
    }
    const allHealthy = Object.values(results).every((r) => r.status === 'healthy');
    eventBus.publish({
      type: 'health.checked',
      category: 'monitoring',
      payload: { allHealthy, checkCount: Object.keys(results).length },
    });
    return { healthy: allHealthy, checks: results };
  }

  /** Get current status snapshot. */
  getStatus() {
    return { ...this._status };
  }

  get ready() { return this._ready; }
}

export const healthService = new HealthService();
export default healthService;