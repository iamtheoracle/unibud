/**
 * Telemetry Service — Tracing & Spans
 *
 * Provides distributed tracing for runtime operations. Every kernel
 * pipeline creates a trace with spans for observability.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { metricsService } from './MetricsService';

class TelemetryService {
  constructor() { this._ready = false; this._activeSpans = new Map(); }

  async init() {
    this._ready = true;
    logger.info('TelemetryService initialized');
  }

  /** Start a trace span. Returns a span handle. */
  startSpan(name, context = {}) {
    const spanId = `span_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const span = {
      spanId,
      name,
      context,
      startTime: Date.now(),
      endTime: null,
      durationMs: null,
      status: 'active',
    };
    this._activeSpans.set(spanId, span);
    return span;
  }

  /** End a span. */
  endSpan(span, status = 'ok') {
    if (!span) return;
    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    span.status = status;
    this._activeSpans.delete(span.spanId);

    eventBus.publish({
      type: 'telemetry.span',
      category: 'monitoring',
      payload: { name: span.name, durationMs: span.durationMs, status },
    });

    metricsService.record({
      name: `span.${span.name}`,
      value: span.durationMs,
      unit: 'ms',
      tags: { status },
    });

    if (span.durationMs > 5000) {
      logger.warn('Slow span detected', { name: span.name, durationMs: span.durationMs });
    }
  }

  /** Get all active spans. */
  getActiveSpans() {
    return Array.from(this._activeSpans.values());
  }

  get ready() { return this._ready; }
}

export const telemetryService = new TelemetryService();
export default telemetryService;