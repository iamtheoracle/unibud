/**
 * Middleware pipeline.
 *
 * Middleware wraps every call made through Spark.call(), so cross-cutting
 * concerns (logging, auth, caching, rate limiting) can be added without
 * touching individual service implementations.
 */
export interface SparkCallContext {
  service: string;
  method: string;
  args: unknown[];
  startedAt: number;
  meta: Record<string, unknown>;
}

export type NextFn<TResult> = () => Promise<TResult>;
export type Middleware = <TResult>(
  ctx: SparkCallContext,
  next: NextFn<TResult>
) => Promise<TResult>;

export class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  clear(): void {
    this.middlewares = [];
  }

  list(): number {
    return this.middlewares.length;
  }

  async run<TResult>(
    ctx: SparkCallContext,
    handler: () => Promise<TResult>
  ): Promise<TResult> {
    const chain = this.middlewares.reduceRight<NextFn<TResult>>(
      (next, mw) => () => mw(ctx, next),
      handler
    );
    return chain();
  }
}

/** Simple built-in logging middleware, opt-in via Spark.use(loggingMiddleware). */
export const loggingMiddleware: Middleware = async (ctx, next) => {
  const result = await next();
  const durationMs = Date.now() - ctx.startedAt;
  // eslint-disable-next-line no-console
  console.log(`[spark] ${ctx.service}.${ctx.method} (${durationMs}ms)`);
  return result;
};
