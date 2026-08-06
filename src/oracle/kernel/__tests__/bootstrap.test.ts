import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bootstrap } from '../components/bootstrap';

describe('bootstrap', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic initialization', () => {
    it('returns a ready oracle instance', async () => {
      const oracle = await bootstrap();
      expect(oracle.isReady()).toBe(true);
      await oracle.shutdown();
    });

    it('loads provided config', async () => {
      const oracle = await bootstrap({ config: { appName: 'test', port: 8080 } });
      expect(oracle.config.get<string>('appName')).toBe('test');
      expect(oracle.config.get<number>('port')).toBe(8080);
      await oracle.shutdown();
    });

    it('uses provided env', async () => {
      const oracle = await bootstrap({ env: { MY_VAR: 'my-value' } });
      expect(oracle.environment.get('MY_VAR')).toBe('my-value');
      await oracle.shutdown();
    });

    it('uses provided logLevel', async () => {
      const oracle = await bootstrap({ logLevel: 'debug' });
      expect(oracle.logger.getLevel()).toBe('debug');
      await oracle.shutdown();
    });

    it('uses provided kernelVersion', async () => {
      const oracle = await bootstrap({ kernelVersion: '2.0.0' });
      expect(oracle.version.getKernelVersion().toString()).toBe('2.0.0');
      await oracle.shutdown();
    });
  });

  describe('returned oracle interface', () => {
    it('has all required components', async () => {
      const oracle = await bootstrap();
      expect(oracle.config).toBeDefined();
      expect(oracle.environment).toBeDefined();
      expect(oracle.modules).toBeDefined();
      expect(oracle.capabilities).toBeDefined();
      expect(oracle.dependencies).toBeDefined();
      expect(oracle.lifecycle).toBeDefined();
      expect(oracle.health).toBeDefined();
      expect(oracle.logger).toBeDefined();
      expect(oracle.errors).toBeDefined();
      expect(oracle.plugins).toBeDefined();
      expect(oracle.version).toBeDefined();
      await oracle.shutdown();
    });
  });
});
