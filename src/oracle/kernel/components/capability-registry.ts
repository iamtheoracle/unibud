import type { ICapability, ICapabilityRegistry } from "../types/index.js";

export class CapabilityRegistry implements ICapabilityRegistry {
  private readonly capabilities = new Map<string, ICapability>();

  public register(capability: ICapability): void {
    if (!capability.name) {
      throw new Error("Capability name is required");
    }
    this.capabilities.set(capability.name, capability);
  }

  public get(name: string): ICapability | undefined {
    return this.capabilities.get(name);
  }

  public list(): ICapability[] {
    return [...this.capabilities.values()];
  }

  public has(name: string): boolean {
    return this.capabilities.has(name);
  }
}
