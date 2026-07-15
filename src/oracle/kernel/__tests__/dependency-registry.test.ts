import test from 'node:test';
import assert from 'node:assert/strict';

import { DependencyRegistry } from '../dependency-registry.ts';

test('DependencyRegistry resolves dependencies in order and caches singletons', async () => {
  const registry = new DependencyRegistry();
  let eagerResolved = 0;

  registry.register('config', { name: 'config' }, { lazy: false });
  registry.register('logger', (dependencies: unknown[]) => ({ name: 'logger', dependencies }), { dependencies: ['config'] });
  registry.register('worker', (dependencies: unknown[]) => ({ name: 'worker', dependencies }), { dependencies: ['logger'] });
  registry.register('eager', () => {
    eagerResolved += 1;
    return { name: 'eager' };
  }, { lazy: false });

  await registry.warmup();
  assert.equal(eagerResolved, 1);

  const [worker] = await registry.resolveMany(['worker']);
  assert.equal((worker as { dependencies: unknown[] }).dependencies.length, 1);
  assert.deepEqual(registry.getRegistrationOrder(['worker']), ['config', 'logger', 'worker']);
  assert.equal(await registry.resolve('eager'), await registry.resolve('eager'));
});

test('DependencyRegistry detects circular dependencies', () => {
  const registry = new DependencyRegistry();

  registry.register('a', 'a', { dependencies: ['b'] });
  registry.register('b', 'b', { dependencies: ['a'] });

  assert.throws(() => registry.getRegistrationOrder(['a']), /Circular dependency detected/);
});
