import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionService } from '../../services/shared/permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    service = new PermissionService();
  });

  it('defines a permission', () => {
    const perm = service.definePermission('course:read', 'Read courses', 'university');
    expect(perm.id).toBeTruthy();
    expect(perm.name).toBe('course:read');
    expect(perm.scope).toBe('university');
  });

  it('throws on duplicate permission name', () => {
    service.definePermission('course:read');
    expect(() => service.definePermission('course:read')).toThrow('already exists');
  });

  it('lists defined permissions', () => {
    service.definePermission('p1');
    service.definePermission('p2');
    expect(service.listPermissions()).toHaveLength(2);
  });

  it('grants and checks permission', () => {
    service.definePermission('org:create', 'Create orgs', 'global');
    service.grantPermission('user1', 'org:create');
    expect(service.hasPermission('user1', 'org:create')).toBe(true);
    expect(service.hasPermission('user2', 'org:create')).toBe(false);
  });

  it('grants permission with context', () => {
    service.definePermission('class:update', 'Update class', 'class');
    const ctx = { classId: 'cls1' };
    service.grantPermission('user1', 'class:update', ctx);
    expect(service.hasPermission('user1', 'class:update', ctx)).toBe(true);
    expect(service.hasPermission('user1', 'class:update', { classId: 'cls2' })).toBe(false);
  });

  it('revokes a permission', () => {
    service.definePermission('perm:x', 'X', 'global');
    service.grantPermission('u1', 'perm:x');
    service.revokePermission('u1', 'perm:x');
    expect(service.hasPermission('u1', 'perm:x')).toBe(false);
  });

  it('does not duplicate grant', () => {
    service.definePermission('p:dup', 'Dup', 'global');
    service.grantPermission('u1', 'p:dup');
    service.grantPermission('u1', 'p:dup');
    service.revokePermission('u1', 'p:dup');
    expect(service.hasPermission('u1', 'p:dup')).toBe(false);
  });

  it('gets permission by name', () => {
    service.definePermission('named:perm', 'Named', 'global');
    const found = service.getPermission('named:perm');
    expect(found?.name).toBe('named:perm');
    expect(service.getPermission('nonexistent')).toBeUndefined();
  });
});
