import type { ILogEntry, ILogger, LogLevel } from "../types/index.js";

export class Logger implements ILogger {
  private readonly entries: ILogEntry[] = [];

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }

  public getEntries(): ILogEntry[] {
    return [...this.entries];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    this.entries.push({
      level,
      message,
      context,
      timestamp: new Date(),
    });
  }
}
