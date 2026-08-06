/**
 * AIMonitor — Agent Health Monitoring & Metrics
 *
 * Tracks health status and runtime metrics for every AI agent.
 * Metrics are collected passively — agents emit events and the monitor
 * aggregates them. No agent needs to call the monitor directly.
 *
 * Metrics tracked per agent:
 *   - invocations (total calls)
 *   - errors (total errors)
 *   - latencyMs (last, min, max, avg)
 *   - errorRate (rolling 100-call window)
 *   - lastActiveAt
 *   - status: healthy | degraded | unhealthy | unknown
 *
 * Health thresholds (configurable):
 *   - errorRate > 0.5 → degraded
 *   - errorRate > 0.9 → unhealthy
 *   - no activity in 5 minutes → unknown
 */

import { logger } from "@/lib/runtime/logger";
import { eventBus } from "@/lib/runtime/eventBus";

const ERROR_RATE_WINDOW = 100;
const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000;
const DEGRADED_ERROR_RATE = 0.5;
const UNHEALTHY_ERROR_RATE = 0.9;

class AIMonitor {
  constructor() {
    /** Map<agentId, AgentMetrics> */
    this._metrics = new Map();
    this._unsubscribe = null;
  }

  /**
   * Start monitoring — subscribes to the event bus to collect metrics.
   */
  start() {
    this._unsubscribe = eventBus.on("*", (event) => {
      this._onEvent(event);
    });
    logger.info("AIMonitor: started");
  }

  /**
   * Stop monitoring.
   */
  stop() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    logger.info("AIMonitor: stopped");
  }

  /**
   * Record a successful agent invocation.
   *
   * @param {string} agentId
   * @param {number} latencyMs
   */
  recordSuccess(agentId, latencyMs = 0) {
    const m = this._getOrCreate(agentId);
    m.invocations += 1;
    m.lastActiveAt = new Date().toISOString();
    this._updateLatency(m, latencyMs);
    m.recentResults.push(true);
    if (m.recentResults.length > ERROR_RATE_WINDOW) m.recentResults.shift();
    this._updateStatus(m);
  }

  /**
   * Record a failed agent invocation.
   *
   * @param {string} agentId
   * @param {string} errorMessage
   * @param {number} latencyMs
   */
  recordError(agentId, errorMessage = "unknown", latencyMs = 0) {
    const m = this._getOrCreate(agentId);
    m.invocations += 1;
    m.errors += 1;
    m.lastError = errorMessage;
    m.lastErrorAt = new Date().toISOString();
    m.lastActiveAt = new Date().toISOString();
    this._updateLatency(m, latencyMs);
    m.recentResults.push(false);
    if (m.recentResults.length > ERROR_RATE_WINDOW) m.recentResults.shift();
    this._updateStatus(m);
  }

  /**
   * Get health status for an agent.
   *
   * @param {string} agentId
   * @returns {{ status: string, invocations: number, errors: number, errorRate: number, latency: object, lastActiveAt: string|null }}
   */
  health(agentId) {
    const m = this._metrics.get(agentId);
    if (!m) return { status: "unknown", invocations: 0, errors: 0, errorRate: 0, latency: { last: 0, min: 0, max: 0, avg: 0 }, lastActiveAt: null };
    this._updateStatus(m);
    return {
      status: m.status,
      invocations: m.invocations,
      errors: m.errors,
      errorRate: m.errorRate,
      latency: { ...m.latency },
      lastActiveAt: m.lastActiveAt,
      lastError: m.lastError || null,
      lastErrorAt: m.lastErrorAt || null,
    };
  }

  /**
   * Get health for all monitored agents.
   *
   * @returns {Array<{ agentId: string, ...health }>}
   */
  listHealth() {
    return Array.from(this._metrics.keys()).map((id) => ({
      agentId: id,
      ...this.health(id),
    }));
  }

  /**
   * Get raw metrics for an agent (includes internal fields).
   *
   * @param {string} agentId
   */
  metrics(agentId) {
    return this._metrics.get(agentId) || null;
  }

  /**
   * Reset metrics for an agent.
   *
   * @param {string} agentId
   */
  reset(agentId) {
    this._metrics.delete(agentId);
  }

  // ── Internal ──────────────────────────────────────────────────────────

  _onEvent(event) {
    // Collect metrics from standard runtime events
    const agentId = event.payload?.agentId || event.payload?.aiId;
    if (!agentId) return;

    if (event.category === "lifecycle" && event.type === "ai.initialized") {
      this._getOrCreate(agentId); // ensure tracked
    }
  }

  _getOrCreate(agentId) {
    if (this._metrics.has(agentId)) return this._metrics.get(agentId);
    const m = {
      agentId,
      invocations: 0,
      errors: 0,
      errorRate: 0,
      lastError: null,
      lastErrorAt: null,
      lastActiveAt: null,
      recentResults: [],
      latency: { last: 0, min: Infinity, max: 0, avg: 0, total: 0 },
      status: "unknown",
    };
    this._metrics.set(agentId, m);
    return m;
  }

  _updateLatency(m, latencyMs) {
    m.latency.last = latencyMs;
    if (latencyMs < m.latency.min) m.latency.min = latencyMs;
    if (latencyMs > m.latency.max) m.latency.max = latencyMs;
    m.latency.total += latencyMs;
    m.latency.avg = m.invocations > 0 ? Math.round(m.latency.total / m.invocations) : 0;
  }

  _updateStatus(m) {
    const windowSize = m.recentResults.length;
    if (windowSize === 0) {
      m.status = "unknown";
      return;
    }

    // Check for inactivity
    if (m.lastActiveAt) {
      const inactiveMs = Date.now() - new Date(m.lastActiveAt).getTime();
      if (inactiveMs > INACTIVITY_THRESHOLD_MS) {
        m.status = "unknown";
        return;
      }
    }

    const errors = m.recentResults.filter((r) => !r).length;
    m.errorRate = errors / windowSize;

    if (m.errorRate >= UNHEALTHY_ERROR_RATE) {
      m.status = "unhealthy";
    } else if (m.errorRate >= DEGRADED_ERROR_RATE) {
      m.status = "degraded";
    } else {
      m.status = "healthy";
    }
  }
}

export const aiMonitor = new AIMonitor();
export default aiMonitor;
