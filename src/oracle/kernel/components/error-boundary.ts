import type { IErrorBoundary } from '../types/index';

type ErrorHandler = (error: Error, context?: Record<string, unknown>) => void;

export class ErrorBoundary implements IErrorBoundary {
  private handlers: ErrorHandler[] = [];

  async wrap<T>(fn: () => T | Promise<T>, context?: Record<string, unknown>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      throw error;
    }
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.handlers.forEach(h => {
      try {
        h(err, context);
      } catch {
        // Prevent handler errors from cascading
      }
    });
  }

  onError(handler: ErrorHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  clearHandlers(): void {
    this.handlers = [];
  }
}
