/**
 * Lightweight internal event bus.
 *
 * Modules publish events instead of calling each other directly, which
 * keeps them decoupled. External consumers (e.g. Oracle) can subscribe
 * without Spark needing to know they exist.
 *
 * Example event names: "memory.updated", "search.completed",
 * "recommendation.generated", "translation.finished".
 */
export type SparkEventName = string;
export type SparkEventHandler<TPayload = unknown> = (
  payload: TPayload
) => void;

export interface SparkEventLogEntry {
  name: SparkEventName;
  payload: unknown;
  timestamp: string;
}

export class EventBus {
  private handlers = new Map<SparkEventName, Set<SparkEventHandler>>();
  private log: SparkEventLogEntry[] = [];
  private readonly maxLog = 200;

  on<TPayload = unknown>(
    name: SparkEventName,
    handler: SparkEventHandler<TPayload>
  ): () => void {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }
    this.handlers.get(name)!.add(handler as SparkEventHandler);
    return () => this.off(name, handler);
  }

  off<TPayload = unknown>(
    name: SparkEventName,
    handler: SparkEventHandler<TPayload>
  ): void {
    this.handlers.get(name)?.delete(handler as SparkEventHandler);
  }

  emit<TPayload = unknown>(name: SparkEventName, payload?: TPayload): void {
    this.log.push({
      name,
      payload,
      timestamp: new Date().toISOString(),
    });
    if (this.log.length > this.maxLog) {
      this.log.shift();
    }
    this.handlers.get(name)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        // Event handlers must never break the emitting module.
        // eslint-disable-next-line no-console
        console.error(`[spark:events] handler for "${name}" threw`, err);
      }
    });
  }

  recentEvents(limit = 50): SparkEventLogEntry[] {
    return this.log.slice(-limit);
  }

  clear(): void {
    this.handlers.clear();
    this.log = [];
  }
}
