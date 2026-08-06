import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LifecycleManager } from '../components/lifecycle-manager';

describe('LifecycleManager', () => {
  let lm: LifecycleManager;

  beforeEach(() => {
    lm = new LifecycleManager();
  });

  describe('initial state', () => {
    it('starts in uninitialized state', () => {
      expect(lm.getState()).toBe('uninitialized');
    });

    it('isReady returns false initially', () => {
      expect(lm.isReady()).toBe(false);
    });
  });

  describe('transitionTo', () => {
    it('changes state', () => {
      lm.transitionTo('initializing');
      expect(lm.getState()).toBe('initializing');
    });

    it('calls registered state change handlers', () => {
      const handler = vi.fn();
      lm.onStateChange(handler);
      lm.transitionTo('ready');
      expect(handler).toHaveBeenCalledWith('ready');
    });

    it('handler unsubscription works', () => {
      const handler = vi.fn();
      const unsubscribe = lm.onStateChange(handler);
      unsubscribe();
      lm.transitionTo('ready');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('transitions through initializing → ready', async () => {
      const states: string[] = [];
      lm.onStateChange(s => states.push(s));
      await lm.initialize();
      expect(states).toContain('initializing');
      expect(states).toContain('ready');
      expect(lm.isReady()).toBe(true);
    });

    it('runs initializers in priority order (highest first)', async () => {
      const order: number[] = [];
      lm.addInitializer('low', async () => { order.push(1); }, 1);
      lm.addInitializer('high', async () => { order.push(100); }, 100);
      lm.addInitializer('mid', async () => { order.push(50); }, 50);
      await lm.initialize();
      expect(order).toEqual([100, 50, 1]);
    });

    it('throws if already initialized', async () => {
      await lm.initialize();
      await expect(lm.initialize()).rejects.toThrow('Cannot initialize from state: ready');
    });

    it('transitions to error state if initializer throws', async () => {
      lm.addInitializer('failing', async () => { throw new Error('init fail'); });
      await expect(lm.initialize()).rejects.toThrow('init fail');
      expect(lm.getState()).toBe('error');
    });
  });

  describe('shutdown', () => {
    it('transitions through shutting-down → shutdown', async () => {
      await lm.initialize();
      const states: string[] = [];
      lm.onStateChange(s => states.push(s));
      await lm.shutdown();
      expect(states).toContain('shutting-down');
      expect(states).toContain('shutdown');
    });

    it('throws if not ready', async () => {
      await expect(lm.shutdown()).rejects.toThrow('Cannot shutdown from state: uninitialized');
    });

    it('runs shutdown handlers in priority order', async () => {
      const order: number[] = [];
      lm.addShutdownHandler('low', async () => { order.push(1); }, 1);
      lm.addShutdownHandler('high', async () => { order.push(100); }, 100);
      await lm.initialize();
      await lm.shutdown();
      expect(order).toEqual([100, 1]);
    });

    it('transitions to error if shutdown handler throws', async () => {
      lm.addShutdownHandler('failing', async () => { throw new Error('shutdown fail'); });
      await lm.initialize();
      await expect(lm.shutdown()).rejects.toThrow('shutdown fail');
      expect(lm.getState()).toBe('error');
    });
  });

  describe('isReady', () => {
    it('is true only in ready state', async () => {
      expect(lm.isReady()).toBe(false);
      await lm.initialize();
      expect(lm.isReady()).toBe(true);
      await lm.shutdown();
      expect(lm.isReady()).toBe(false);
    });
  });
});
