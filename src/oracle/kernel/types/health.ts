import type { HealthStatus } from "./module.js";

export interface IHealthSnapshot {
  status: HealthStatus;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
