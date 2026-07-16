/**
 * Education Module — Permission Service
 */

import type {
  IPermission,
  IPermissionService,
  IUserPermissionGrant,
  IPermissionContext,
  PermissionScope,
} from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class PermissionService implements IPermissionService {
  private readonly permissions: Map<string, IPermission> = new Map();
  private readonly grants: Map<string, IUserPermissionGrant> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('PermissionService');
  }

  definePermission(name: string, description?: string, scope: PermissionScope = 'global'): IPermission {
    if (this.permissions.has(name)) {
      return this.permissions.get(name)!;
    }
    const permission: IPermission = {
      id: generateId(),
      name,
      description,
      scope,
      createdAt: new Date(),
    };
    this.permissions.set(name, permission);
    this.logger.info('permission.defined', { name, scope });
    return permission;
  }

  grantPermission(userId: string, permissionName: string, orgId?: string, classId?: string): void {
    if (!this.permissions.has(permissionName)) {
      throw new Error(`Permission not defined: "${permissionName}"`);
    }
    const grantKey = this.grantKey(userId, permissionName, orgId, classId);
    if (!this.grants.has(grantKey)) {
      const grant: IUserPermissionGrant = {
        id: generateId(),
        userId,
        permissionName,
        organizationId: orgId,
        classId,
        grantedAt: new Date(),
      };
      this.grants.set(grantKey, grant);
      this.logger.info('permission.granted', { userId, permissionName, orgId, classId });
    }
  }

  revokePermission(userId: string, permissionName: string, orgId?: string, classId?: string): void {
    const grantKey = this.grantKey(userId, permissionName, orgId, classId);
    this.grants.delete(grantKey);
    this.logger.info('permission.revoked', { userId, permissionName, orgId, classId });
  }

  hasPermission(userId: string, permissionName: string, context?: IPermissionContext): boolean {
    // 1. Global grant
    if (this.grants.has(this.grantKey(userId, permissionName))) return true;

    // 2. Organization-scoped grant
    if (context?.organizationId) {
      if (this.grants.has(this.grantKey(userId, permissionName, context.organizationId))) return true;
    }

    // 3. Class-scoped grant — search all grants for this user+permission+classId
    //    because the grant may have been stored with or without an orgId.
    if (context?.classId) {
      return [...this.grants.values()].some(
        (g) =>
          g.userId === userId &&
          g.permissionName === permissionName &&
          g.classId === context.classId,
      );
    }

    return false;
  }

  listPermissions(userId: string): IPermission[] {
    const permissionNames = new Set(
      [...this.grants.values()]
        .filter((g) => g.userId === userId)
        .map((g) => g.permissionName),
    );
    return [...permissionNames]
      .map((name) => this.permissions.get(name))
      .filter((p): p is IPermission => p !== undefined);
  }

  private grantKey(userId: string, permissionName: string, orgId?: string, classId?: string): string {
    return `${userId}::${permissionName}::${orgId ?? '__NULL__'}::${classId ?? '__NULL__'}`;
  }
}
