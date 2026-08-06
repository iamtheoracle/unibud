export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface IHealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  metadata?: Record<string, unknown>;
  checkedAt: Date;
}

export interface IHealthCheck {
  name: string;
  check(): Promise<IHealthCheckResult>;
}

export interface IHealthManager {
  register(check: IHealthCheck): void;
  unregister(name: string): boolean;
  check(name: string): Promise<IHealthCheckResult>;
  checkAll(): Promise<IHealthCheckResult[]>;
  getStatus(): HealthStatus;
}
