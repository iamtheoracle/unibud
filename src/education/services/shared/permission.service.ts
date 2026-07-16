import { PermissionModel } from '../../models/shared/permission.model';
import type { IPermission } from '../../types/shared';

export class PermissionService {
  async definePermission(name: string, description: string, scope: string): Promise<IPermission> {
    const existing = await PermissionModel.findByName(name);
    if (existing) {
      throw new Error(`Permission ${name} already exists`);
    }

    return PermissionModel.create({ name, description, scope });
  }

  async grantPermission(userId: string, permissionName: string, context?: string): Promise<void> {
    const permission = await PermissionModel.findByName(permissionName);
    if (!permission) {
      throw new Error(`Permission ${permissionName} is not defined`);
    }

    const existing = await PermissionModel.findUserPermission(userId, permissionName, context);
    if (!existing) {
      await PermissionModel.createUserPermission({
        userId,
        permissionName,
        context,
        grantedAt: new Date(),
      });
    }
  }

  async revokePermission(userId: string, permissionName: string, context?: string): Promise<void> {
    const existing = await PermissionModel.findUserPermission(userId, permissionName, context);
    if (existing) {
      await PermissionModel.deleteUserPermission(existing.id);
    }
  }

  async hasPermission(userId: string, permissionName: string, context?: string): Promise<boolean> {
    const permission = await PermissionModel.findUserPermission(userId, permissionName, context);
    return Boolean(permission);
  }
}

export const permissionService = new PermissionService();
