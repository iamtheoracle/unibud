import test from 'node:test';
import assert from 'node:assert/strict';
import { createErrorBoundary } from '../components/error-boundary.ts';

test('error boundary emits subscriber callback on handled errors', async () => {
  const boundary = createErrorBoundary();
  let captured: Error | undefined;

  boundary.onError((error) => {
    captured = error;
  });

  await assert.rejects(() =>
    boundary.handle(async () => {
      throw new Error('boom');
    }),
  );

  assert.equal(captured?.message, 'boom');
});
