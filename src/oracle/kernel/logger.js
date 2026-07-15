/**
 * Oracle Kernel — Logger
 *
 * Centralised, namespace-aware logging for all Oracle Kernel
 * operations. Every kernel component creates a child logger via
 * `logger.child('component-name')` so log lines are always
 * prefixed and filterable.
 *
 * Log Levels (ascending severity):
 *   DEBUG → INFO → WARN → ERROR → SILENT
 *
 * Features:
 *  - Configurable minimum level (messages below it are suppressed).
 *  - Pluggable custom handlers (e.g. remote log sinks).
 *  - Lightweight — no third-party runtime dependency.
 *  - Child loggers inherit their parent's level and handlers unless
 *    the child overrides them explicitly.
 *
 * Usage:
 *   import { logger } from '@/oracle/kernel/logger';
 *
 *   const log = logger.child('serviceRegistry');
 *   log.info('Service registered', { id: 'auth' });
 *   log.warn('Service already exists — overwriting', { id: 'auth' });
 */

/** Numeric priority for each log level. */
export const LOG_LEVELS = Object.freeze({
  DEBUG:  0,
  INFO:   1,
  WARN:   2,
  ERROR:  3,
  SILENT: 4,
});

/** Map from lowercase string name to numeric priority. */
const LEVEL_MAP = {
  debug:  LOG_LEVELS.DEBUG,
  info:   LOG_LEVELS.INFO,
  warn:   LOG_LEVELS.WARN,
  error:  LOG_LEVELS.ERROR,
  silent: LOG_LEVELS.SILENT,
};

/**
 * Resolves a level string or number to its numeric priority.
 *
 * @param {string|number} level
 * @returns {number}
 */
function resolveLevel(level) {
  if (typeof level === 'number') return level;
  const resolved = LEVEL_MAP[String(level).toLowerCase()];
  if (resolved === undefined) {
    throw new Error(`[OracleKernel:Logger] Unknown log level "${level}".`);
  }
  return resolved;
}

class Logger {
  /**
   * @param {string} namespace  – Human-readable prefix for all messages.
   * @param {Logger|null} [parent] – Optional parent logger.
   */
  constructor(namespace = 'oracle', parent = null) {
    /** @type {string} */
    this._namespace = namespace;
    /** @type {Logger|null} */
    this._parent = parent;
    /** @type {number} */
    this._level = parent ? parent._level : LOG_LEVELS.INFO;
    /** @type {Array<(entry: LogEntry) => void>} */
    this._handlers = parent ? [...parent._handlers] : [];
  }

  /**
   * Sets the minimum log level. Messages below this level are ignored.
   *
   * @param {string|number} level
   * @returns {Logger} – fluent interface.
   */
  setLevel(level) {
    this._level = resolveLevel(level);
    return this;
  }

  /** @returns {number} – Current minimum level (numeric). */
  getLevel() {
    return this._level;
  }

  /**
   * Adds a custom log handler. Handlers are called for every message
   * that passes the minimum-level filter.
   *
   * @param {(entry: { level: string, namespace: string, message: string, data: *, timestamp: Date }) => void} fn
   * @returns {Logger} – fluent interface.
   */
  addHandler(fn) {
    this._handlers.push(fn);
    return this;
  }

  /**
   * Removes a previously added handler.
   *
   * @param {Function} fn
   * @returns {Logger} – fluent interface.
   */
  removeHandler(fn) {
    this._handlers = this._handlers.filter((h) => h !== fn);
    return this;
  }

  /**
   * Emits a log entry at the given level, then calls any registered
   * custom handlers.
   *
   * @param {number} levelValue
   * @param {string} levelName
   * @param {string} message
   * @param {*}      [data]
   */
  _emit(levelValue, levelName, message, data) {
    if (levelValue < this._level) return;

    const prefix = `[${this._namespace}]`;
    const consoleFn = {
      [LOG_LEVELS.DEBUG]: 'debug',
      [LOG_LEVELS.INFO]:  'info',
      [LOG_LEVELS.WARN]:  'warn',
      [LOG_LEVELS.ERROR]: 'error',
    }[levelValue] ?? 'log';

    if (data !== undefined) {
      console[consoleFn](prefix, message, data);
    } else {
      console[consoleFn](prefix, message);
    }

    if (this._handlers.length > 0) {
      const entry = {
        level:     levelName,
        namespace: this._namespace,
        message,
        data,
        timestamp: new Date(),
      };
      for (const handler of this._handlers) {
        try { handler(entry); } catch { /* swallow handler errors */ }
      }
    }
  }

  /** @param {string} message @param {*} [data] */
  debug(message, data) { this._emit(LOG_LEVELS.DEBUG, 'DEBUG', message, data); }

  /** @param {string} message @param {*} [data] */
  info(message, data) { this._emit(LOG_LEVELS.INFO, 'INFO', message, data); }

  /** @param {string} message @param {*} [data] */
  warn(message, data) { this._emit(LOG_LEVELS.WARN, 'WARN', message, data); }

  /** @param {string} message @param {*} [data] */
  error(message, data) { this._emit(LOG_LEVELS.ERROR, 'ERROR', message, data); }

  /**
   * Creates a child logger that inherits the parent's level and
   * handlers but uses its own namespace.
   *
   * @param {string} childNamespace
   * @returns {Logger}
   */
  child(childNamespace) {
    return new Logger(`${this._namespace}:${childNamespace}`, this);
  }

  /**
   * Resets the logger to INFO level with no custom handlers.
   * Primarily useful in tests.
   */
  reset() {
    this._level = LOG_LEVELS.INFO;
    this._handlers = [];
  }
}

/** Root logger for the Oracle Kernel — all child loggers derive from this. */
export const logger = new Logger('oracle:kernel');
