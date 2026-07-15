import test from 'node:test';
import assert from 'node:assert/strict';
import { createDependencyInjector } from '../components/dependency-injector.ts';

test('dependency injector resolves dependency graph', () => {
  const di = createDependencyInjector();
  di.register('config', { env: 'test' });
  di.register('service', null, {
    dependencies: ['config'],
    factory: (config) => ({ kind: 'service', config }),
  });

  const service = di.resolve<{ kind: string; config: { env: string } }>('service');
  assert.equal(service.kind, 'service');
  assert.equal(service.config.env, 'test');
});

test('dependency injector detects circular dependency', () => {
  const di = createDependencyInjector();
  di.register('a', null, { dependencies: ['b'], factory: () => ({}) });
  di.register('b', null, { dependencies: ['a'], factory: () => ({}) });

  assert.throws(() => di.resolve('a'), /Circular dependency detected/);
});
