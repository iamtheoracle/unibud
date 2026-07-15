import test from 'node:test';
import assert from 'node:assert/strict';
import { createLifecycleManager } from '../components/lifecycle-manager.ts';

test('lifecycle manager transitions state in order', async () => {
  const lifecycle = createLifecycleManager();
  const steps: string[] = [];

  lifecycle.onInitialize(async () => {
    steps.push('init');
  });
  lifecycle.onShutdown(async () => {
    steps.push('shutdown');
  });

  await lifecycle.initialize();
  assert.equal(lifecycle.getState(), 'ready');
  await lifecycle.shutdown();

  assert.deepEqual(steps, ['init', 'shutdown']);
  assert.equal(lifecycle.getState(), 'shutdown');
});
