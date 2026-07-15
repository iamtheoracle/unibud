import type { DependencyToken, IDependencyInjector } from "../types/index.js";

interface Binding<T> {
  singleton: boolean;
  factory: () => T;
  instance?: T;
}

export class DependencyInjector implements IDependencyInjector {
  private readonly bindings = new Map<DependencyToken, Binding<unknown>>();

  public registerValue<T>(token: DependencyToken<T>, value: T): void {
    this.bindings.set(token, {
      singleton: true,
      factory: () => value,
      instance: value,
    });
  }

  public registerFactory<T>(token: DependencyToken<T>, factory: () => T, singleton = true): void {
    this.bindings.set(token, { singleton, factory });
  }

  public resolve<T>(token: DependencyToken<T>): T {
    const binding = this.bindings.get(token);
    if (!binding) {
      throw new Error(`Dependency not registered: ${String(token)}`);
    }
    if (binding.singleton) {
      if (binding.instance === undefined) {
        binding.instance = binding.factory();
      }
      return binding.instance as T;
    }
    return binding.factory() as T;
  }

  public has(token: DependencyToken): boolean {
    return this.bindings.has(token);
  }
}
