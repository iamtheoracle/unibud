/**
 * Oracle Kernel — Dependency Injector
 *
 * Simple token-based DI container. Domain-agnostic.
 */

import type { IDependencyInjector } from './types.js';

export class OracleDependencyInjector implements IDependencyInjector {
  private readonly container: Map<string, unknown> = new Map();

  register<T>(token: string, instance: T): void {
    if (this.container.has(token)) {
      throw new Error(`Token already registered: "${token}". Use unregister first.`);
    }
    this.container.set(token, instance);
  }

  resolve<T>(token: string): T {
    if (!this.container.has(token)) {
      throw new Error(`Token not registered: "${token}"`);
    }
    return this.container.get(token) as T;
  }

  has(token: string): boolean {
    return this.container.has(token);
  }

  unregister(token: string): void {
    this.container.delete(token);
  }
}
