import test from 'node:test';
import assert from 'node:assert/strict';
import { createBootstrap } from '../components/bootstrap.ts';

test('bootstrap initializes and shuts down oracle kernel', async () => {
  const bootstrap = createBootstrap();
  await bootstrap.initialize();
  assert.equal(bootstrap.oracle.isReady(), true);

  await bootstrap.shutdown();
  assert.equal(bootstrap.oracle.lifecycle.getState(), 'shutdown');
});
