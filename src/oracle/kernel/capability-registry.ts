/**
 * Oracle Kernel — Capability Registry
 *
 * Registers capabilities provided by modules. Domain-agnostic.
 */

import type { ICapabilityRegistry, ICapability } from './types.js';

export class OracleCapabilityRegistry implements ICapabilityRegistry {
  private readonly store: Map<string, ICapability> = new Map();

  register(capability: ICapability): void {
    if (this.store.has(capability.name)) {
      throw new Error(`Capability already registered: "${capability.name}"`);
    }
    this.store.set(capability.name, capability);
  }

  unregister(name: string): void {
    this.store.delete(name);
  }

  has(name: string): boolean {
    return this.store.has(name);
  }

  get(name: string): ICapability | undefined {
    return this.store.get(name);
  }

  listByProvider(provider: string): ICapability[] {
    return [...this.store.values()].filter((c) => c.provider === provider);
  }

  listAll(): ICapability[] {
    return [...this.store.values()];
  }
}
