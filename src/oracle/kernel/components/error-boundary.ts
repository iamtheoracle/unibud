import type { IErrorBoundary, ILogger } from "../types/index.js";

export class ErrorBoundary implements IErrorBoundary {
  public constructor(private readonly logger: ILogger) {}

  public async execute<T>(operation: () => Promise<T>, context?: Record<string, unknown>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const detail = error instanceof Error ? { name: error.name, message: error.message } : { error };
      this.logger.error("Oracle kernel operation failed", { ...context, ...detail });
      throw error;
    }
  }
}
