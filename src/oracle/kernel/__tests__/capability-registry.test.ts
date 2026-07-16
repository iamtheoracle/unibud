import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityRegistry } from '../components/capability-registry';
import type { ICapability } from '../types/index';

const makeCap = (id: string, provider?: string, deps?: string[]): ICapability => ({
  id,
  name: `Cap ${id}`,
  version: '1.0.0',
  provider,
  dependencies: deps,
});

describe('CapabilityRegistry', () => {
  let registry: CapabilityRegistry;

  beforeEach(() => {
    registry = new CapabilityRegistry();
  });

  describe('register / get', () => {
    it('registers and retrieves a capability', () => {
      const cap = makeCap('auth');
      registry.register(cap);
      expect(registry.get('auth')).toBe(cap);
    });

    it('throws on duplicate registration', () => {
      registry.register(makeCap('auth'));
      expect(() => registry.register(makeCap('auth'))).toThrow(
        'Capability already registered: auth',
      );
    });

    it('returns undefined for unknown id', () => {
      expect(registry.get('missing')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('returns true after registration', () => {
      registry.register(makeCap('x'));
      expect(registry.has('x')).toBe(true);
    });

    it('returns false before registration', () => {
      expect(registry.has('x')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('returns all capabilities', () => {
      registry.register(makeCap('a'));
      registry.register(makeCap('b'));
      expect(registry.getAll()).toHaveLength(2);
    });
  });

  describe('unregister', () => {
    it('removes a capability', () => {
      registry.register(makeCap('removable'));
      expect(registry.unregister('removable')).toBe(true);
      expect(registry.has('removable')).toBe(false);
    });

    it('returns false for non-existent id', () => {
      expect(registry.unregister('ghost')).toBe(false);
    });
  });

  describe('getByProvider', () => {
    it('returns capabilities for a provider', () => {
      registry.register(makeCap('a', 'providerA'));
      registry.register(makeCap('b', 'providerA'));
      registry.register(makeCap('c', 'providerB'));
      const result = registry.getByProvider('providerA');
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain('a');
      expect(result.map(c => c.id)).toContain('b');
    });

    it('returns empty array for unknown provider', () => {
      registry.register(makeCap('x', 'other'));
      expect(registry.getByProvider('unknown')).toEqual([]);
    });
  });

  describe('getDependencies', () => {
    it('returns resolved dependency capabilities', () => {
      registry.register(makeCap('base'));
      registry.register(makeCap('advanced', undefined, ['base']));
      const deps = registry.getDependencies('advanced');
      expect(deps).toHaveLength(1);
      expect(deps[0].id).toBe('base');
    });

    it('returns empty array when no dependencies', () => {
      registry.register(makeCap('standalone'));
      expect(registry.getDependencies('standalone')).toEqual([]);
    });

    it('returns empty array for unknown capability', () => {
      expect(registry.getDependencies('unknown')).toEqual([]);
    });

    it('skips unregistered dependencies', () => {
      registry.register(makeCap('partial', undefined, ['existing', 'missing']));
      registry.register(makeCap('existing'));
      const deps = registry.getDependencies('partial');
      expect(deps).toHaveLength(1);
      expect(deps[0].id).toBe('existing');
    });
  });
});
