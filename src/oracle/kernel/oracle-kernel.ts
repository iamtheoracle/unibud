import { ConfigManager } from './components/config-manager';
import { EnvironmentManager } from './components/environment-manager';
import { DependencyInjector } from './components/dependency-injector';
import { ModuleRegistry } from './components/module-registry';
import { CapabilityRegistry } from './components/capability-registry';
import { LifecycleManager } from './components/lifecycle-manager';
import { HealthManager } from './components/health-manager';
import { Logger } from './components/logger';
import { ErrorBoundary } from './components/error-boundary';
import { PluginRegistrar } from './components/plugin-registrar';
import { VersionManager } from './components/version-manager';

import type {
  IOracle,
  IConfigManager,
  IEnvironmentManager,
  IModuleRegistry,
  ICapabilityRegistry,
  IDependencyInjector,
  ILifecycleManager,
  IHealthManager,
  ILogger,
  IErrorBoundary,
  IPluginRegistrar,
  IVersionManager,
  LogLevel,
} from './types/index';

export interface OracleKernelOptions {
  logLevel?: LogLevel;
  kernelVersion?: string;
  env?: Record<string, string | undefined>;
}

export class OracleKernel implements IOracle {
  readonly config: IConfigManager;
  readonly environment: IEnvironmentManager;
  readonly modules: IModuleRegistry;
  readonly capabilities: ICapabilityRegistry;
  readonly dependencies: IDependencyInjector;
  readonly lifecycle: ILifecycleManager;
  readonly health: IHealthManager;
  readonly logger: ILogger;
  readonly errors: IErrorBoundary;
  readonly plugins: IPluginRegistrar;
  readonly version: IVersionManager;

  constructor(options: OracleKernelOptions = {}) {
    this.config = new ConfigManager();
    this.environment = new EnvironmentManager(options.env);
    this.modules = new ModuleRegistry();
    this.capabilities = new CapabilityRegistry();
    this.dependencies = new DependencyInjector();
    this.lifecycle = new LifecycleManager();
    this.health = new HealthManager();
    this.logger = new Logger({}, options.logLevel ?? 'info');
    this.errors = new ErrorBoundary();
    this.version = new VersionManager(options.kernelVersion);
    this.plugins = new PluginRegistrar(this.version, this);

    this.lifecycle.addInitializer(
      'oracle:logger',
      async () => {
        this.logger.info('Oracle Kernel initializing...', {
          version: this.version.getKernelVersion().toString(),
        });
      },
      100,
    );

    this.lifecycle.addShutdownHandler(
      'oracle:logger',
      async () => {
        this.logger.info('Oracle Kernel shutting down...');
      },
      100,
    );
  }

  async initialize(): Promise<void> {
    await this.lifecycle.initialize();
    this.logger.info('Oracle Kernel ready.', {
      version: this.version.getKernelVersion().toString(),
    });
  }

  async shutdown(): Promise<void> {
    await this.lifecycle.shutdown();
  }

  isReady(): boolean {
    return this.lifecycle.isReady();
  }
}
