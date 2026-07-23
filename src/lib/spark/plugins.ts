import type { Container } from "./container";
import type { Token } from "./tokens";
import type { ProviderRegistry } from "./providers/registry";
import type { MiddlewarePipeline } from "./middleware";
import type { EventBus } from "./events";

export interface SparkPluginContext {
  container: Container;
  providers: ProviderRegistry;
  middleware: MiddlewarePipeline;
  events: EventBus;
}

export interface SparkPlugin {
  name: string;
  version?: string;
  /** Called once at registration time. Register services, providers, etc. here. */
  install(ctx: SparkPluginContext): void;
}

export class PluginManager {
  private installed = new Map<string, SparkPlugin>();

  register(plugin: SparkPlugin, ctx: SparkPluginContext): void {
    if (this.installed.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered.`);
    }
    plugin.install(ctx);
    this.installed.set(plugin.name, plugin);
  }

  list(): Array<{ name: string; version?: string }> {
    return Array.from(this.installed.values()).map((p) => ({
      name: p.name,
      version: p.version,
    }));
  }
}

// Re-export for convenience so plugin authors have one import.
export type { Token };
