import type { HealthStatus, IHealthCheckStatus, IHealthManager, IHealthReport } from "../types/index.js";

export class HealthManager implements IHealthManager {
  private readonly checks = new Map<string, () => Promise<IHealthCheckStatus>>();

  public registerCheck(name: string, check: () => Promise<IHealthCheckStatus>): void {
    this.checks.set(name, check);
  }

  public async runChecks(): Promise<IHealthReport> {
    const checks: Record<string, IHealthCheckStatus> = {};
    let overall: HealthStatus = "healthy";

    for (const [name, check] of this.checks.entries()) {
      const checkStatus = await check();
      checks[name] = checkStatus;
      if (checkStatus.status === "unhealthy") {
        overall = "unhealthy";
      } else if (checkStatus.status === "degraded" && overall === "healthy") {
        overall = "degraded";
      }
    }

    return {
      status: overall,
      checks,
      timestamp: new Date(),
    };
  }
}
