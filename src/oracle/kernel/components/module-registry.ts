import type { IModule, IModuleRegistry } from "../types/index.js";

export class ModuleRegistry implements IModuleRegistry {
  private readonly modules = new Map<string, IModule>();

  public register(module: IModule): void {
    if (!module.name) {
      throw new Error("Module name is required");
    }
    this.modules.set(module.name, module);
  }

  public get(name: string): IModule | undefined {
    return this.modules.get(name);
  }

  public list(): IModule[] {
    return [...this.modules.values()];
  }

  public has(name: string): boolean {
    return this.modules.has(name);
  }
}
