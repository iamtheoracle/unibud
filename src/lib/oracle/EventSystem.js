/**
 * TASK-003: Oracle Event System
 *
 * The Event System enables Oracle-mediated, loosely coupled communication
 * across the UNIBUD platform. No two modules communicate directly — all
 * cross-cutting coordination flows through Oracle events.
 *
 * Design rules:
 *   - Oracle emits events; listeners react to them
 *   - Handlers never throw — errors are caught and reported
 *   - Every event carries a requestId for traceability
 */

// ─── Event Type Constants ─────────────────────────────────────────────────────

export const OracleEvent = Object.freeze({
  // Request lifecycle
  REQUEST_RECEIVED:    "oracle:request:received",
  REQUEST_ROUTED:      "oracle:request:routed",
  REQUEST_COMPLETED:   "oracle:request:completed",
  REQUEST_FAILED:      "oracle:request:failed",

  // Command lifecycle
  COMMAND_PARSED:      "oracle:command:parsed",
  COMMAND_EXECUTED:    "oracle:command:executed",

  // Agent activity
  AGENT_ACTIVATED:     "oracle:agent:activated",
  AGENT_COMPLETED:     "oracle:agent:completed",

  // Service lifecycle
  SERVICE_CALLED:      "oracle:service:called",
  SERVICE_RESPONDED:   "oracle:service:responded",

  // State changes
  STATE_UPDATED:       "oracle:state:updated",

  // Errors
  ERROR:               "oracle:error",
});

// ─── EventBus ─────────────────────────────────────────────────────────────────

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._handlers = new Map();

    /** @type {Array<{type: string, data: unknown, ts: number}>} */
    this._history = [];

    this._maxHistory = 500;
  }

  /**
   * Subscribe to an event type.
   * @param {string} eventType
   * @param {(data: unknown) => void} handler
   * @returns {() => void} unsubscribe function
   */
  on(eventType, handler) {
    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, new Set());
    }
    this._handlers.get(eventType).add(handler);
    return () => this.off(eventType, handler);
  }

  /**
   * Subscribe to an event type exactly once.
   * @param {string} eventType
   * @param {(data: unknown) => void} handler
   */
  once(eventType, handler) {
    const wrapper = (data) => {
      handler(data);
      this.off(eventType, wrapper);
    };
    this.on(eventType, wrapper);
  }

  /**
   * Unsubscribe a handler.
   * @param {string} eventType
   * @param {Function} handler
   */
  off(eventType, handler) {
    this._handlers.get(eventType)?.delete(handler);
  }

  /**
   * Emit an event. All handlers are called synchronously.
   * Errors in handlers are swallowed — they must not block Oracle.
   * @param {string} eventType
   * @param {unknown} data
   */
  emit(eventType, data) {
    const entry = { type: eventType, data, ts: Date.now() };
    this._history.push(entry);
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }

    const handlers = this._handlers.get(eventType);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[Oracle:EventBus] Handler error on "${eventType}":`, err);
      }
    }
  }

  /**
   * Return the last N events (optionally filtered by type).
   * @param {number} [limit=50]
   * @param {string} [filterType]
   * @returns {Array}
   */
  getHistory(limit = 50, filterType) {
    const source = filterType
      ? this._history.filter((e) => e.type === filterType)
      : this._history;
    return source.slice(-limit);
  }

  /** Remove all handlers and clear history. */
  reset() {
    this._handlers.clear();
    this._history = [];
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const oracleEvents = new EventBus();
