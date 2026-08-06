/**
 * Oracle Kernel — Logger
 *
 * Lightweight structured logger. Domain-agnostic.
 */

import type { ILogger, LogLevel } from './types.js';

export class OracleLogger implements ILogger {
  private readonly context: string;
  private readonly level: LogLevel;

  constructor(context = 'Oracle', level: LogLevel = 'info') {
    this.context = context;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    return meta && Object.keys(meta).length > 0
      ? `${base} ${JSON.stringify(meta)}`
      : base;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.format('debug', message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    console.info(this.format('info', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    const errorMeta: Record<string, unknown> = { ...meta };
    if (error instanceof Error) {
      errorMeta.error = error.message;
      errorMeta.stack = error.stack;
    } else if (error !== undefined) {
      errorMeta.error = String(error);
    }
    console.error(this.format('error', message, errorMeta));
  }

  child(context: string): ILogger {
    return new OracleLogger(`${this.context}:${context}`, this.level);
  }
}
