import type { IHealthManager, IHealthCheck, IHealthCheckResult, HealthStatus } from '../types/index';

export class HealthManager implements IHealthManager {
  private checks = new Map<string, IHealthCheck>();

  register(check: IHealthCheck): void {
    this.checks.set(check.name, check);
  }

  unregister(name: string): boolean {
    return this.checks.delete(name);
  }

  async check(name: string): Promise<IHealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      return {
        name,
        status: 'unknown',
        message: `Health check not found: ${name}`,
        checkedAt: new Date(),
      };
    }
    try {
      return await check.check();
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date(),
      };
    }
  }

  async checkAll(): Promise<IHealthCheckResult[]> {
    return Promise.all(Array.from(this.checks.values()).map(c => this.check(c.name)));
  }

  getStatus(): HealthStatus {
    return this.checks.size === 0 ? 'unknown' : 'healthy';
  }
}
