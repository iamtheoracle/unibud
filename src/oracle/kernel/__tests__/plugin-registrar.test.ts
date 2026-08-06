import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginRegistrar } from '../components/plugin-registrar';
import { VersionManager } from '../components/version-manager';
import type { IPlugin } from '../types/index';

const makePlugin = (id: string, minVersion?: string): IPlugin => ({
  id,
  name: `Plugin ${id}`,
  version: '1.0.0',
  minOracleVersion: minVersion,
});

describe('PluginRegistrar', () => {
  let vm: VersionManager;
  let pr: PluginRegistrar;

  beforeEach(() => {
    vm = new VersionManager('1.0.0');
    pr = new PluginRegistrar(vm);
  });

  describe('isCompatible', () => {
    it('returns true when no minOracleVersion set', () => {
      expect(pr.isCompatible(makePlugin('no-req'))).toBe(true);
    });

    it('returns true when minOracleVersion matches major', () => {
      expect(pr.isCompatible(makePlugin('ok', '1.5.0'))).toBe(true);
    });

    it('returns false when major versions differ', () => {
      expect(pr.isCompatible(makePlugin('bad', '2.0.0'))).toBe(false);
    });
  });

  describe('register', () => {
    it('registers a compatible plugin', async () => {
      await pr.register(makePlugin('simple'));
      expect(pr.has('simple')).toBe(true);
    });

    it('throws on duplicate plugin id', async () => {
      await pr.register(makePlugin('dup'));
      await expect(pr.register(makePlugin('dup'))).rejects.toThrow(
        'Plugin already registered: dup',
      );
    });

    it('throws on incompatible version', async () => {
      await expect(pr.register(makePlugin('incompatible', '2.0.0'))).rejects.toThrow(
        'requires Oracle version',
      );
    });

    it('calls plugin.initialize when oracle is provided', async () => {
      const initFn = vi.fn().mockResolvedValue(undefined);
      const plugin: IPlugin = { ...makePlugin('with-init'), initialize: initFn };
      const mockOracle = {} as never;
      const pr2 = new PluginRegistrar(vm, mockOracle);
      await pr2.register(plugin);
      expect(initFn).toHaveBeenCalledWith(mockOracle);
    });

    it('skips initialize when no oracle provided', async () => {
      const initFn = vi.fn().mockResolvedValue(undefined);
      const plugin: IPlugin = { ...makePlugin('no-oracle'), initialize: initFn };
      await pr.register(plugin); // pr has no oracle
      expect(initFn).not.toHaveBeenCalled();
    });
  });

  describe('unregister', () => {
    it('unregisters an existing plugin', async () => {
      await pr.register(makePlugin('rm'));
      expect(await pr.unregister('rm')).toBe(true);
      expect(pr.has('rm')).toBe(false);
    });

    it('returns false for non-existent plugin', async () => {
      expect(await pr.unregister('ghost')).toBe(false);
    });

    it('calls plugin.shutdown on unregister', async () => {
      const shutdownFn = vi.fn().mockResolvedValue(undefined);
      const plugin: IPlugin = { ...makePlugin('with-shutdown'), shutdown: shutdownFn };
      await pr.register(plugin);
      await pr.unregister('with-shutdown');
      expect(shutdownFn).toHaveBeenCalled();
    });
  });

  describe('get / getAll / has', () => {
    it('get returns undefined for unknown id', () => {
      expect(pr.get('unknown')).toBeUndefined();
    });

    it('get returns plugin after registration', async () => {
      const p = makePlugin('found');
      await pr.register(p);
      expect(pr.get('found')).toBe(p);
    });

    it('getAll returns all registered plugins', async () => {
      await pr.register(makePlugin('x'));
      await pr.register(makePlugin('y'));
      expect(pr.getAll()).toHaveLength(2);
    });

    it('has returns false before registration', () => {
      expect(pr.has('nope')).toBe(false);
    });
  });
});
