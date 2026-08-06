/**
 * Oracle Kernel — Health Manager
 *
 * Registers and runs health checks. Domain-agnostic.
 */

import type { IHealthManager, IHealthCheck, HealthStatus } from './types.js';

type CheckFn = () => Promise<IHealthCheck> | IHealthCheck;

export class OracleHealthManager implements IHealthManager {
  private readonly checks: Map<string, CheckFn> = new Map();

  register(name: string, check: CheckFn): void {
    this.checks.set(name, check);
  }

  unregister(name: string): void {
    this.checks.delete(name);
  }

  async check(name: string): Promise<IHealthCheck> {
    const fn = this.checks.get(name);
    if (!fn) {
      return {
        name,
        status: 'unhealthy',
        message: `Health check "${name}" not registered`,
        checkedAt: new Date(),
      };
    }
    try {
      return await fn();
    } catch (err) {
      return {
        name,
        status: 'unhealthy',
        message: err instanceof Error ? err.message : String(err),
        checkedAt: new Date(),
      };
    }
  }

  async checkAll(): Promise<IHealthCheck[]> {
    return Promise.all([...this.checks.keys()].map((name) => this.check(name)));
  }

  async getStatus(): Promise<HealthStatus> {
    const results = await this.checkAll();
    if (results.every((r) => r.status === 'healthy')) return 'healthy';
    if (results.some((r) => r.status === 'unhealthy')) return 'unhealthy';
    return 'degraded';
  }
}
