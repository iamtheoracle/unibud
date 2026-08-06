/**
 * Platform Services — Analytics Service Interface
 *
 * The Analytics Service captures product events, aggregates metrics,
 * and provides data to the Analytics Center and all platform products.
 *
 * All events are anonymised at collection time unless the student
 * has granted explicit analytics consent.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: string;
}

export interface AnalyticsService {
  /** Track a product event */
  track(event: AnalyticsEvent): void;

  /** Record a numeric metric */
  metric(metric: AnalyticsMetric): void;

  /** Flush buffered events (useful before page unload) */
  flush(): Promise<void>;
}
