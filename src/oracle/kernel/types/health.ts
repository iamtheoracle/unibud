export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface IHealthCheck {
  name: string;
  check(): Promise<HealthStatus>;
}

export interface IHealthReport {
  status: HealthStatus;
  timestamp: Date;
  checks: Record<string, HealthStatus>;
  details?: Record<string, unknown>;
}

export interface IHealthManager {
  register(check: IHealthCheck): void;
  check(): Promise<IHealthReport>;
  check(name: string): Promise<HealthStatus>;
  getLastReport(): IHealthReport | undefined;
}
