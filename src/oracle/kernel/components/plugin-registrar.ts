import type { IPluginRegistrar, IPlugin, IOracle, IVersionManager } from '../types/index';

export class PluginRegistrar implements IPluginRegistrar {
  private plugins = new Map<string, IPlugin>();
  private oracle?: IOracle;
  private versionManager: IVersionManager;

  constructor(versionManager: IVersionManager, oracle?: IOracle) {
    this.versionManager = versionManager;
    this.oracle = oracle;
  }

  isCompatible(plugin: IPlugin): boolean {
    if (!plugin.minOracleVersion) return true;
    return this.versionManager.isCompatible(plugin.minOracleVersion);
  }

  async register(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already registered: ${plugin.id}`);
    }
    if (!this.isCompatible(plugin)) {
      throw new Error(
        `Plugin ${plugin.id} requires Oracle version >= ${plugin.minOracleVersion}`,
      );
    }
    if (plugin.initialize && this.oracle) {
      await plugin.initialize(this.oracle);
    }
    this.plugins.set(plugin.id, plugin);
  }

  async unregister(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    if (plugin.shutdown) {
      await plugin.shutdown();
    }
    return this.plugins.delete(id);
  }

  get(id: string): IPlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }
}
