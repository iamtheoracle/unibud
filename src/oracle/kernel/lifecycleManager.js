export class LifecycleManager {
  constructor() {
    this.initializers = [];
    this.shutdownHandlers = [];
    this.state = "created";
  }

  /** @param {() => Promise<void>|void} initializer */
  onInitialize(initializer) {
    this.initializers.push(initializer);
  }

  /** @param {() => Promise<void>|void} handler */
  onShutdown(handler) {
    this.shutdownHandlers.unshift(handler);
  }

  async initialize() {
    if (this.state === "initialized") {
      return;
    }

    this.state = "initializing";
    for (const initializer of this.initializers) {
      await initializer();
    }
    this.state = "initialized";
  }

  async shutdown() {
    if (this.state === "stopped") {
      return;
    }

    this.state = "stopping";
    for (const handler of this.shutdownHandlers) {
      await handler();
    }
    this.state = "stopped";
  }
}
