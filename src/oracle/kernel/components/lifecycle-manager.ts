import type { ILifecycleManager, LifecycleState } from '../types/index.ts';

export function createLifecycleManager(): ILifecycleManager {
  const initializeCallbacks: Array<() => Promise<void>> = [];
  const shutdownCallbacks: Array<() => Promise<void>> = [];

  let state: LifecycleState = 'uninitialized';

  return {
    async initialize(): Promise<void> {
      if (state === 'ready') {
        return;
      }

      if (state !== 'uninitialized') {
        throw new Error(`Invalid lifecycle transition from ${state} to initializing`);
      }

      state = 'initializing';

      try {
        for (const callback of initializeCallbacks) {
          await callback();
        }
        state = 'ready';
      } catch (error) {
        state = 'uninitialized';
        throw error;
      }
    },

    async shutdown(): Promise<void> {
      if (state === 'shutdown') {
        return;
      }

      if (state !== 'ready' && state !== 'uninitialized') {
        throw new Error(`Invalid lifecycle transition from ${state} to shutting_down`);
      }

      state = 'shutting_down';

      try {
        for (const callback of [...shutdownCallbacks].reverse()) {
          await callback();
        }
      } finally {
        state = 'shutdown';
      }
    },

    getState(): LifecycleState {
      return state;
    },

    isReady(): boolean {
      return state === 'ready';
    },

    onInitialize(callback: () => Promise<void>): void {
      initializeCallbacks.push(callback);
    },

    onShutdown(callback: () => Promise<void>): void {
      shutdownCallbacks.push(callback);
    },
  };
}
