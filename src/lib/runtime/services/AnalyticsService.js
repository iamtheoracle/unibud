/**
 * Analytics Service — Event Tracking & Insights
 *
 * Wraps base44.analytics.track with event bus publishing and metrics
 * forwarding. Agents and experiences use this service — they never call
 * base44.analytics directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { BaseService } from './BaseService';

class AnalyticsService extends BaseService {
  constructor() {
    super({
      id: 'analytics',
      version: '1.0.0',
      dependencies: [],
      capabilities: ['track_event'],
    });
    this._eventCount = 0;
  }

  async _onInit() {
    logger.info('AnalyticsService initialized');
  }

  async _onHealth() {
    const available = typeof base44.analytics?.track === 'function';
    return { healthy: available, detail: available ? `${this._eventCount} events tracked` : 'Analytics SDK missing' };
  }

  /** Track a custom event with optional properties. */
  track(eventName, properties = {}) {
    try {
      base44.analytics.track({ eventName, properties });
    } catch (e) {
      logger.debug('Analytics track failed', { error: e.message });
    }

    this._eventCount++;
    this._recordRequest(0);
    eventBus.publish({
      type: 'analytics.tracked',
      category: 'monitoring',
      payload: { eventName, totalEvents: this._eventCount },
    });
  }

  get eventCount() { return this._eventCount; }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;