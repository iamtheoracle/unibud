import type { AIProvider } from "./types";
import { MockProvider } from "./mock";

/**
 * Holds all registered AI providers and resolves which one to use.
 * Services depend on this registry (or on a single resolved AIProvider),
 * never on a concrete vendor class.
 */
export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  private defaultName: string;

  constructor() {
    const mock = new MockProvider();
    this.providers.set(mock.name, mock);
    this.defaultName = mock.name;
  }

  register(provider: AIProvider, makeDefault = false): void {
    this.providers.set(provider.name, provider);
    if (makeDefault) {
      this.defaultName = provider.name;
    }
  }

  setDefault(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Cannot set default: provider "${name}" is not registered.`);
    }
    this.defaultName = name;
  }

  get(name?: string): AIProvider {
    const key = name ?? this.defaultName;
    const provider = this.providers.get(key);
    if (!provider) {
      throw new Error(`Provider "${key}" is not registered.`);
    }
    return provider;
  }

  /** Returns the default provider if available, else falls back to mock. */
  resolve(): AIProvider {
    const preferred = this.providers.get(this.defaultName);
    if (preferred && preferred.isAvailable()) {
      return preferred;
    }
    return this.providers.get("mock")!;
  }

  list(): Array<{ name: string; available: boolean; isDefault: boolean }> {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      available: p.isAvailable(),
      isDefault: p.name === this.defaultName,
    }));
  }
}
