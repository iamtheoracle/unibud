import type { IPermission, IUserPermission } from '../../types/shared';
import { PermissionModel } from '../../models/shared/permission.model';
import { generateId } from '../../utils';

function normalizeContext(context?: Record<string, unknown>): string {
  if (!context) return '';
  const sorted = Object.keys(context).sort().reduce<Record<string, unknown>>((acc, k) => {
    acc[k] = context[k];
    return acc;
  }, {});
  return JSON.stringify(sorted);
}

export class PermissionService {
  private permissionStore = new Map<string, PermissionModel>();
  private userPermissions: IUserPermission[] = [];

  definePermission(name: string, description?: string, scope: string = 'global'): IPermission {
    const existing = Array.from(this.permissionStore.values()).find(p => p.name === name);
    if (existing) throw new Error(`Permission "${name}" already exists`);
    const id = generateId('perm');
    const permission = new PermissionModel({ id, name, description, scope });
    this.permissionStore.set(id, permission);
    return permission.toJSON();
  }

  getPermission(name: string): IPermission | undefined {
    return Array.from(this.permissionStore.values()).find(p => p.name === name)?.toJSON();
  }

  grantPermission(userId: string, permissionName: string, context?: Record<string, unknown>): void {
    if (!this.hasPermission(userId, permissionName, context)) {
      this.userPermissions.push({ userId, permissionName, context, grantedAt: new Date() });
    }
  }

  revokePermission(userId: string, permissionName: string, context?: Record<string, unknown>): void {
    const contextKey = normalizeContext(context);
    this.userPermissions = this.userPermissions.filter(
      up => !(up.userId === userId && up.permissionName === permissionName &&
        normalizeContext(up.context) === contextKey)
    );
  }

  hasPermission(userId: string, permissionName: string, context?: Record<string, unknown>): boolean {
    const contextKey = normalizeContext(context);
    return this.userPermissions.some(
      up => up.userId === userId && up.permissionName === permissionName &&
        normalizeContext(up.context) === contextKey
    );
  }

  listPermissions(): IPermission[] {
    return Array.from(this.permissionStore.values()).map(p => p.toJSON());
  }
}
