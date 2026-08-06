/**
 * Oracle Kernel — Lifecycle Manager
 *
 * Controls Oracle startup and shutdown phases. Domain-agnostic.
 */

import type { ILifecycleManager, LifecycleStatus } from './types.js';

export class OracleLifecycleManager implements ILifecycleManager {
  private status: LifecycleStatus = 'uninitialized';
  private readonly startHandlers: Array<() => Promise<void> | void> = [];
  private readonly stopHandlers: Array<() => Promise<void> | void> = [];

  getStatus(): LifecycleStatus {
    return this.status;
  }

  onStart(handler: () => Promise<void> | void): void {
    this.startHandlers.push(handler);
  }

  onStop(handler: () => Promise<void> | void): void {
    this.stopHandlers.push(handler);
  }

  async start(): Promise<void> {
    if (this.status === 'running') return;
    this.status = 'initializing';
    for (const handler of this.startHandlers) {
      await handler();
    }
    this.status = 'running';
  }

  async stop(): Promise<void> {
    if (this.status === 'stopped') return;
    this.status = 'shutting_down';
    for (const handler of [...this.stopHandlers].reverse()) {
      await handler();
    }
    this.status = 'stopped';
  }
}
