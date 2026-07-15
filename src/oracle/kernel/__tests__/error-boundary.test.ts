import test from 'node:test';
import assert from 'node:assert/strict';

import { ErrorBoundary } from '../error-boundary.ts';
import { Logger } from '../logger.ts';

test('ErrorBoundary captures errors and runs recovery strategies', async () => {
  const sinkCalls: unknown[] = [];
  const boundary = new ErrorBoundary(new Logger({
    sink: {
      error(entry: unknown) { sinkCalls.push(entry); },
    },
  }));

  boundary.registerRecoveryStrategy('fallback', async () => 'recovered');
  const result = await boundary.capture(new Error('boom'), { phase: 'test' }, 'fallback');

  assert.equal(result.recovered, true);
  assert.equal(result.recoveryResult, 'recovered');
  assert.equal(boundary.getHistory().length, 1);
  assert.equal(sinkCalls.length, 1);
});

test('ErrorBoundary execute rethrows the normalized error', async () => {
  const boundary = new ErrorBoundary();

  await assert.rejects(() => boundary.execute(() => {
    throw 'failure';
  }), /failure/);
});
