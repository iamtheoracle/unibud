/**
 * Oracle Kernel — Permission Service
 *
 * Owned exclusively by Oracle. Education and other modules NEVER manage
 * permissions directly — they always call this service.
 */

import type {
  IPermissionService,
  IPermission,
  IPermissionGrant,
  IHealthStatus,
} from './types.js';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class PermissionService implements IPermissionService {
  private readonly _permissions = new Map<string, IPermission>();
  private readonly _grants: IPermissionGrant[] = [];

  definePermission(
    name: string,
    description: string,
    scope: IPermission['scope'],
  ): IPermission {
    if (this._permissions.has(name)) {
      return this._permissions.get(name)!;
    }
    const permission: IPermission = {
      id: generateId(),
      name,
      description,
      scope,
      createdAt: new Date(),
    };
    this._permissions.set(name, permission);
    return permission;
  }

  getPermission(name: string): IPermission | undefined {
    return this._permissions.get(name);
  }

  listPermissions(): IPermission[] {
    return Array.from(this._permissions.values());
  }

  grantPermission(
    userId: string,
    permissionName: string,
    resourceId?: string,
  ): IPermissionGrant {
    const permission = this._permissions.get(permissionName);
    if (!permission) {
      throw new Error(`PermissionService: unknown permission "${permissionName}"`);
    }
    const existing = this._grants.find(
      (g) =>
        g.userId === userId &&
        g.permissionId === permission.id &&
        g.resourceId === resourceId,
    );
    if (existing) return existing;

    const grant: IPermissionGrant = {
      id: generateId(),
      userId,
      permissionId: permission.id,
      resourceId,
      grantedAt: new Date(),
    };
    this._grants.push(grant);
    return grant;
  }

  revokePermission(userId: string, permissionName: string, resourceId?: string): void {
    const permission = this._permissions.get(permissionName);
    if (!permission) return;
    const idx = this._grants.findIndex(
      (g) =>
        g.userId === userId &&
        g.permissionId === permission.id &&
        g.resourceId === resourceId,
    );
    if (idx !== -1) this._grants.splice(idx, 1);
  }

  checkPermission(userId: string, permissionName: string, resourceId?: string): boolean {
    const permission = this._permissions.get(permissionName);
    if (!permission) return false;
    return this._grants.some(
      (g) =>
        g.userId === userId &&
        g.permissionId === permission.id &&
        (g.resourceId === undefined || g.resourceId === resourceId) &&
        (!g.expiresAt || g.expiresAt > new Date()),
    );
  }

  getHealth(): IHealthStatus {
    return { status: 'healthy', timestamp: new Date() };
  }
}
