export class DependencyInjector {
  constructor() {
    this.registrations = new Map();
    this.singletons = new Map();
    this.resolutionStack = [];
  }

  /**
   * @param {string} token
   * @param {{ useFactory?: (di: DependencyInjector) => unknown; useValue?: unknown; singleton?: boolean }} registration
   */
  register(token, registration) {
    if (this.registrations.has(token)) {
      throw new Error(`Dependency already registered: ${token}`);
    }

    const normalized = registration.useFactory
      ? { type: "factory", value: registration.useFactory, singleton: registration.singleton ?? true }
      : { type: "value", value: registration.useValue, singleton: true };

    this.registrations.set(token, normalized);
  }

  /** @param {string} token */
  resolve(token) {
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    const registration = this.registrations.get(token);
    if (!registration) {
      throw new Error(`Dependency is not registered: ${token}`);
    }

    if (this.resolutionStack.includes(token)) {
      throw new Error(`Circular dependency detected: ${[...this.resolutionStack, token].join(" -> ")}`);
    }

    this.resolutionStack.push(token);
    try {
      const resolved = registration.type === "factory"
        ? registration.value(this)
        : registration.value;

      if (registration.singleton) {
        this.singletons.set(token, resolved);
      }

      return resolved;
    } finally {
      this.resolutionStack.pop();
    }
  }

  /** @param {string} token */
  has(token) {
    return this.registrations.has(token);
  }
}
