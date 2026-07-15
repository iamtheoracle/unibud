const LEVEL_ORDER = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * @typedef {'debug'|'info'|'warn'|'error'} LogLevel
 */

export class Logger {
  /**
   * @param {{ level?: LogLevel; sink?: (entry: Record<string, unknown>) => void }} [options]
   */
  constructor(options = {}) {
    this.level = options.level ?? "info";
    this.sink = options.sink ?? ((entry) => console.log(JSON.stringify(entry)));
  }

  /** @param {LogLevel} level @param {string} message @param {Record<string, unknown>} [metadata] */
  log(level, message, metadata = {}) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) {
      return;
    }

    this.sink({
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    });
  }

  /** @param {string} message @param {Record<string, unknown>} [metadata] */
  debug(message, metadata) {
    this.log("debug", message, metadata);
  }

  /** @param {string} message @param {Record<string, unknown>} [metadata] */
  info(message, metadata) {
    this.log("info", message, metadata);
  }

  /** @param {string} message @param {Record<string, unknown>} [metadata] */
  warn(message, metadata) {
    this.log("warn", message, metadata);
  }

  /** @param {string} message @param {Record<string, unknown>} [metadata] */
  error(message, metadata) {
    this.log("error", message, metadata);
  }
}
