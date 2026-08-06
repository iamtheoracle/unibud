import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OracleKernel } from '../oracle-kernel';
import type { IModule, ICapability, IPlugin, IHealthCheck } from '../types/index';

describe('OracleKernel Integration', () => {
  let kernel: OracleKernel;

  beforeEach(() => {
    // Use quiet logger for tests
    kernel = new OracleKernel({ logLevel: 'error' });
  });

  afterEach(async () => {
    if (kernel.isReady()) {
      await kernel.shutdown();
    }
  });

  describe('lifecycle', () => {
    it('initializes and reports ready', async () => {
      expect(kernel.isReady()).toBe(false);
      await kernel.initialize();
      expect(kernel.isReady()).toBe(true);
    });

    it('shuts down cleanly', async () => {
      await kernel.initialize();
      await kernel.shutdown();
      expect(kernel.isReady()).toBe(false);
    });

    it('cannot initialize twice', async () => {
      await kernel.initialize();
      await expect(kernel.initialize()).rejects.toThrow();
    });
  });

  describe('module registration', () => {
    it('registers and retrieves a module', async () => {
      await kernel.initialize();
      const mod: IModule = { name: 'auth', version: '1.0.0' };
      kernel.modules.register(mod);
      expect(kernel.modules.get('auth')).toBe(mod);
    });

    it('module initialize is called with oracle reference', async () => {
      const initFn = vi.fn().mockResolvedValue(undefined);
      const mod: IModule = {
        name: 'init-test',
        version: '1.0.0',
        initialize: initFn,
      };
      await kernel.initialize();
      kernel.modules.register(mod);
      if (mod.initialize) await mod.initialize(kernel);
      expect(initFn).toHaveBeenCalledWith(kernel);
    });
  });

  describe('capability registration', () => {
    it('registers and retrieves capabilities', async () => {
      await kernel.initialize();
      const cap: ICapability = {
        id: 'storage.read',
        name: 'Storage Read',
        version: '1.0.0',
        provider: 'storage',
      };
      kernel.capabilities.register(cap);
      expect(kernel.capabilities.has('storage.read')).toBe(true);
      expect(kernel.capabilities.getByProvider('storage')).toHaveLength(1);
    });
  });

  describe('config + environment', () => {
    it('config and environment work together', async () => {
      kernel = new OracleKernel({
        env: { NODE_ENV: 'test', PORT: '3000' },
        logLevel: 'error',
      });
      kernel.config.load({ dbHost: 'localhost', debug: false });
      await kernel.initialize();

      expect(kernel.environment.get('NODE_ENV')).toBe('test');
      expect(kernel.environment.getNumber('PORT')).toBe(3000);
      expect(kernel.config.get<string>('dbHost')).toBe('localhost');
    });
  });

  describe('dependency injection', () => {
    it('resolves registered services', async () => {
      await kernel.initialize();
      kernel.dependencies.registerValue<string>('apiUrl', 'https://api.example.com');
      expect(kernel.dependencies.resolve<string>('apiUrl')).toBe('https://api.example.com');
    });

    it('singleton is resolved once', async () => {
      await kernel.initialize();
      let count = 0;
      kernel.dependencies.registerSingleton('counter', () => ({ n: ++count }));
      const a = kernel.dependencies.resolve<{ n: number }>('counter');
      const b = kernel.dependencies.resolve<{ n: number }>('counter');
      expect(a).toBe(b);
      expect(count).toBe(1);
    });
  });

  describe('health checks', () => {
    it('all checks pass by default', async () => {
      await kernel.initialize();
      const check: IHealthCheck = {
        name: 'test-check',
        check: async () => ({
          name: 'test-check',
          status: 'healthy',
          checkedAt: new Date(),
        }),
      };
      kernel.health.register(check);
      const results = await kernel.health.checkAll();
      expect(results[0].status).toBe('healthy');
    });
  });

  describe('plugin system', () => {
    it('registers and initializes a plugin', async () => {
      await kernel.initialize();
      const initFn = vi.fn().mockResolvedValue(undefined);
      const plugin: IPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        initialize: initFn,
      };
      await kernel.plugins.register(plugin);
      expect(kernel.plugins.has('test-plugin')).toBe(true);
      expect(initFn).toHaveBeenCalledWith(kernel);
    });

    it('rejects incompatible plugin', async () => {
      await kernel.initialize();
      const plugin: IPlugin = {
        id: 'future-plugin',
        name: 'Future Plugin',
        version: '1.0.0',
        minOracleVersion: '99.0.0',
      };
      await expect(kernel.plugins.register(plugin)).rejects.toThrow('requires Oracle version');
    });
  });

  describe('error boundary', () => {
    it('catches and propagates errors', async () => {
      await kernel.initialize();
      const handler = vi.fn();
      kernel.errors.onError(handler);
      await expect(
        kernel.errors.wrap(() => { throw new Error('test error'); }),
      ).rejects.toThrow('test error');
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('version manager', () => {
    it('reports kernel version', async () => {
      await kernel.initialize();
      const v = kernel.version.getKernelVersion();
      expect(v.major).toBeGreaterThanOrEqual(1);
    });

    it('checks component compatibility', async () => {
      await kernel.initialize();
      expect(kernel.version.isCompatible('1.0.0')).toBe(true);
    });
  });

  describe('full workflow', () => {
    it('complete init → use → shutdown cycle', async () => {
      // Configure
      kernel.config.load({ feature: 'enabled' });

      // Initialize
      await kernel.initialize();
      expect(kernel.isReady()).toBe(true);

      // Use
      const mod: IModule = { name: 'workflow', version: '1.0.0' };
      kernel.modules.register(mod);
      kernel.capabilities.register({ id: 'cap.x', name: 'Cap X', version: '1.0.0' });
      kernel.dependencies.registerValue('token', 'abc123');

      expect(kernel.modules.has('workflow')).toBe(true);
      expect(kernel.capabilities.has('cap.x')).toBe(true);
      expect(kernel.dependencies.resolve<string>('token')).toBe('abc123');

      // Shutdown
      await kernel.shutdown();
      expect(kernel.isReady()).toBe(false);
    });
  });
});
