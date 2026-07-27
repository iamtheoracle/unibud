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

  /**
   * Returns the default provider if available, else falls back to mock.
   * The returned provider is wrapped so that a runtime failure during
   * `complete()`/`embed()` transparently degrades to the MockProvider —
   * callers never see a provider crash.
   */
  resolve(): AIProvider {
    const preferred = this.providers.get(this.defaultName);
    const mock = this.providers.get("mock")!;
    if (preferred && preferred.isAvailable() && preferred.name !== "mock") {
      return withRuntimeFallback(preferred, mock);
    }
    return mock;
  }

  list(): Array<{ name: string; available: boolean; isDefault: boolean }> {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      available: p.isAvailable(),
      isDefault: p.name === this.defaultName,
    }));
  }
}

/**
 * Wraps a primary AIProvider so that a runtime failure in `complete`
 * (or `embed`) transparently degrades to the MockProvider. This keeps
 * Spark responsive even when the real provider is misconfigured or the
 * network is down — no service ever has to catch provider errors.
 */
function withRuntimeFallback(primary: AIProvider, mock: AIProvider): AIProvider {
  return {
    name: primary.name,
    isAvailable: () => primary.isAvailable(),
    async complete(req) {
      try {
        return await primary.complete(req);
      } catch {
        return mock.complete(req);
      }
    },
    async embed(text) {
      if (primary.embed) {
        try {
          return await primary.embed(text);
        } catch {
          // fall through to mock below
        }
      }
      // mock always implements embed
      return mock.embed!(text);
    },
  };
}