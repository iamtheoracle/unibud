/**
 * Oracle Kernel — Resource Registry
 *
 * Tracks resources registered by modules. Domain-agnostic.
 */

import type { IResourceRegistry, IResource } from './types.js';

export class OracleResourceRegistry implements IResourceRegistry {
  private readonly store: Map<string, IResource> = new Map();

  register(resource: Omit<IResource, 'registeredAt'>): void {
    if (this.store.has(resource.id)) {
      throw new Error(`Resource already registered: "${resource.id}"`);
    }
    this.store.set(resource.id, { ...resource, registeredAt: new Date() });
  }

  unregister(id: string): void {
    this.store.delete(id);
  }

  has(id: string): boolean {
    return this.store.has(id);
  }

  get(id: string): IResource | undefined {
    return this.store.get(id);
  }

  listByType(type: string): IResource[] {
    return [...this.store.values()].filter((r) => r.type === type);
  }

  listByProvider(provider: string): IResource[] {
    return [...this.store.values()].filter((r) => r.provider === provider);
  }

  listAll(): IResource[] {
    return [...this.store.values()];
  }
}
