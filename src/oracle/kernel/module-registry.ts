/**
 * Oracle Kernel — Module Registry
 *
 * Manages module registration and lifecycle. Domain-agnostic.
 */

import type { IModuleRegistry, IModule, IOracle } from './types.js';

export class OracleModuleRegistry implements IModuleRegistry {
  private readonly modules: Map<string, IModule> = new Map();

  async register(module: IModule): Promise<void> {
    if (this.modules.has(module.name)) {
      throw new Error(`Module already registered: "${module.name}"`);
    }
    this.modules.set(module.name, module);
  }

  async unregister(name: string): Promise<void> {
    this.modules.delete(name);
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  get(name: string): IModule | undefined {
    return this.modules.get(name);
  }

  listAll(): IModule[] {
    return [...this.modules.values()];
  }

  async initializeAll(oracle: IOracle): Promise<void> {
    for (const module of this.modules.values()) {
      await module.initialize(oracle);
    }
  }

  async shutdownAll(): Promise<void> {
    for (const module of [...this.modules.values()].reverse()) {
      await module.shutdown();
    }
  }
}
