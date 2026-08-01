/**
 * Metrics Service — Runtime Metrics Collection
 *
 * Records AI service metrics for observability. Agents and services
 * record metrics here — they never create AIServiceMetric entities directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class MetricsService {
  constructor() {
    this._ready = false;
    this._buffer = []; // batch writes
    this._flushInterval = null;
  }

  async init() {
    this._ready = true;
    // Flush buffer every 10s
    this._flushInterval = setInterval(() => this._flush(), 10000);
    logger.info('MetricsService initialized');
  }

  /** Record a metric. */
  record({ name, value, unit = 'count', tags = {} }) {
    this._buffer.push({
      metric_name: name,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString(),
    });

    eventBus.publish({
      type: 'metrics.recorded',
      category: 'monitoring',
      payload: { name, value, unit },
    });
  }

  /** Flush the buffer to the database. */
  async _flush() {
    if (this._buffer.length === 0) return;
    const batch = this._buffer.splice(0, 50);
    try {
      await base44.entities.AIServiceMetric.bulkCreate(batch);
    } catch (e) {
      logger.debug('Metrics flush failed (non-fatal)', { error: e.message, count: batch.length });
    }
  }

  /** Query metrics. */
  async query({ name, limit = 50 } = {}) {
    try {
      const filter = {};
      if (name) filter.metric_name = name;
      return await base44.entities.AIServiceMetric.filter(filter, '-created_date', limit);
    } catch (e) {
      logger.error('Metrics query failed', { error: e.message });
      return [];
    }
  }

  async shutdown() {
    if (this._flushInterval) clearInterval(this._flushInterval);
    await this._flush();
    logger.info('MetricsService shut down');
  }

  get ready() { return this._ready; }
}

export const metricsService = new MetricsService();
export default metricsService;