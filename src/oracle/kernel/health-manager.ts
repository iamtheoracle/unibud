import type { HealthStatus, IModule, IService } from './types.ts';

interface HealthHistoryEntry {
  timestamp: Date;
  target: string;
  status: HealthStatus;
}

function withTimestamp(status: HealthStatus): HealthStatus {
  return {
    ...status,
    timestamp: status.timestamp ?? new Date(),
  };
}

function defaultHealthy(message: string): HealthStatus {
  return withTimestamp({
    status: 'healthy',
    message,
  });
}

export class HealthManager {
  current: Map<string, HealthStatus>;
  history: HealthHistoryEntry[];

  constructor() {
    this.current = new Map();
    this.history = [];
  }

  record(target: string, status: HealthStatus): HealthStatus {
    const withRecordedTimestamp = withTimestamp(status);
    this.current.set(target, withRecordedTimestamp);
    this.history.push({
      target,
      status: withRecordedTimestamp,
      timestamp: withRecordedTimestamp.timestamp as Date,
    });
    return withRecordedTimestamp;
  }

  async checkService(serviceName: string, service: IService): Promise<HealthStatus> {
    const status = service.health ? await service.health() : defaultHealthy(`Service ${serviceName} does not expose a health check`);
    return this.record(`service:${serviceName}`, status);
  }

  async checkModule(moduleName: string, module: IModule): Promise<HealthStatus> {
    const status = module.health ? await module.health() : defaultHealthy(`Module ${moduleName} does not expose a health check`);
    return this.record(`module:${moduleName}`, status);
  }

  async getPlatformHealth(services: IService[], modules: IModule[]): Promise<HealthStatus> {
    const serviceStatuses = await Promise.all(services.map((service) => this.checkService(service.name, service)));
    const moduleStatuses = await Promise.all(modules.map((module) => this.checkModule(module.name, module)));
    const allStatuses = [...serviceStatuses, ...moduleStatuses];

    const aggregateStatus = allStatuses.some((status) => status.status === 'unhealthy')
      ? 'unhealthy'
      : allStatuses.some((status) => status.status === 'degraded')
        ? 'degraded'
        : 'healthy';

    return this.record('platform', {
      status: aggregateStatus,
      details: {
        services: Object.fromEntries(services.map((service, index) => [service.name, serviceStatuses[index]])),
        modules: Object.fromEntries(modules.map((module, index) => [module.name, moduleStatuses[index]])),
      },
    });
  }

  getHistory(target?: string): HealthHistoryEntry[] {
    if (!target) {
      return [...this.history];
    }

    return this.history.filter((entry) => entry.target === target);
  }
}
