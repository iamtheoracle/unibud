/**
 * Oracle Kernel — Error Boundary
 *
 * A centralised error-handling layer that prevents cascading failures
 * by catching, classifying, and routing errors to appropriate handlers.
 *
 * Features:
 *  - Per-type error handlers registered via `register()`.
 *  - A catch-all fallback handler set via `setFallback()`.
 *  - `wrap()` / `wrapSync()` utility methods for decorating async and
 *    synchronous functions with automatic error-boundary protection.
 *  - An in-memory error log (capped at `MAX_ERRORS`) accessible via
 *    `getErrors()` for diagnostics.
 *  - `subscribe()` for reactive error monitoring.
 *
 * Error handler functions receive `(error, context)` and may return
 * any value — the return value is propagated as the result of `handle()`.
 *
 * Usage:
 *   import { errorBoundary } from '@/oracle/kernel/errorBoundary';
 *
 *   errorBoundary.register('NetworkError', (err, ctx) => {
 *     logger.error('Network failure', { err, ctx });
 *     return null; // safe fallback value
 *   });
 *
 *   const result = await errorBoundary.wrap(
 *     () => fetchData(url),
 *     { service: 'auth-service', operation: 'login' }
 *   );
 */

import { logger } from './logger.js';

const log = logger.child('errorBoundary');

/** Maximum number of errors to retain in the in-memory log. */
const MAX_ERRORS = 100;

class ErrorBoundary {
  constructor() {
    /** @type {Map<string, (error: Error, context: *) => *>} */
    this._handlers = new Map();
    /** @type {((error: Error, context: *) => *) | null} */
    this._fallback = null;
    /** @type {Array<{ error: Error, context: *, handledBy: string, timestamp: string }>} */
    this._errorLog = [];
    /** @type {Array<(error: Error, context: *) => void>} */
    this._subscribers = [];
  }

  /**
   * Registers an error handler for a specific error type (constructor name
   * or any arbitrary string key).
   *
   * @param {string}                        type     – e.g. `'TypeError'`, `'NetworkError'`
   * @param {(error: Error, context: *) => *} handler
   * @returns {ErrorBoundary} – fluent interface.
   */
  register(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error('[OracleKernel:ErrorBoundary] Handler must be a function.');
    }
    this._handlers.set(type, handler);
    log.debug('Error handler registered', { type });
    return this;
  }

  /**
   * Removes a previously registered error handler.
   *
   * @param {string} type
   * @returns {boolean}
   */
  unregister(type) {
    return this._handlers.delete(type);
  }

  /**
   * Sets the fallback handler invoked when no type-specific handler
   * matches.  Pass `null` to clear it.
   *
   * @param {((error: Error, context: *) => *) | null} fn
   * @returns {ErrorBoundary} – fluent interface.
   */
  setFallback(fn) {
    if (fn !== null && typeof fn !== 'function') {
      throw new Error('[OracleKernel:ErrorBoundary] Fallback must be a function or null.');
    }
    this._fallback = fn;
    return this;
  }

  /**
   * Routes `error` to the matching handler (by `error.constructor.name`
   * or `error.name`), then to the fallback, then re-throws if neither
   * is available.
   *
   * @param {Error} error
   * @param {*}     [context]  – diagnostic payload attached to the log entry
   * @returns {*}              – handler return value, or `undefined` if fallback
   *                             is a no-return handler.
   */
  handle(error, context = undefined) {
    this._logError(error, context);
    this._notifySubscribers(error, context);

    const typeName = error?.constructor?.name ?? error?.name ?? 'Error';
    const handler  = this._handlers.get(typeName) ?? this._handlers.get(error?.name);

    if (handler) {
      log.debug('Error routed to handler', { type: typeName });
      return handler(error, context);
    }

    if (this._fallback) {
      log.debug('Error routed to fallback handler', { type: typeName });
      return this._fallback(error, context);
    }

    log.error('Unhandled error — re-throwing', { type: typeName, message: error?.message });
    throw error;
  }

  /**
   * Wraps an async function with error-boundary protection. If the
   * function throws, `handle()` is called instead of propagating.
   *
   * @param {() => Promise<*>} fn
   * @param {*}                [context]
   * @returns {Promise<*>}
   */
  async wrap(fn, context = undefined) {
    try {
      return await fn();
    } catch (err) {
      return this.handle(err, context);
    }
  }

  /**
   * Wraps a synchronous function with error-boundary protection.
   *
   * @param {() => *} fn
   * @param {*}       [context]
   * @returns {*}
   */
  wrapSync(fn, context = undefined) {
    try {
      return fn();
    } catch (err) {
      return this.handle(err, context);
    }
  }

  /**
   * Returns a copy of the in-memory error log (newest entry last).
   *
   * @returns {Array<{ error: Error, context: *, timestamp: string }>}
   */
  getErrors() {
    return [...this._errorLog];
  }

  /**
   * Subscribes to every error that passes through this boundary.
   *
   * @param {(error: Error, context: *) => void} fn
   * @returns {() => void} – unsubscribe function.
   */
  subscribe(fn) {
    this._subscribers.push(fn);
    return () => {
      this._subscribers = this._subscribers.filter((s) => s !== fn);
    };
  }

  /** @private */
  _logError(error, context) {
    this._errorLog.push({ error, context, timestamp: new Date().toISOString() });
    if (this._errorLog.length > MAX_ERRORS) {
      this._errorLog.shift();
    }
  }

  /** @private */
  _notifySubscribers(error, context) {
    for (const fn of this._subscribers) {
      try { fn(error, context); } catch { /* swallow subscriber errors */ }
    }
  }

  /** Clears all handlers, the fallback, the error log, and subscribers. */
  clear() {
    this._handlers.clear();
    this._fallback = null;
    this._errorLog = [];
    this._subscribers = [];
    log.debug('Error boundary cleared');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const errorBoundary = new ErrorBoundary();
