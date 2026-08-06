import { describe, it, expect, beforeEach } from 'vitest';
import { HealthManager } from '../components/health-manager';
import type { IHealthCheck, IHealthCheckResult } from '../types/index';

const makeCheck = (
  name: string,
  result: Partial<IHealthCheckResult> = {},
): IHealthCheck => ({
  name,
  check: async () => ({
    name,
    status: 'healthy',
    checkedAt: new Date(),
    ...result,
  }),
});

describe('HealthManager', () => {
  let hm: HealthManager;

  beforeEach(() => {
    hm = new HealthManager();
  });

  describe('register / unregister', () => {
    it('registers a health check', () => {
      hm.register(makeCheck('db'));
      // No error means success
    });

    it('unregisters a health check', () => {
      hm.register(makeCheck('db'));
      expect(hm.unregister('db')).toBe(true);
    });

    it('returns false when unregistering unknown check', () => {
      expect(hm.unregister('ghost')).toBe(false);
    });
  });

  describe('check', () => {
    it('returns healthy result for passing check', async () => {
      hm.register(makeCheck('api', { status: 'healthy' }));
      const result = await hm.check('api');
      expect(result.status).toBe('healthy');
      expect(result.name).toBe('api');
    });

    it('returns unknown status for unregistered check', async () => {
      const result = await hm.check('missing');
      expect(result.status).toBe('unknown');
      expect(result.message).toContain('missing');
    });

    it('returns unhealthy when check throws', async () => {
      const failingCheck: IHealthCheck = {
        name: 'failing',
        check: async () => { throw new Error('connection refused'); },
      };
      hm.register(failingCheck);
      const result = await hm.check('failing');
      expect(result.status).toBe('unhealthy');
      expect(result.message).toBe('connection refused');
    });

    it('includes checkedAt timestamp', async () => {
      hm.register(makeCheck('ts'));
      const result = await hm.check('ts');
      expect(result.checkedAt).toBeInstanceOf(Date);
    });
  });

  describe('checkAll', () => {
    it('returns results for all checks', async () => {
      hm.register(makeCheck('a'));
      hm.register(makeCheck('b'));
      const results = await hm.checkAll();
      expect(results).toHaveLength(2);
      const names = results.map(r => r.name);
      expect(names).toContain('a');
      expect(names).toContain('b');
    });

    it('returns empty array when no checks registered', async () => {
      const results = await hm.checkAll();
      expect(results).toEqual([]);
    });
  });

  describe('getStatus', () => {
    it('returns unknown when no checks registered', () => {
      expect(hm.getStatus()).toBe('unknown');
    });

    it('returns healthy when checks are registered', () => {
      hm.register(makeCheck('x'));
      expect(hm.getStatus()).toBe('healthy');
    });
  });
});
