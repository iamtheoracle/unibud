/**
 * Domain: Shared Infrastructure — Models
 */

import { base44 } from '@/api/base44Client';

export const PermissionModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduPermission.create(data);
  },
  async get(id: string) {
    return base44.entities.EduPermission.get(id);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduPermission.filter(filters ?? {});
  },
};

export const PermissionGrantModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduPermissionGrant.create(data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduPermissionGrant.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduPermissionGrant.delete(id);
  },
};

export const InvitationModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduInvitation.create(data);
  },
  async get(id: string) {
    return base44.entities.EduInvitation.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduInvitation.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduInvitation.filter(filters ?? {});
  },
  async findByToken(token: string) {
    const results = await base44.entities.EduInvitation.filter({ token });
    return results[0] ?? null;
  },
};
