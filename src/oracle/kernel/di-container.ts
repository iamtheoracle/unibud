/**
 * Oracle Kernel — Dependency Injection Container
 */

import type { IDIContainer } from './types.js';

export class DIContainer implements IDIContainer {
  private readonly _registry = new Map<string, unknown>();

  register<T>(token: string, instance: T): void {
    if (this._registry.has(token)) {
      throw new Error(`DIContainer: token "${token}" is already registered`);
    }
    this._registry.set(token, instance);
  }

  resolve<T>(token: string): T {
    if (!this._registry.has(token)) {
      throw new Error(`DIContainer: no registration found for token "${token}"`);
    }
    return this._registry.get(token) as T;
  }

  has(token: string): boolean {
    return this._registry.has(token);
  }

  /** Override an existing registration (for testing / hot-swap). */
  override<T>(token: string, instance: T): void {
    this._registry.set(token, instance);
  }
}
