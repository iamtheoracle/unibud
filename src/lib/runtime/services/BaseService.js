/**
 * Base Service — Lifecycle, Health, Metrics & Descriptor
 *
 * Every Platform Core service extends this base. It provides:
 *   - Lifecycle state machine: registered → initializing → ready → degraded → restarting → stopped → failed
 *   - Real health probing via _onHealth() override
 *   - Metrics: boot duration, request count, avg latency, error count, restart count
 *   - Service descriptor: id, version, dependencies, capabilities, health, metrics
 *   - restart() for automatic recovery
 */

import { logger } from '../logger';

const LIFECYCLE_STATES = [
  'registered', 'initializing', 'ready', 'degraded',
  'restarting', 'stopped', 'failed',
];

export class BaseService {
  constructor({ id, version = '1.0.0', dependencies = [], capabilities = [] }) {
    this._id = id;
    this._version = version;
    this._dependencies = dependencies;
    this._capabilities = capabilities;
    this._lifecycle = 'registered';
    this._initStart = null;

    this._metrics = {
      bootDurationMs: 0,
      requestCount: 0,
      errorCount: 0,
      restartCount: 0,
      avgLatencyMs: 0,
      _latencySum: 0,
    };

    this._health = {
      state: 'unknown',
      latencyMs: null,
      lastCheck: null,
      errors: [],
      detail: null,
    };
  }

  get id() { return this._id; }
  get version() { return this._version; }
  get lifecycle() { return this._lifecycle; }
  get ready() { return this._lifecycle === 'ready' || this._lifecycle === 'degraded'; }

  get descriptor() {
    return {
      id: this._id,
      version: this._version,
      lifecycle: this._lifecycle,
      dependencies: [...this._dependencies],
      capabilities: [...this._capabilities],
      metrics: { ...this._metrics },
      health: { ...this._health },
    };
  }

  /** Initialize the service. Override _onInit() in subclasses. */
  async init() {
    if (this._lifecycle === 'ready' || this._lifecycle === 'degraded') return;
    this._lifecycle = 'initializing';
    this._initStart = Date.now();
    try {
      await this._onInit();
      this._lifecycle = 'ready';
      this._metrics.bootDurationMs = Date.now() - this._initStart;
      logger.info(`${this._id} initialized`, { bootMs: this._metrics.bootDurationMs });
    } catch (e) {
      this._lifecycle = 'failed';
      this._pushError(e);
      logger.error(`${this._id} init failed`, { error: e.message });
      throw e;
    }
  }

  /** Override in subclass — service-specific initialization. */
  async _onInit() {}

  /** Shutdown the service. Override _onShutdown() in subclasses. */
  async shutdown() {
    this._lifecycle = 'stopped';
    try { await this._onShutdown?.(); } catch {}
  }

  async _onShutdown() {}

  /** Restart the service — used by automatic recovery. */
  async restart() {
    this._lifecycle = 'restarting';
    this._metrics.restartCount++;
    try {
      await this.shutdown();
      await this.init();
    } catch (e) {
      this._lifecycle = 'failed';
      this._pushError(e);
    }
  }

  /**
   * Run a real health probe. Override _onHealth() in subclasses to
   * test actual connectivity (database query, API ping, etc.).
   */
  async probeHealth() {
    const start = Date.now();
    try {
      const result = await this._onHealth?.() ?? { healthy: this._lifecycle === 'ready' };
      const latencyMs = Date.now() - start;

      this._health = {
        state: result.healthy ? 'healthy' : 'unhealthy',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errors: this._health.errors.slice(-10),
        detail: result.detail || null,
      };

      // Lifecycle transitions based on health
      if (!result.healthy && this._lifecycle === 'ready') {
        this._lifecycle = 'degraded';
      } else if (result.healthy && this._lifecycle === 'degraded') {
        this._lifecycle = 'ready';
      }

      return this._health;
    } catch (e) {
      this._health = {
        state: 'unhealthy',
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
        errors: [...this._health.errors.slice(-9), { time: new Date().toISOString(), error: e.message }],
        detail: e.message,
      };
      if (this._lifecycle === 'ready') this._lifecycle = 'degraded';
      return this._health;
    }
  }

  /** Override in subclass — test actual connectivity. */
  async _onHealth() {}

  /** Record a request with its latency and success status. */
  _recordRequest(latencyMs, success = true) {
    this._metrics.requestCount++;
    this._metrics._latencySum += latencyMs;
    this._metrics.avgLatencyMs = this._metrics._latencySum / this._metrics.requestCount;
    if (!success) this._metrics.errorCount++;
  }

  _pushError(e) {
    this._health.errors.push({ time: new Date().toISOString(), error: e.message });
    if (this._health.errors.length > 10) this._health.errors.shift();
  }
}

export default BaseService;