import type {
  ICapabilityRegistry,
  IConfigManager,
  IDependencyInjector,
  IEnvironmentManager,
  IErrorBoundary,
  IHealthManager,
  ILifecycleManager,
  ILogger,
  IModule,
  IModuleRegistry,
  IOracle,
  IPluginRegistrar,
  IVersionManager,
} from "./types/index.js";

export interface OracleKernelComponents {
  logger: ILogger;
  configManager: IConfigManager;
  environmentManager: IEnvironmentManager;
  dependencyInjector: IDependencyInjector;
  moduleRegistry: IModuleRegistry;
  capabilityRegistry: ICapabilityRegistry;
  lifecycleManager: ILifecycleManager;
  healthManager: IHealthManager;
  errorBoundary: IErrorBoundary;
  pluginRegistrar: IPluginRegistrar;
  versionManager: IVersionManager;
}

export class OracleKernel implements IOracle {
  public readonly logger: ILogger;
  public readonly configManager: IConfigManager;
  public readonly environmentManager: IEnvironmentManager;
  public readonly dependencyInjector: IDependencyInjector;
  public readonly moduleRegistry: IModuleRegistry;
  public readonly capabilityRegistry: ICapabilityRegistry;
  public readonly lifecycleManager: ILifecycleManager;
  public readonly healthManager: IHealthManager;
  public readonly errorBoundary: IErrorBoundary;
  public readonly pluginRegistrar: IPluginRegistrar;
  public readonly versionManager: IVersionManager;

  public constructor(components: OracleKernelComponents) {
    this.logger = components.logger;
    this.configManager = components.configManager;
    this.environmentManager = components.environmentManager;
    this.dependencyInjector = components.dependencyInjector;
    this.moduleRegistry = components.moduleRegistry;
    this.capabilityRegistry = components.capabilityRegistry;
    this.lifecycleManager = components.lifecycleManager;
    this.healthManager = components.healthManager;
    this.errorBoundary = components.errorBoundary;
    this.pluginRegistrar = components.pluginRegistrar;
    this.versionManager = components.versionManager;
  }

  public registerModule(module: IModule): void {
    this.moduleRegistry.register(module);
    this.versionManager.registerModuleVersion(module.name, module.version);

    if (module.initialize) {
      this.lifecycleManager.registerInitializable(() => module.initialize!(this));
    }
    if (module.shutdown) {
      this.lifecycleManager.registerShutdownable(() => module.shutdown!());
    }
  }

  public async initialize(): Promise<void> {
    await this.errorBoundary.execute(async () => {
      await this.pluginRegistrar.initializeAll();
      await this.lifecycleManager.initialize();
      this.logger.info("Oracle kernel initialized");
    });
  }

  public async shutdown(): Promise<void> {
    await this.errorBoundary.execute(async () => {
      await this.lifecycleManager.shutdown();
      await this.pluginRegistrar.shutdownAll();
      this.logger.info("Oracle kernel stopped");
    });
  }
}
