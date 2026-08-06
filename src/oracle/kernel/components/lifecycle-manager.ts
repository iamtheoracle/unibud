import type { ILifecycleManager, LifecycleState } from '../types/index';

interface Handler {
  name: string;
  fn: () => Promise<void>;
  priority: number;
}

export class LifecycleManager implements ILifecycleManager {
  private state: LifecycleState = 'uninitialized';
  private stateChangeHandlers: ((state: LifecycleState) => void)[] = [];
  private initializers: Handler[] = [];
  private shutdownHandlers: Handler[] = [];

  getState(): LifecycleState {
    return this.state;
  }

  onStateChange(handler: (state: LifecycleState) => void): () => void {
    this.stateChangeHandlers.push(handler);
    return () => {
      this.stateChangeHandlers = this.stateChangeHandlers.filter(h => h !== handler);
    };
  }

  transitionTo(state: LifecycleState): void {
    this.state = state;
    this.stateChangeHandlers.forEach(h => h(state));
  }

  isReady(): boolean {
    return this.state === 'ready';
  }

  addInitializer(name: string, fn: () => Promise<void>, priority = 0): void {
    this.initializers.push({ name, fn, priority });
    this.initializers.sort((a, b) => b.priority - a.priority);
  }

  addShutdownHandler(name: string, fn: () => Promise<void>, priority = 0): void {
    this.shutdownHandlers.push({ name, fn, priority });
    this.shutdownHandlers.sort((a, b) => b.priority - a.priority);
  }

  async initialize(): Promise<void> {
    if (this.state !== 'uninitialized') {
      throw new Error(`Cannot initialize from state: ${this.state}`);
    }
    this.transitionTo('initializing');
    try {
      for (const { fn } of this.initializers) {
        await fn();
      }
      this.transitionTo('ready');
    } catch (error) {
      this.transitionTo('error');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.state !== 'ready') {
      throw new Error(`Cannot shutdown from state: ${this.state}`);
    }
    this.transitionTo('shutting-down');
    try {
      for (const { fn } of this.shutdownHandlers) {
        await fn();
      }
      this.transitionTo('shutdown');
    } catch (error) {
      this.transitionTo('error');
      throw error;
    }
  }
}
