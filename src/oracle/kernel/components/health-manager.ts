import type { IHealthCheck, IHealthManager, IHealthReport, HealthStatus } from '../types/index.ts';

function aggregateStatus(statuses: HealthStatus[]): HealthStatus {
  if (statuses.some((status) => status === 'unhealthy')) {
    return 'unhealthy';
  }

  if (statuses.some((status) => status === 'degraded')) {
    return 'degraded';
  }

  return 'healthy';
}

export function createHealthManager(): IHealthManager {
  const checks = new Map<string, IHealthCheck>();
  let lastReport: IHealthReport | undefined;

  async function runCheck(name: string): Promise<HealthStatus>;
  async function runCheck(): Promise<IHealthReport>;
  async function runCheck(name?: string): Promise<IHealthReport | HealthStatus> {
    if (name) {
      const check = checks.get(name);
      if (!check) {
        throw new Error(`Health check not found: ${name}`);
      }
      return check.check();
    }

    const results = await Promise.all(
      [...checks.values()].map(async (check) => {
        const status = await check.check();
        return [check.name, status] as const;
      }),
    );

    const checksResult = Object.fromEntries(results);
    lastReport = {
      status: aggregateStatus(Object.values(checksResult)),
      timestamp: new Date(),
      checks: checksResult,
    };

    return lastReport;
  }

  return {
    register(check: IHealthCheck): void {
      checks.set(check.name, check);
    },
    check: runCheck,

    getLastReport(): IHealthReport | undefined {
      return lastReport;
    },
  };
}
