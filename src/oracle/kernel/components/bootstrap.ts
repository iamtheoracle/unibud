import { createCapabilityRegistry } from './capability-registry.ts';
import { createConfigManager } from './config-manager.ts';
import { createDependencyInjector } from './dependency-injector.ts';
import { createEnvironmentManager } from './environment-manager.ts';
import { createErrorBoundary } from './error-boundary.ts';
import { createHealthManager } from './health-manager.ts';
import { createLifecycleManager } from './lifecycle-manager.ts';
import { createLogger, setLogger } from './logger.ts';
import { createModuleRegistry } from './module-registry.ts';
import { createPluginRegistrar } from './plugin-registrar.ts';
import { asMutableVersionManager, createVersionManager } from './version-manager.ts';
import type { IBootstrapped, IOracle } from '../types/index.ts';

function registerComponentVersions(oracle: IOracle): void {
  const mutableVersionManager = asMutableVersionManager(oracle.version);
  if (!mutableVersionManager) {
    return;
  }

  [
    'bootstrap',
    'config-manager',
    'environment-manager',
    'dependency-injector',
    'module-registry',
    'capability-registry',
    'lifecycle-manager',
    'health-manager',
    'logger',
    'error-boundary',
    'plugin-registrar',
    'version-manager',
  ].forEach((component) => mutableVersionManager.registerComponentVersion(component, '1.0.0'));
}

export function createBootstrap(): IBootstrapped {
  const logger = createLogger();
  setLogger(logger);
  const version = createVersionManager();
  const plugins = createPluginRegistrar(version);

  const oracle: IOracle = {
    config: createConfigManager(),
    environment: createEnvironmentManager(),
    modules: createModuleRegistry(),
    capabilities: createCapabilityRegistry(),
    dependencies: createDependencyInjector(),
    lifecycle: createLifecycleManager(),
    health: createHealthManager(),
    logger,
    errors: createErrorBoundary(),
    version,
    plugins,

    async initialize(): Promise<void> {
      await this.lifecycle.initialize();
    },

    async shutdown(): Promise<void> {
      await this.lifecycle.shutdown();
    },

    isReady(): boolean {
      return this.lifecycle.isReady();
    },
  };

  oracle.lifecycle.onInitialize(async () => {
    for (const module of oracle.modules.getAll()) {
      if (module.initialize) {
        await module.initialize(oracle);
      }

      const mutableVersionManager = asMutableVersionManager(oracle.version);
      mutableVersionManager?.registerModuleVersion(module.name, module.version);
    }
  });

  oracle.lifecycle.onShutdown(async () => {
    for (const plugin of oracle.plugins.getPlugins()) {
      if (plugin.shutdown) {
        await plugin.shutdown();
      }
    }

    for (const module of [...oracle.modules.getAll()].reverse()) {
      if (module.shutdown) {
        await module.shutdown();
      }
    }
  });

  registerComponentVersions(oracle);

  return {
    oracle,

    async initialize(): Promise<void> {
      try {
        await oracle.initialize();
      } catch (error) {
        oracle.errors.catch(error instanceof Error ? error : new Error(String(error)), {
          component: 'bootstrap',
          operation: 'initialize',
        });
        throw error;
      }
    },

    async shutdown(): Promise<void> {
      await oracle.shutdown();
    },
  };
}
