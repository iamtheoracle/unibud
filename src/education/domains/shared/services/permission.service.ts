/**
 * Domain: Shared Infrastructure — PermissionService
 */

import { PermissionModel, PermissionGrantModel } from '../models/shared.models';
import type {
  IPermission,
  IPermissionGrant,
  DefinePermissionInput,
  GrantPermissionInput,
} from '../types';

export const PermissionService = {
  async definePermission(input: DefinePermissionInput): Promise<IPermission> {
    const record = await PermissionModel.create({
      name: input.name,
      description: input.description,
      scope: input.scope,
      metadata: input.metadata ?? {},
    });
    return mapPermission(record);
  },

  async grantPermission(input: GrantPermissionInput): Promise<void> {
    const permissions = await PermissionModel.list({ name: input.permissionName });
    if (permissions.length === 0) {
      throw new Error(`Permission "${input.permissionName}" not found.`);
    }
    await PermissionGrantModel.create({
      user_id: input.userId,
      permission_id: permissions[0].id as string,
      context_type: input.contextType,
      context_id: input.contextId,
      granted_at: new Date().toISOString(),
    });
  },

  async revokePermission(userId: string, permissionName: string, contextId?: string): Promise<void> {
    const permissions = await PermissionModel.list({ name: permissionName });
    if (permissions.length === 0) return;

    const permissionId = permissions[0].id as string;
    const filters: Record<string, unknown> = { user_id: userId, permission_id: permissionId };
    if (contextId) filters.context_id = contextId;

    const grants = await PermissionGrantModel.list(filters);
    for (const grant of grants) {
      await PermissionGrantModel.delete(grant.id as string);
    }
  },

  async hasPermission(userId: string, permissionName: string, contextId?: string): Promise<boolean> {
    const permissions = await PermissionModel.list({ name: permissionName });
    if (permissions.length === 0) return false;

    const permissionId = permissions[0].id as string;
    const filters: Record<string, unknown> = { user_id: userId, permission_id: permissionId };
    if (contextId) filters.context_id = contextId;

    const grants = await PermissionGrantModel.list(filters);
    return grants.length > 0;
  },

  async listPermissions(userId: string): Promise<IPermission[]> {
    const grants = await PermissionGrantModel.list({ user_id: userId });
    const permissionIds = grants.map((g) => g.permission_id as string);
    const permissions: IPermission[] = [];
    for (const permId of permissionIds) {
      try {
        const record = await PermissionModel.get(permId);
        permissions.push(mapPermission(record));
      } catch {
        // Skip missing permissions
      }
    }
    return permissions;
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapPermission(r: Record<string, unknown>): IPermission {
  return {
    id: r.id as string,
    name: r.name as string,
    description: r.description as string | undefined,
    scope: r.scope as IPermission['scope'],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
  };
}

export function mapPermissionGrant(r: Record<string, unknown>): IPermissionGrant {
  return {
    userId: r.user_id as string,
    permissionId: r.permission_id as string,
    contextType: r.context_type as string | undefined,
    contextId: r.context_id as string | undefined,
    grantedAt: new Date(r.granted_at as string),
  };
}
