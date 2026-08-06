/**
 * Minimal dependency-injection container.
 *
 * Services are registered as factories and resolved lazily on first
 * use, then cached as singletons for the lifetime of the Spark instance
 * that owns this container. Each `createSpark()` call constructs its
 * own Container, so multiple Spark instances never share state — there
 * is no module-level/global registry anywhere in this file.
 *
 * Canonical tokens live in ./tokens.ts — this file only consumes them.
 */
import type { Token } from "./tokens";
import { tokenLabel } from "./tokens";
import { ServiceNotRegisteredError } from "./errors";

type Factory<T> = (container: Container) => T;

export class Container {
  private factories = new Map<Token, Factory<unknown>>();
  private instances = new Map<Token, unknown>();

  /** Register a lazy factory. Only invoked on first resolve(). */
  register<T>(token: Token, factory: Factory<T>): void {
    this.factories.set(token, factory as Factory<unknown>);
    // Invalidate any cached instance so re-registration is respected.
    this.instances.delete(token);
  }

  /**
   * Register an already-constructed value directly (e.g. a shared
   * Logger or ProviderRegistry instance) without wrapping it in a
   * factory function. Still resolved lazily/cached like any other
   * token — resolve() doesn't distinguish how a token was registered.
   */
  registerValue<T>(token: Token, value: T): void {
    this.register(token, () => value);
  }

  has(token: Token): boolean {
    return this.factories.has(token);
  }

  resolve<T>(token: Token): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }
    const factory = this.factories.get(token);
    if (!factory) {
      throw new ServiceNotRegisteredError(tokenLabel(token));
    }
    const instance = factory(this);
    this.instances.set(token, instance);
    return instance as T;
  }

  /** Tokens that currently have a registered factory. */
  registeredTokens(): Token[] {
    return Array.from(this.factories.keys());
  }

  /** Tokens that have actually been instantiated (lazy resolution check). */
  resolvedTokens(): Token[] {
    return Array.from(this.instances.keys());
  }

  reset(): void {
    this.instances.clear();
  }
}
