import type { IPlugin, IPluginRegistrar } from "../types/index.js";

export class PluginRegistrar implements IPluginRegistrar {
  private readonly plugins = new Map<string, IPlugin>();

  public register(plugin: IPlugin): void {
    if (!plugin.name) {
      throw new Error("Plugin name is required");
    }
    this.plugins.set(plugin.name, plugin);
  }

  public list(): IPlugin[] {
    return [...this.plugins.values()];
  }

  public async initializeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.initialize) {
        await plugin.initialize();
      }
    }
  }

  public async shutdownAll(): Promise<void> {
    const plugins = [...this.plugins.values()].reverse();
    for (const plugin of plugins) {
      if (plugin.shutdown) {
        await plugin.shutdown();
      }
    }
  }
}
