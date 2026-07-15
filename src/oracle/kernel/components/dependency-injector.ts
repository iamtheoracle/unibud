import type { IDependencyInjector, RegistrationOptions } from '../types/index.ts';

interface Registration {
  dependency: unknown;
  options: Required<RegistrationOptions>;
  initialized: boolean;
  cached?: unknown;
}

function normalizeOptions(options?: RegistrationOptions): Required<RegistrationOptions> {
  return {
    singleton: options?.singleton ?? true,
    factory: options?.factory ?? (() => undefined),
    dependencies: options?.dependencies ?? [],
  };
}

export function createDependencyInjector(): IDependencyInjector {
  const registry = new Map<string, Registration>();
  const resolving = new Set<string>();

  function instantiate(name: string): unknown {
    const registration = registry.get(name);
    if (!registration) {
      throw new Error(`Dependency not found: ${name}`);
    }

    if (registration.options.singleton && registration.initialized) {
      return registration.cached;
    }

    if (resolving.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    resolving.add(name);

    try {
      const dependencies = registration.options.dependencies.map((dependencyName) => instantiate(dependencyName));
      const value = registration.options.factory
        ? registration.options.factory(...dependencies)
        : registration.dependency;

      if (registration.options.singleton) {
        registration.cached = value;
        registration.initialized = true;
      }

      return value;
    } finally {
      resolving.delete(name);
    }
  }

  return {
    register(name: string, dependency: unknown, options?: RegistrationOptions): void {
      const normalized = normalizeOptions(options);
      const registration: Registration = {
        dependency,
        options: {
          ...normalized,
          factory: options?.factory ?? (() => dependency),
        },
        initialized: false,
      };
      registry.set(name, registration);
    },

    resolve<T = unknown>(name: string): T {
      return instantiate(name) as T;
    },

    resolveAll<T = unknown>(names: string[]): T[] {
      return names.map((name) => instantiate(name) as T);
    },

    has(name: string): boolean {
      return registry.has(name);
    },

    clear(): void {
      registry.clear();
      resolving.clear();
    },
  };
}
