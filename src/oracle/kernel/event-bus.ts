/**
 * Oracle Kernel — Event Bus
 *
 * In-process publish/subscribe event bus used to decouple modules.
 */

import type { IEventBus, IPublishedEvent, EventHandler } from './types.js';

export class EventBus implements IEventBus {
  private readonly _listeners = new Map<string, Set<EventHandler>>();

  publish(event: IPublishedEvent): void {
    const handlers = this._listeners.get(event.name);
    if (!handlers) return;
    handlers.forEach((handler) => {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            console.error(`EventBus: unhandled error in handler for "${event.name}"`, err);
          });
        }
      } catch (err) {
        console.error(`EventBus: synchronous error in handler for "${event.name}"`, err);
      }
    });
  }

  subscribe(eventName: string, handler: EventHandler): () => void {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName)!.add(handler);
    return () => this.unsubscribe(eventName, handler);
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    this._listeners.get(eventName)?.delete(handler);
  }
}
