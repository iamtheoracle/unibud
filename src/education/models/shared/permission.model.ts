import { base44 } from '@/api/base44Client';
import type { IPermission, IUserPermission } from '../../types/shared';

function mapToPermission(raw: Record<string, unknown>): IPermission {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    scope: String(raw.scope || ''),
    createdAt: new Date(String(raw.created_date || Date.now())),
  };
}

function mapToUserPermission(raw: Record<string, unknown>): IUserPermission {
  return {
    id: String(raw.id || ''),
    userId: String(raw.user_id || ''),
    permissionName: String(raw.permission_name || ''),
    context: raw.context ? String(raw.context) : undefined,
    grantedAt: new Date(String(raw.granted_at || Date.now())),
  };
}

export const PermissionModel = {
  async findByName(name: string): Promise<IPermission | null> {
    try {
      const results = await base44.entities.Permission.filter({ name });
      return results?.length ? mapToPermission(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async create(data: Omit<IPermission, 'id' | 'createdAt'>): Promise<IPermission> {
    const raw = await base44.entities.Permission.create({
      name: data.name,
      description: data.description,
      scope: data.scope,
    });
    return mapToPermission(raw as Record<string, unknown>);
  },

  async findUserPermission(userId: string, permissionName: string, context?: string): Promise<IUserPermission | null> {
    try {
      const query: Record<string, string> = { user_id: userId, permission_name: permissionName };
      if (context !== undefined) query.context = context;
      const results = await base44.entities.UserPermission.filter(query);
      return results?.length ? mapToUserPermission(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async createUserPermission(data: Omit<IUserPermission, 'id'>): Promise<IUserPermission> {
    const raw = await base44.entities.UserPermission.create({
      user_id: data.userId,
      permission_name: data.permissionName,
      context: data.context,
      granted_at: data.grantedAt.toISOString(),
    });
    return mapToUserPermission(raw as Record<string, unknown>);
  },

  async deleteUserPermission(id: string): Promise<void> {
    await base44.entities.UserPermission.delete(id);
  },
};
