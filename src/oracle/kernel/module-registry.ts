import type { IModule } from './types.ts';

interface ModuleRecord {
  module: IModule;
  metadata: Record<string, unknown>;
}

export class ModuleRegistry {
  modules: Map<string, ModuleRecord>;

  constructor() {
    this.modules = new Map();
  }

  register(module: IModule, metadata: Record<string, unknown> = {}): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module already registered: ${module.name}`);
    }

    this.modules.set(module.name, {
      module,
      metadata,
    });
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  get(name: string): IModule | undefined {
    return this.modules.get(name)?.module;
  }

  getMetadata(name: string): Record<string, unknown> | undefined {
    return this.modules.get(name)?.metadata;
  }

  list(): IModule[] {
    return [...this.modules.values()].map((record) => record.module);
  }

  getVersions(): Record<string, string> {
    return this.list().reduce<Record<string, string>>((accumulator, module) => {
      accumulator[module.name] = module.version;
      return accumulator;
    }, {});
  }
}
