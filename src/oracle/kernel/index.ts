import { bootstrapKernel } from './bootstrap.ts';
import type { BootstrapContext } from './bootstrap.ts';
import type { HealthStatus, ICommand, IEvent, IModule, IOracle, IService, LogLevel, PluginModule } from './types.ts';
import { createVersionInfo } from './version.ts';

export class OracleKernel implements IOracle {
  configManager: BootstrapContext['configManager'];
  dependencyRegistry: BootstrapContext['dependencyRegistry'];
  errorBoundary: BootstrapContext['errorBoundary'];
  healthManager: BootstrapContext['healthManager'];
  lifecycleManager: BootstrapContext['lifecycleManager'];
  logger: BootstrapContext['logger'];
  moduleRegistry: BootstrapContext['moduleRegistry'];
  pluginRegistrar: BootstrapContext['pluginRegistrar'];
  serviceRegistry: BootstrapContext['serviceRegistry'];
  events: IEvent[];

  constructor(context: BootstrapContext = bootstrapKernel()) {
    this.configManager = context.configManager;
    this.dependencyRegistry = context.dependencyRegistry;
    this.errorBoundary = context.errorBoundary;
    this.healthManager = context.healthManager;
    this.lifecycleManager = context.lifecycleManager;
    this.logger = context.logger;
    this.moduleRegistry = context.moduleRegistry;
    this.pluginRegistrar = context.pluginRegistrar;
    this.serviceRegistry = context.serviceRegistry;
    this.events = [];
  }

  static bootstrap(options = {}): OracleKernel {
    return new OracleKernel(bootstrapKernel(options));
  }

  getConfig(key: string): unknown {
    return this.configManager.get(key);
  }

  setConfig(key: string, value: unknown): void {
    this.configManager.set(key, value);
  }

  async registerModule(module: IModule): Promise<void> {
    this.moduleRegistry.register(module);
    this.logger.info('Module registered', { module: module.name, version: module.version });
  }

  async registerService(service: IService): Promise<void> {
    this.serviceRegistry.register(service, {
      dependencies: service.dependencies ?? [],
    });

    this.dependencyRegistry.register(service.name, () => service, {
      dependencies: service.dependencies ?? [],
      singleton: true,
      lazy: false,
      metadata: {
        version: service.version,
      },
    });

    this.logger.info('Service registered', {
      service: service.name,
      version: service.version,
      dependencies: service.dependencies ?? [],
    });
  }

  getService(name: string): IService | undefined {
    return this.serviceRegistry.get(name);
  }

  getModule(name: string): IModule | undefined {
    return this.moduleRegistry.get(name);
  }

  async resolveDependencies(dependencies: string[]): Promise<unknown[]> {
    return this.dependencyRegistry.resolveMany(dependencies);
  }

  async initialize(): Promise<void> {
    const services = this.serviceRegistry.list();
    const modules = this.moduleRegistry.list();
    const serviceOrder = this.dependencyRegistry.getRegistrationOrder(services.map((service) => service.name));

    await this.dependencyRegistry.warmup();
    await this.lifecycleManager.initialize({
      services,
      serviceOrder,
      modules,
      resolveDependencies: (dependencies) => this.resolveDependencies(dependencies),
      config: this.configManager.snapshot(),
      oracle: this,
    });
  }

  async shutdown(): Promise<void> {
    await this.lifecycleManager.shutdown(this.serviceRegistry.list(), this.moduleRegistry.list());
  }

  async getHealth(): Promise<HealthStatus> {
    return this.healthManager.getPlatformHealth(this.serviceRegistry.list(), this.moduleRegistry.list());
  }

  async getServiceHealth(serviceName: string): Promise<HealthStatus> {
    const service = this.getService(serviceName);
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    return this.healthManager.checkService(serviceName, service);
  }

  log(level: LogLevel, message: string, context?: unknown): void {
    this.logger.log(level, message, context);
  }

  handleError(error: Error, context?: unknown): void {
    void this.errorBoundary.capture(error, context);
  }

  async registerPlugin(plugin: PluginModule): Promise<void> {
    this.pluginRegistrar.register(plugin);
  }

  emit(event: IEvent): void {
    this.events.push(event);
    this.logger.debug('Event emitted', {
      eventId: event.id,
      type: event.type,
      source: event.source,
    });
  }

  async execute(command: ICommand): Promise<unknown> {
    const executor = this.getConfig('commandExecutor');
    if (typeof executor === 'function') {
      return executor(command, this);
    }

    this.logger.info('Command acknowledged', {
      commandId: command.id,
      action: command.action,
      source: command.source,
    });

    return {
      accepted: true,
      commandId: command.id,
      action: command.action,
      source: command.source,
      payload: command.payload,
      timestamp: command.timestamp,
    };
  }

  getVersionInfo() {
    return createVersionInfo(this.moduleRegistry.getVersions(), this.serviceRegistry.getVersions());
  }

  getEvents(): IEvent[] {
    return [...this.events];
  }
}

export function createOracleKernel(options = {}): OracleKernel {
  return OracleKernel.bootstrap(options);
}

export * from './bootstrap.ts';
export * from './config-manager.ts';
export * from './dependency-registry.ts';
export * from './environment-loader.ts';
export * from './error-boundary.ts';
export * from './health-manager.ts';
export * from './lifecycle-manager.ts';
export * from './logger.ts';
export * from './module-registry.ts';
export * from './plugin-registrar.ts';
export * from './service-registry.ts';
export * from './types.ts';
export * from './version.ts';
