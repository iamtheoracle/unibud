import type { HealthStatus, IModule, IOracle } from '../types.ts';

export class ExampleModule implements IModule {
  name = 'example-module';
  version = '1.0.0';
  description = 'Example infrastructure module registration';
  initialized = false;

  async initialize(oracle: IOracle): Promise<void> {
    this.initialized = true;
    oracle.log('info', 'Example module initialized', { module: this.name });
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
  }

  async health(): Promise<HealthStatus> {
    return {
      status: this.initialized ? 'healthy' : 'degraded',
      message: this.initialized ? 'Module is running' : 'Module is not initialized',
    };
  }
}
