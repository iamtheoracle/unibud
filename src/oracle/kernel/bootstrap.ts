import { ConfigManager } from './config-manager.ts';
import { DependencyRegistry } from './dependency-registry.ts';
import { EnvironmentLoader } from './environment-loader.ts';
import { ErrorBoundary } from './error-boundary.ts';
import { HealthManager } from './health-manager.ts';
import { LifecycleManager } from './lifecycle-manager.ts';
import { Logger } from './logger.ts';
import { ModuleRegistry } from './module-registry.ts';
import { PluginRegistrar } from './plugin-registrar.ts';
import { ServiceRegistry } from './service-registry.ts';
import type { BootstrapOptions } from './types.ts';

export interface BootstrapContext {
  configManager: ConfigManager;
  dependencyRegistry: DependencyRegistry;
  environmentLoader: EnvironmentLoader;
  errorBoundary: ErrorBoundary;
  healthManager: HealthManager;
  lifecycleManager: LifecycleManager;
  logger: Logger;
  moduleRegistry: ModuleRegistry;
  pluginRegistrar: PluginRegistrar;
  serviceRegistry: ServiceRegistry;
}

export function bootstrapKernel(options: BootstrapOptions = {}): BootstrapContext {
  const environmentLoader = new EnvironmentLoader();
  const logger = new Logger({ level: options.logLevel ?? 'info' });
  const errorBoundary = new ErrorBoundary(logger);
  const configManager = new ConfigManager(environmentLoader);
  const dependencyRegistry = new DependencyRegistry();
  const moduleRegistry = new ModuleRegistry();
  const serviceRegistry = new ServiceRegistry();
  const healthManager = new HealthManager();
  const lifecycleManager = new LifecycleManager({ logger, errorBoundary });
  const pluginRegistrar = new PluginRegistrar(moduleRegistry, logger);

  configManager.initialize(options);
  logger.info('Oracle Kernel bootstrapped', {
    managers: [
      'environment-loader',
      'config-manager',
      'logger',
      'dependency-registry',
      'module-registry',
      'service-registry',
      'lifecycle-manager',
      'health-manager',
      'error-boundary',
      'plugin-registrar',
    ],
  });

  return {
    configManager,
    dependencyRegistry,
    environmentLoader,
    errorBoundary,
    healthManager,
    lifecycleManager,
    logger,
    moduleRegistry,
    pluginRegistrar,
    serviceRegistry,
  };
}
