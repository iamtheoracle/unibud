/**
 * Oracle Kernel — Error Boundary
 *
 * Provides structured error creation and safe async execution.
 * Domain-agnostic.
 */

import type { IErrorBoundary, IOracleError } from './types.js';
import type { ILogger } from './types.js';

export class OracleErrorBoundary implements IErrorBoundary {
  constructor(private readonly logger: ILogger) {}

  async wrap<T>(fn: () => T | Promise<T>, context?: string): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      const oracle = this.createError(
        'ORACLE_UNHANDLED',
        err instanceof Error ? err.message : 'Unknown error',
        err,
      );
      oracle.module = context;
      this.logger.error(`[ErrorBoundary] ${oracle.message}`, err, { context });
      throw oracle;
    }
  }

  createError(code: string, message: string, cause?: unknown): IOracleError {
    return { code, message, cause };
  }
}
