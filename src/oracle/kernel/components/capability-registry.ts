import type { ICapability, ICapabilityRegistry } from '../types/index';

export class CapabilityRegistry implements ICapabilityRegistry {
  private capabilities = new Map<string, ICapability>();

  register(capability: ICapability): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability already registered: ${capability.id}`);
    }
    this.capabilities.set(capability.id, capability);
  }

  get(id: string): ICapability | undefined {
    return this.capabilities.get(id);
  }

  getAll(): ICapability[] {
    return Array.from(this.capabilities.values());
  }

  has(id: string): boolean {
    return this.capabilities.has(id);
  }

  unregister(id: string): boolean {
    return this.capabilities.delete(id);
  }

  getByProvider(provider: string): ICapability[] {
    return Array.from(this.capabilities.values()).filter(c => c.provider === provider);
  }

  getDependencies(id: string): ICapability[] {
    const cap = this.capabilities.get(id);
    if (!cap || !cap.dependencies) return [];
    return cap.dependencies
      .map(depId => this.capabilities.get(depId))
      .filter((c): c is ICapability => c !== undefined);
  }
}
