import type { ICapability, ICapabilityRegistry } from '../types/index.ts';

function matchesFilter(capability: ICapability, filter?: Partial<ICapability>): boolean {
  if (!filter) {
    return true;
  }

  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined) {
      return true;
    }

    const current = capability[key as keyof ICapability];
    if (Array.isArray(value)) {
      return Array.isArray(current) && value.every((entry) => current.includes(entry));
    }

    return current === value;
  });
}

export function createCapabilityRegistry(): ICapabilityRegistry {
  const capabilities = new Map<string, ICapability>();

  return {
    async register(capability: ICapability): Promise<void> {
      if (capabilities.has(capability.name)) {
        throw new Error(`Capability already registered: ${capability.name}`);
      }

      capabilities.set(capability.name, capability);
    },

    query(filter?: Partial<ICapability>): ICapability[] {
      return [...capabilities.values()].filter((capability) => matchesFilter(capability, filter));
    },

    get(name: string): ICapability | undefined {
      return capabilities.get(name);
    },

    has(name: string): boolean {
      return capabilities.has(name);
    },

    getByProvider(provider: string): ICapability[] {
      return [...capabilities.values()].filter((capability) => capability.provider === provider);
    },
  };
}
