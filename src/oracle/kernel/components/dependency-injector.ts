import type { IDependencyInjector } from '../types/index';

type FactoryFn<T> = () => T;

interface Registration<T> {
  factory: FactoryFn<T>;
  singleton: boolean;
  instance?: T;
}

export class DependencyInjector implements IDependencyInjector {
  private registry = new Map<string, Registration<unknown>>();
  private resolving = new Set<string>();

  register<T>(token: string, factory: FactoryFn<T>): void {
    this.registry.set(token, { factory: factory as FactoryFn<unknown>, singleton: false });
  }

  registerSingleton<T>(token: string, factory: FactoryFn<T>): void {
    this.registry.set(token, { factory: factory as FactoryFn<unknown>, singleton: true });
  }

  registerValue<T>(token: string, value: T): void {
    this.registry.set(token, {
      factory: () => value as unknown,
      singleton: true,
      instance: value as unknown,
    });
  }

  resolve<T>(token: string): T {
    const registration = this.registry.get(token);
    if (!registration) {
      throw new Error(`Dependency not registered: ${token}`);
    }
    if (this.resolving.has(token)) {
      throw new Error(`Circular dependency detected: ${token}`);
    }
    if (registration.singleton && registration.instance !== undefined) {
      return registration.instance as T;
    }
    this.resolving.add(token);
    try {
      const instance = registration.factory();
      if (registration.singleton) {
        registration.instance = instance;
      }
      return instance as T;
    } finally {
      this.resolving.delete(token);
    }
  }

  has(token: string): boolean {
    return this.registry.has(token);
  }

  unregister(token: string): boolean {
    return this.registry.delete(token);
  }
}
