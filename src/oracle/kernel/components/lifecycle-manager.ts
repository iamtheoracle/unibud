import type { ILifecycleManager, LifecycleState } from "../types/index.js";

export class LifecycleManager implements ILifecycleManager {
  private readonly initializers: Array<() => Promise<void>> = [];
  private readonly shutdownHandlers: Array<() => Promise<void>> = [];
  public state: LifecycleState = "created";

  public registerInitializable(initializer: () => Promise<void>): void {
    this.initializers.push(initializer);
  }

  public registerShutdownable(shutdown: () => Promise<void>): void {
    this.shutdownHandlers.unshift(shutdown);
  }

  public async initialize(): Promise<void> {
    if (this.state === "running") {
      return;
    }
    this.state = "initializing";
    for (const initializer of this.initializers) {
      await initializer();
    }
    this.state = "running";
  }

  public async shutdown(): Promise<void> {
    if (this.state === "stopped") {
      return;
    }
    this.state = "shutting_down";
    for (const shutdown of this.shutdownHandlers) {
      await shutdown();
    }
    this.state = "stopped";
  }
}
