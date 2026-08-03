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

class AnalyticsService {
  constructor() {
    this._ready = false;
    this._eventCount = 0;
  }

  async init() {
    this._ready = true;
    logger.info('AnalyticsService initialized');
  }

  /** Track a custom event with optional properties. */
  track(eventName, properties = {}) {
    try {
      base44.analytics.track({ eventName, properties });
    } catch (e) {
      logger.debug('Analytics track failed', { error: e.message });
    }

    this._eventCount++;
    eventBus.publish({
      type: 'analytics.tracked',
      category: 'monitoring',
      payload: { eventName, totalEvents: this._eventCount },
    });
  }

  /** Get total events tracked in this session. */
  get eventCount() { return this._eventCount; }

  get ready() { return this._ready; }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;