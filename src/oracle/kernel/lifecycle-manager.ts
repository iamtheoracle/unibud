import type { IModule, IService, IOracle, LifecycleState } from './types.ts';
import { ErrorBoundary } from './error-boundary.ts';
import { Logger } from './logger.ts';

export class LifecycleManager {
  state: LifecycleState;
  initializedServices: string[];
  initializedModules: string[];
  logger: Logger;
  errorBoundary: ErrorBoundary;

  constructor(options: { logger?: Logger; errorBoundary?: ErrorBoundary } = {}) {
    this.state = 'uninitialized';
    this.initializedServices = [];
    this.initializedModules = [];
    this.logger = options.logger ?? new Logger();
    this.errorBoundary = options.errorBoundary ?? new ErrorBoundary(this.logger);
  }

  getState(): LifecycleState {
    return this.state;
  }

  isReady(): boolean {
    return this.state === 'ready';
  }

  async initializeServices(
    services: IService[],
    order: string[],
    resolveDependencies: (dependencies: string[]) => Promise<unknown[]>,
    config: Record<string, unknown>,
  ): Promise<void> {
    const serviceMap = new Map(services.map((service) => [service.name, service]));

    for (const serviceName of order) {
      const service = serviceMap.get(serviceName);
      if (!service) {
        continue;
      }

      const dependencyNames = service.dependencies ?? [];
      const resolvedDependencies = await resolveDependencies(dependencyNames);
      const dependencyMap = Object.fromEntries(dependencyNames.map((dependency, index) => [dependency, resolvedDependencies[index]]));

      await this.errorBoundary.execute(
        () => service.initialize({ config, dependencies: dependencyMap }),
        { phase: 'service-initialize', service: service.name },
      );

      this.initializedServices.push(service.name);
      this.logger.info('Service initialized', { service: service.name, dependencies: dependencyNames });
    }
  }

  async initializeModules(modules: IModule[], oracle: IOracle): Promise<void> {
    for (const module of modules) {
      await this.errorBoundary.execute(
        () => module.initialize(oracle),
        { phase: 'module-initialize', module: module.name },
      );

      this.initializedModules.push(module.name);
      this.logger.info('Module initialized', { module: module.name });
    }
  }

  async initialize(options: {
    services: IService[];
    serviceOrder: string[];
    modules: IModule[];
    resolveDependencies: (dependencies: string[]) => Promise<unknown[]>;
    config: Record<string, unknown>;
    oracle: IOracle;
  }): Promise<void> {
    if (this.state === 'ready') {
      return;
    }

    this.state = 'initializing';
    await this.initializeServices(options.services, options.serviceOrder, options.resolveDependencies, options.config);
    await this.initializeModules(options.modules, options.oracle);
    this.state = 'ready';
  }

  async shutdown(services: IService[], modules: IModule[]): Promise<void> {
    if (this.state === 'shutdown') {
      return;
    }

    this.state = 'shutting-down';

    const moduleMap = new Map(modules.map((module) => [module.name, module]));
    const serviceMap = new Map(services.map((service) => [service.name, service]));

    for (const moduleName of [...this.initializedModules].reverse()) {
      const module = moduleMap.get(moduleName);
      const shutdownModule = module?.shutdown;
      if (module && shutdownModule) {
        await this.errorBoundary.execute(() => shutdownModule.call(module), { phase: 'module-shutdown', module: module.name });
      }
    }

    for (const serviceName of [...this.initializedServices].reverse()) {
      const service = serviceMap.get(serviceName);
      const shutdownService = service?.shutdown;
      if (service && shutdownService) {
        await this.errorBoundary.execute(() => shutdownService.call(service), { phase: 'service-shutdown', service: service.name });
      }
    }

    this.state = 'shutdown';
  }
}
