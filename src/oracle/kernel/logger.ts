import type { LogEntry, LogLevel } from './types.ts';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  level: LogLevel;
  sink: Console | Record<string, (...args: unknown[]) => void>;
  entries: LogEntry[];

  constructor(options: { level?: LogLevel; sink?: Console | Record<string, (...args: unknown[]) => void> } = {}) {
    this.level = options.level ?? 'info';
    this.sink = options.sink ?? console;
    this.entries = [];
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  log(level: LogLevel, message: string, context?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
    };

    this.entries.push(entry);

    if (this.shouldLog(level)) {
      const writer = this.sink[level] ?? this.sink.log;
      writer?.call(this.sink, entry);
    }

    return entry;
  }

  debug(message: string, context?: unknown): LogEntry {
    return this.log('debug', message, context);
  }

  info(message: string, context?: unknown): LogEntry {
    return this.log('info', message, context);
  }

  warn(message: string, context?: unknown): LogEntry {
    return this.log('warn', message, context);
  }

  error(message: string, context?: unknown): LogEntry {
    return this.log('error', message, context);
  }

  getEntries(level?: LogLevel): LogEntry[] {
    if (!level) {
      return [...this.entries];
    }

    return this.entries.filter((entry) => entry.level === level);
  }

  clear(): void {
    this.entries = [];
  }
}
