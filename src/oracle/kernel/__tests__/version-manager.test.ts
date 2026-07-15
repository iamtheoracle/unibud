import test from 'node:test';
import assert from 'node:assert/strict';
import { asMutableVersionManager, createVersionManager } from '../components/version-manager.ts';

test('version manager tracks versions and compatibility', () => {
  const version = createVersionManager('1.0.0');
  const mutable = asMutableVersionManager(version);

  mutable?.registerModuleVersion('alpha', '1.0.1');
  mutable?.registerComponentVersion('bootstrap', '1.0.0');

  assert.equal(version.getModuleVersion('alpha'), '1.0.1');
  assert.equal(version.getComponentVersion('bootstrap'), '1.0.0');
  assert.equal(version.isCompatible('1.0.0', '1.2.0'), true);
  assert.equal(version.isCompatible('1.0.0', '2.0.0'), false);
});
