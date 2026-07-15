import { Logger } from './logger.ts';
import type { ErrorRecord } from './types.ts';

export class ErrorBoundary {
  logger: Logger;
  strategies: Map<string, (error: Error, context?: unknown) => unknown | Promise<unknown>>;
  history: ErrorRecord[];

  constructor(logger = new Logger({ level: 'error' })) {
    this.logger = logger;
    this.strategies = new Map();
    this.history = [];
  }

  registerRecoveryStrategy(name: string, strategy: (error: Error, context?: unknown) => unknown | Promise<unknown>): void {
    this.strategies.set(name, strategy);
  }

  normalize(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }

  async capture(error: unknown, context?: unknown, recoveryKey?: string): Promise<{ error: Error; recovered: boolean; recoveryResult?: unknown }> {
    const normalizedError = this.normalize(error);
    let recovered = false;
    let recoveryResult: unknown;

    if (recoveryKey && this.strategies.has(recoveryKey)) {
      recoveryResult = await this.strategies.get(recoveryKey)?.(normalizedError, context);
      recovered = true;
    }

    this.logger.error('Oracle Kernel error captured', {
      error: normalizedError.message,
      context,
      recoveryKey,
      recovered,
    });

    this.history.push({
      timestamp: new Date(),
      error: normalizedError,
      context,
      recovered,
      recoveryKey,
    });

    return {
      error: normalizedError,
      recovered,
      recoveryResult,
    };
  }

  async execute<T>(operation: () => Promise<T> | T, context?: unknown, recoveryKey?: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await this.capture(error, context, recoveryKey);
      throw this.normalize(error);
    }
  }

  getHistory(): ErrorRecord[] {
    return [...this.history];
  }
}
