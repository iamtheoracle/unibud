/**
 * Spark's error hierarchy. Internal code should throw these instead of
 * generic `Error` so callers (and Kernel diagnostics) can distinguish
 * failure classes reliably.
 */
export class SparkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when Container.resolve() is called for an unregistered token. */
export class ServiceNotRegisteredError extends SparkError {
  constructor(public readonly tokenLabel: string) {
    super(`No service registered for token "${tokenLabel}".`);
  }
}

/** Thrown when a provider is looked up by name but was never registered. */
export class ProviderNotRegisteredError extends SparkError {
  constructor(public readonly providerName: string) {
    super(`Provider "${providerName}" is not registered.`);
  }
}

/** Thrown when a provider is resolved but cannot currently be used (e.g. no credentials). */
export class ProviderUnavailableError extends SparkError {
  constructor(public readonly providerName: string, reason?: string) {
    super(
      `Provider "${providerName}" is not available${reason ? `: ${reason}` : "."}`
    );
  }
}

/** Thrown by services when given malformed input. */
export class ValidationError extends SparkError {
  constructor(message: string) {
    super(message);
  }
}

/** Thrown when an operation requires Spark to be initialized first. */
export class NotInitializedError extends SparkError {
  constructor() {
    super("Spark has not been initialized. Call initialize() first.");
  }
}

/** Thrown when a plugin name is registered more than once. */
export class PluginAlreadyRegisteredError extends SparkError {
  constructor(public readonly pluginName: string) {
    super(`Plugin "${pluginName}" is already registered.`);
  }
}
