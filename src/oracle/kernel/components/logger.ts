import type { ILogger, LogLevel } from '../types/index.ts';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

class ConsoleLogger implements ILogger {
  private readonly minLevel: LogLevel;

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return levelOrder[level] >= levelOrder[this.minLevel];
  }

  private log(level: LogLevel, message: string, context?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    writer(payload);
  }

  debug(message: string, context?: unknown): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: unknown): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: unknown): void {
    this.log('error', message, {
      ...((context && typeof context === 'object' ? context : { context }) as Record<string, unknown>),
      error,
    });
  }
}

let globalLogger: ILogger = new ConsoleLogger();

export function createLogger(minLevel: LogLevel = 'info'): ILogger {
  return new ConsoleLogger(minLevel);
}

export function setLogger(logger: ILogger): void {
  globalLogger = logger;
}

export function getLogger(): ILogger {
  return globalLogger;
}
