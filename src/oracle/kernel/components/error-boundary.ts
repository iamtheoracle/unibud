import { getLogger } from './logger.ts';
import type { IErrorBoundary, IErrorContext } from '../types/index.ts';

export function createErrorBoundary(): IErrorBoundary {
  const subscribers: Array<(error: Error, context?: IErrorContext) => void> = [];

  return {
    catch(error: Error, context?: IErrorContext): void {
      const safeContext: IErrorContext = {
        ...context,
        timestamp: context?.timestamp ?? new Date(),
      };

      getLogger().error('Oracle Kernel Error', error, safeContext);
      for (const subscriber of subscribers) {
        subscriber(error, safeContext);
      }
    },

    async handle<T>(fn: () => Promise<T>, context?: IErrorContext): Promise<T> {
      try {
        return await fn();
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        this.catch(normalized, context);
        throw normalized;
      }
    },

    onError(callback: (error: Error, context?: IErrorContext) => void): void {
      subscribers.push(callback);
    },
  };
}
