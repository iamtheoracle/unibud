/**
 * Versioned Event Bus — Runtime Connectivity Layer
 *
 * All major runtime interactions publish events. Events are versioned,
 * carry a correlationId for tracing, and support wildcard subscriptions.
 *
 * Event categories: request, response, lifecycle, workflow, capability,
 * audit, security, monitoring.
 */

import { logger } from './logger';

class EventBus {
  constructor() {
    this._subscribers = new Map();
    this._history = [];
    this._maxHistory = 200;
  }

  /** Subscribe to an event type. Use '*' for all events. Returns unsubscribe fn. */
  on(eventType, handler) {
    if (!this._subscribers.has(eventType)) this._subscribers.set(eventType, new Set());
    this._subscribers.get(eventType).add(handler);
    return () => this._subscribers.get(eventType)?.delete(handler);
  }

  /** Publish a versioned event. Returns the enriched event. */
  publish(event) {
    const enriched = {
      id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      type: event.type,
      version: event.version || 1,
      category: event.category || 'lifecycle',
      payload: event.payload || {},
      timestamp: event.timestamp || new Date().toISOString(),
      correlationId: event.correlationId || null,
    };

    this._history.push(enriched);
    if (this._history.length > this._maxHistory) this._history.shift();

    const notify = (handlers) => {
      if (!handlers) return;
      for (const h of handlers) {
        try { h(enriched); } catch (e) { logger.error('Event subscriber error', { event: enriched.type, error: e.message }); }
      }
    };
    notify(this._subscribers.get(event.type));
    notify(this._subscribers.get('*'));

    return enriched;
  }

  /** Retrieve recent events, optionally filtered by type. */
  recent(eventType, limit = 20) {
    return this._history
      .filter((e) => !eventType || e.type === eventType)
      .slice(-limit);
  }

  /** Clear all subscribers (used during graceful shutdown). */
  shutdown() {
    this._subscribers.clear();
    this._history = [];
    logger.info('Event bus shut down');
  }
}

export const eventBus = new EventBus();
export default eventBus;