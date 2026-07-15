import test from 'node:test';
import assert from 'node:assert/strict';
import { createHealthManager } from '../components/health-manager.ts';

test('health manager aggregates health checks', async () => {
  const health = createHealthManager();
  health.register({ name: 'database', check: async () => 'healthy' });
  health.register({ name: 'queue', check: async () => 'degraded' });

  const report = await health.check();
  assert.equal(report.status, 'degraded');
  assert.equal(report.checks.database, 'healthy');
  assert.equal(await health.check('queue'), 'degraded');
});
