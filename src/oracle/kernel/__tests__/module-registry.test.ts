import { describe, it, expect, beforeEach } from 'vitest';
import { ModuleRegistry } from '../components/module-registry';
import type { IModule } from '../types/index';

const makeModule = (name: string, version = '1.0.0'): IModule => ({ name, version });

describe('ModuleRegistry', () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = new ModuleRegistry();
  });

  describe('register / get', () => {
    it('registers and retrieves a module', () => {
      const mod = makeModule('auth');
      registry.register(mod);
      expect(registry.get('auth')).toBe(mod);
    });

    it('throws on duplicate registration', () => {
      registry.register(makeModule('auth'));
      expect(() => registry.register(makeModule('auth'))).toThrow(
        'Module already registered: auth',
      );
    });

    it('returns undefined for unknown module', () => {
      expect(registry.get('unknown')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('returns true after registration', () => {
      registry.register(makeModule('logger'));
      expect(registry.has('logger')).toBe(true);
    });

    it('returns false before registration', () => {
      expect(registry.has('logger')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('returns all registered modules', () => {
      const a = makeModule('a');
      const b = makeModule('b');
      registry.register(a);
      registry.register(b);
      expect(registry.getAll()).toHaveLength(2);
      expect(registry.getAll()).toContain(a);
      expect(registry.getAll()).toContain(b);
    });
  });

  describe('unregister', () => {
    it('removes an existing module', () => {
      registry.register(makeModule('removable'));
      expect(registry.unregister('removable')).toBe(true);
      expect(registry.has('removable')).toBe(false);
    });

    it('returns false for non-existent module', () => {
      expect(registry.unregister('ghost')).toBe(false);
    });

    it('allows re-registration after unregister', () => {
      registry.register(makeModule('mod'));
      registry.unregister('mod');
      expect(() => registry.register(makeModule('mod'))).not.toThrow();
    });
  });

  describe('module with lifecycle hooks', () => {
    it('stores module with initialize and shutdown', () => {
      const mod: IModule = {
        name: 'lifecycle',
        version: '2.0.0',
        description: 'A module with hooks',
        initialize: async () => {},
        shutdown: async () => {},
      };
      registry.register(mod);
      expect(registry.get('lifecycle')).toBe(mod);
    });
  });
});
