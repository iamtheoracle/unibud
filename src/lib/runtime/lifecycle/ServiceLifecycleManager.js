/**
 * Service Lifecycle Manager
 *
 * Manages the full lifecycle of every Platform Core service:
 *   registered → initializing → ready → degraded → restarting → stopped → failed
 *
 * Responsibilities:
 *   - Run real health probes periodically (every 30s)
 *   - Track lifecycle state for ALL services (BaseService + legacy)
 *   - Detect degraded services and trigger automatic recovery
 *   - Collect runtime metrics (boot duration, health latency, error count)
 *   - Expose a service catalog for observability dashboards
 *
 * Recovery flow:
 *   Health probe fails → mark degraded → Orbit schedules restart →
 *   service.restart() → health re-probe → ready or failed
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { services } from '../services';
import { HEALTH_PROBES } from './healthProbes';

const CHECK_INTERVAL_MS = 30000;
const MAX_RECOVERY_ATTEMPTS = 3;

class ServiceLifecycleManager {
  constructor() {
    this._started = false;
    this._checkInterval = null;
    this._states = new Map(); // id -> { lifecycle, health, metrics, recoveryAttempts }
    this._recoveryInProgress = new Set();
    this._recoveryLog = [];
  }

  /** Start periodic health monitoring. */
  start() {
    if (this._started) return;
    this._started = true;

    // Initialize state for all booted services
    for (const [id, service] of Object.entries(services)) {
      this._states.set(id, {
        lifecycle: service?.ready ? 'ready' : 'stopped',
        health: { state: 'unknown', latencyMs: null, lastCheck: null, detail: null },
        metrics: { bootDurationMs: 0, errorCount: 0, restartCount: 0, recoveryAttempts: 0 },
      });
    }

    this._checkInterval = setInterval(() => {
      this.checkAll().catch((e) => logger.debug('Health check cycle failed', { error: e.message }));
    }, CHECK_INTERVAL_MS);

    logger.info('ServiceLifecycleManager started', {
      services: this._states.size,
      intervalMs: CHECK_INTERVAL_MS,
    });

    // Run initial check
    this.checkAll().catch(() => {});
  }

  /** Stop monitoring. */
  stop() {
    if (this._checkInterval) clearInterval(this._checkInterval);
    this._started = false;
    logger.info('ServiceLifecycleManager stopped');
  }

  /** Run health probes on all services. */
  async checkAll() {
    const results = {};
    for (const id of Object.keys(services)) {
      try {
        results[id] = await this.checkService(id);
      } catch (e) {
        results[id] = { state: 'unhealthy', detail: e.message };
      }
    }

    const degraded = Object.entries(results).filter(([, r]) => r.state === 'unhealthy');
    if (degraded.length > 0) {
      logger.warn('Health check found degraded services', {
        degraded: degraded.map(([id]) => id),
      });
    }

    eventBus.publish({
      type: 'lifecycle.health_checked',
      category: 'monitoring',
      payload: {
        total: Object.keys(results).length,
        healthy: Object.values(results).filter((r) => r.state === 'healthy').length,
        unhealthy: degraded.length,
      },
    });

    return results;
  }

  /** Run a health probe on a single service. */
  async checkService(id) {
    const service = services[id];
    if (!service) return { state: 'unknown', detail: 'Service not found' };

    const state = this._states.get(id) || {
      lifecycle: 'stopped',
      health: {},
      metrics: {},
    };

    // If service extends BaseService, use its built-in probeHealth()
    if (typeof service.probeHealth === 'function') {
      const health = await service.probeHealth();
      this._states.set(id, {
        lifecycle: service.lifecycle,
        health,
        metrics: service.descriptor.metrics,
      });
      return health;
    }

    // Legacy service: use the health probe registry
    const probe = HEALTH_PROBES[id];
    if (!probe) {
      const result = { state: 'unknown', detail: 'No probe registered' };
      this._states.set(id, { ...state, health: result });
      return result;
    }

    const start = Date.now();
    try {
      const probeResult = await probe(service);
      const health = {
        state: probeResult.healthy ? 'healthy' : 'unhealthy',
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
        detail: probeResult.detail,
      };

      // Lifecycle transitions
      let lifecycle = state.lifecycle;
      if (!probeResult.healthy && lifecycle === 'ready') {
        lifecycle = 'degraded';
        this._scheduleRecovery(id);
      } else if (probeResult.healthy && lifecycle === 'degraded') {
        lifecycle = 'ready';
        state.metrics.recoveryAttempts = 0;
      }

      this._states.set(id, { lifecycle, health, metrics: state.metrics });
      return health;
    } catch (e) {
      const health = {
        state: 'unhealthy',
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
        detail: e.message,
      };

      if (state.lifecycle === 'ready') {
        this._states.set(id, { lifecycle: 'degraded', health, metrics: state.metrics });
        this._scheduleRecovery(id);
      } else {
        this._states.set(id, { lifecycle: state.lifecycle, health, metrics: state.metrics });
      }

      return health;
    }
  }

  /** Schedule automatic recovery for a degraded service. */
  _scheduleRecovery(id) {
    if (this._recoveryInProgress.has(id)) return;

    const state = this._states.get(id);
    if (!state) return;

    if (state.metrics.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
      logger.error('Service recovery exhausted', { service: id, attempts: state.metrics.recoveryAttempts });
      state.lifecycle = 'failed';
      return;
    }

    // Attempt recovery asynchronously
    setTimeout(() => this.attemptRecovery(id), 1000);
  }

  /** Attempt to restart a degraded or failed service. */
  async attemptRecovery(id) {
    if (this._recoveryInProgress.has(id)) return;
    this._recoveryInProgress.add(id);

    const service = services[id];
    const state = this._states.get(id);
    if (!service || !state) {
      this._recoveryInProgress.delete(id);
      return;
    }

    state.metrics.recoveryAttempts++;
    state.lifecycle = 'restarting';

    const logEntry = {
      service: id,
      attempt: state.metrics.recoveryAttempts,
      timestamp: new Date().toISOString(),
      result: 'pending',
    };
    this._recoveryLog.unshift(logEntry);
    if (this._recoveryLog.length > 20) this._recoveryLog.pop();

    logger.warn('Attempting service recovery', { service: id, attempt: state.metrics.recoveryAttempts });
    eventBus.publish({
      type: 'lifecycle.recovery_started',
      category: 'lifecycle',
      payload: { service: id, attempt: state.metrics.recoveryAttempts },
    });

    try {
      if (typeof service.restart === 'function') {
        await service.restart();
      } else if (typeof service.init === 'function') {
        await service.init();
      }

      // Validate recovery
      const health = await this.checkService(id);
      const recovered = health.state === 'healthy';

      logEntry.result = recovered ? 'recovered' : 'still_unhealthy';

      eventBus.publish({
        type: 'lifecycle.recovery_completed',
        category: 'lifecycle',
        payload: { service: id, recovered },
      });

      if (recovered) {
        state.metrics.recoveryAttempts = 0;
        state.lifecycle = 'ready';
        logger.info('Service recovered', { service: id });
      } else if (state.metrics.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
        state.lifecycle = 'failed';
        logger.error('Service recovery exhausted', { service: id });
      } else {
        state.lifecycle = 'degraded';
      }
    } catch (e) {
      logEntry.result = `error: ${e.message}`;
      logger.error('Service recovery error', { service: id, error: e.message });
      if (state.metrics.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
        state.lifecycle = 'failed';
      } else {
        state.lifecycle = 'degraded';
      }
    } finally {
      this._recoveryInProgress.delete(id);
    }
  }

  /** Get the full service catalog with lifecycle, health, and metrics. */
  getCatalog() {
    return Object.entries(services).map(([id, service]) => {
      // If service extends BaseService, use its descriptor directly
      if (typeof service?.descriptor === 'object' && service.descriptor?.id) {
        return service.descriptor;
      }

      // Legacy service: use tracked state
      const state = this._states.get(id) || {
        lifecycle: service?.ready ? 'ready' : 'stopped',
        health: { state: 'unknown' },
        metrics: {},
      };

      return {
        id,
        version: 'legacy',
        lifecycle: state.lifecycle,
        dependencies: [],
        capabilities: [],
        metrics: { bootDurationMs: 0, ...state.metrics },
        health: state.health,
      };
    });
  }

  /** Get recent recovery attempts. */
  getRecoveryLog() {
    return [...this._recoveryLog];
  }

  get started() { return this._started; }
}

export const lifecycleManager = new ServiceLifecycleManager();
export default lifecycleManager;