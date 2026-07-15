import type { IModule, IModuleRegistry } from '../types/index.ts';

interface ModuleMetadata {
  state: 'registered' | 'initialized' | 'shutdown';
  registeredAt: Date;
}

export function createModuleRegistry(): IModuleRegistry {
  const modules = new Map<string, IModule>();
  const metadata = new Map<string, ModuleMetadata>();

  return {
    async register(module: IModule): Promise<void> {
      if (modules.has(module.name)) {
        throw new Error(`Module already registered: ${module.name}`);
      }

      modules.set(module.name, module);
      metadata.set(module.name, {
        state: 'registered',
        registeredAt: new Date(),
      });
    },

    async unregister(name: string): Promise<void> {
      const module = modules.get(name);
      if (!module) {
        return;
      }

      if (module.shutdown) {
        await module.shutdown();
      }

      modules.delete(name);
      metadata.delete(name);
    },

    get(name: string): IModule | undefined {
      return modules.get(name);
    },

    getAll(): IModule[] {
      return [...modules.values()];
    },

    has(name: string): boolean {
      return modules.has(name);
    },
  };
}
