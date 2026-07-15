import type { HealthStatus, IService } from '../types.ts';

export class ExampleService implements IService {
  name = 'example-service';
  version = '1.0.0';
  dependencies = [];
  initialized = false;

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
  }

  async health(): Promise<HealthStatus> {
    return {
      status: this.initialized ? 'healthy' : 'degraded',
      message: this.initialized ? 'Service is running' : 'Service is not initialized',
    };
  }
}
