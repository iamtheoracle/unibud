export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface SparkHealthReport {
  status: HealthStatus;
  initialized: boolean;
  loadedModules: string[];
  registeredProviders: Array<{
    name: string;
    available: boolean;
    isDefault: boolean;
  }>;
  diagnostics: string[];
  warnings: string[];
  uptimeMs: number;
  checkedAt: string;
}

export interface SparkMetrics {
  requestCounts: Record<string, number>;
  executionTimesMs: Record<string, number[]>;
  cacheHits: number;
  cacheMisses: number;
  memorySize: number;
  eventsEmitted: number;
}
