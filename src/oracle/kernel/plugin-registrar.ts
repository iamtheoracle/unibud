import { Logger } from './logger.ts';
import { ModuleRegistry } from './module-registry.ts';
import type { PluginModule } from './types.ts';
import { ORACLE_KERNEL_VERSION, isCompatibleVersion } from './version.ts';

export class PluginRegistrar {
  moduleRegistry: ModuleRegistry;
  logger: Logger;
  kernelVersion: string;
  plugins: Map<string, PluginModule>;

  constructor(moduleRegistry: ModuleRegistry, logger = new Logger(), kernelVersion = ORACLE_KERNEL_VERSION) {
    this.moduleRegistry = moduleRegistry;
    this.logger = logger;
    this.kernelVersion = kernelVersion;
    this.plugins = new Map();
  }

  checkCompatibility(plugin: PluginModule): boolean {
    return isCompatibleVersion(plugin.compatibility?.kernel, this.kernelVersion);
  }

  register(plugin: PluginModule): void {
    if (!this.checkCompatibility(plugin)) {
      throw new Error(`Plugin ${plugin.name} is not compatible with Oracle Kernel ${this.kernelVersion}`);
    }

    this.moduleRegistry.register(plugin, {
      plugin: true,
      compatibility: plugin.compatibility?.kernel ?? '*',
    });

    this.plugins.set(plugin.name, plugin);
    this.logger.info('Plugin registered', {
      plugin: plugin.name,
      version: plugin.version,
      compatibility: plugin.compatibility?.kernel ?? '*',
    });
  }

  get(name: string): PluginModule | undefined {
    return this.plugins.get(name);
  }

  list(): PluginModule[] {
    return [...this.plugins.values()];
  }
}
