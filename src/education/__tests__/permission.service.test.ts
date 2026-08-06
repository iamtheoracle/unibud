import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionService } from '../services/permission.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    service = new PermissionService(logger);
  });

  it('defines a permission', () => {
    const p = service.definePermission('educator.create_class', 'Can create classes', 'organization');
    expect(p.name).toBe('educator.create_class');
    expect(p.scope).toBe('organization');
  });

  it('returns existing permission on duplicate define', () => {
    const p1 = service.definePermission('test.perm', 'Test', 'global');
    const p2 = service.definePermission('test.perm', 'Test', 'global');
    expect(p1.id).toBe(p2.id);
  });

  it('grants and checks a global permission', () => {
    service.definePermission('admin.access', 'Admin', 'global');
    service.grantPermission('user-1', 'admin.access');
    expect(service.hasPermission('user-1', 'admin.access')).toBe(true);
    expect(service.hasPermission('user-2', 'admin.access')).toBe(false);
  });

  it('grants and checks a scoped permission', () => {
    service.definePermission('student.view_class', 'View class', 'class');
    service.grantPermission('user-1', 'student.view_class', 'org-1', 'cls-1');

    expect(service.hasPermission('user-1', 'student.view_class', { classId: 'cls-1' })).toBe(true);
    expect(service.hasPermission('user-1', 'student.view_class', { classId: 'cls-2' })).toBe(false);
    expect(service.hasPermission('user-1', 'student.view_class', { organizationId: 'org-1' })).toBe(false);
  });

  it('revokes a permission', () => {
    service.definePermission('test.perm', 'Test', 'global');
    service.grantPermission('user-1', 'test.perm');
    expect(service.hasPermission('user-1', 'test.perm')).toBe(true);
    service.revokePermission('user-1', 'test.perm');
    expect(service.hasPermission('user-1', 'test.perm')).toBe(false);
  });

  it('throws when granting undefined permission', () => {
    expect(() => service.grantPermission('user-1', 'not.defined')).toThrow('Permission not defined');
  });

  it('lists all permissions for a user', () => {
    service.definePermission('perm.a', 'A', 'global');
    service.definePermission('perm.b', 'B', 'global');
    service.grantPermission('user-1', 'perm.a');
    service.grantPermission('user-1', 'perm.b');
    const perms = service.listPermissions('user-1');
    expect(perms).toHaveLength(2);
    const names = perms.map((p) => p.name);
    expect(names).toContain('perm.a');
    expect(names).toContain('perm.b');
  });
});
