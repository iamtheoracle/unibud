import type { IModule, IModuleRegistry } from '../types/index';

export class ModuleRegistry implements IModuleRegistry {
  private modules = new Map<string, IModule>();

  register(module: IModule): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module already registered: ${module.name}`);
    }
    this.modules.set(module.name, module);
  }

  get(name: string): IModule | undefined {
    return this.modules.get(name);
  }

  getAll(): IModule[] {
    return Array.from(this.modules.values());
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  unregister(name: string): boolean {
    return this.modules.delete(name);
  }
}
