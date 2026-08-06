import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyInjector } from '../components/dependency-injector';

describe('DependencyInjector', () => {
  let di: DependencyInjector;

  beforeEach(() => {
    di = new DependencyInjector();
  });

  describe('register / resolve (transient)', () => {
    it('resolves a registered factory', () => {
      di.register('greeter', () => ({ greet: () => 'hello' }));
      const g = di.resolve<{ greet: () => string }>('greeter');
      expect(g.greet()).toBe('hello');
    });

    it('creates new instances each resolution', () => {
      let count = 0;
      di.register('counter', () => ({ id: ++count }));
      const a = di.resolve<{ id: number }>('counter');
      const b = di.resolve<{ id: number }>('counter');
      expect(a.id).toBe(1);
      expect(b.id).toBe(2);
    });

    it('throws for unregistered token', () => {
      expect(() => di.resolve('unknown')).toThrow('Dependency not registered: unknown');
    });
  });

  describe('registerSingleton', () => {
    it('returns same instance each time', () => {
      let count = 0;
      di.registerSingleton('singleton', () => ({ id: ++count }));
      const a = di.resolve<{ id: number }>('singleton');
      const b = di.resolve<{ id: number }>('singleton');
      expect(a).toBe(b);
      expect(a.id).toBe(1);
    });
  });

  describe('registerValue', () => {
    it('always returns the provided value', () => {
      const obj = { config: true };
      di.registerValue('cfg', obj);
      expect(di.resolve('cfg')).toBe(obj);
      expect(di.resolve('cfg')).toBe(obj);
    });

    it('works with primitive values', () => {
      di.registerValue<string>('greeting', 'hello');
      expect(di.resolve<string>('greeting')).toBe('hello');
    });
  });

  describe('has', () => {
    it('returns true after registration', () => {
      di.register('svc', () => ({}));
      expect(di.has('svc')).toBe(true);
    });

    it('returns false for unregistered', () => {
      expect(di.has('missing')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('removes a registration', () => {
      di.register('svc', () => ({}));
      expect(di.unregister('svc')).toBe(true);
      expect(di.has('svc')).toBe(false);
    });

    it('returns false for non-existent token', () => {
      expect(di.unregister('ghost')).toBe(false);
    });
  });

  describe('circular dependency detection', () => {
    it('throws on circular dependency', () => {
      // Register a factory that tries to resolve itself
      di.register('circ', () => {
        di.resolve('circ');
        return {};
      });
      expect(() => di.resolve('circ')).toThrow('Circular dependency detected: circ');
    });
  });

  describe('overwriting registrations', () => {
    it('overwrites an existing registration', () => {
      di.register('svc', () => 'v1');
      di.register('svc', () => 'v2');
      expect(di.resolve<string>('svc')).toBe('v2');
    });
  });
});
