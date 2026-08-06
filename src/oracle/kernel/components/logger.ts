import type { ILogger, LogLevel } from '../types/index';

export class Logger implements ILogger {
  private level: LogLevel;
  private context: Record<string, unknown>;
  private static readonly LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(context: Record<string, unknown> = {}, level: LogLevel = 'info') {
    this.context = context;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.LEVELS[level] >= Logger.LEVELS[this.level];
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;
    const merged = { ...this.context, ...context };
    const hasContext = Object.keys(merged).length > 0;
    const prefix = `[Oracle/${level.toUpperCase()}]`;
    const method =
      level === 'debug'
        ? 'debug'
        : level === 'info'
          ? 'info'
          : level === 'warn'
            ? 'warn'
            : 'error';
    if (hasContext) {
      console[method](prefix, message, merged);
    } else {
      console[method](prefix, message);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const ctx = error
      ? { ...context, error: { message: error.message, stack: error.stack } }
      : context;
    this.emit('error', message, ctx);
  }

  child(context: Record<string, unknown>): ILogger {
    return new Logger({ ...this.context, ...context }, this.level);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }
}
