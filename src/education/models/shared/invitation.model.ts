import { base44 } from '@/api/base44Client';
import type { IInvitation } from '../../types/shared';

function mapToInvitation(raw: Record<string, unknown>): IInvitation {
  return {
    id: String(raw.id || ''),
    email: String(raw.email || ''),
    type: (raw.type as IInvitation['type']) || 'student',
    organizationId: String(raw.organization_id || ''),
    programId: raw.program_id ? String(raw.program_id) : undefined,
    token: String(raw.token || ''),
    status: (raw.status as IInvitation['status']) || 'pending',
    createdAt: new Date(String(raw.created_date || Date.now())),
    expiresAt: new Date(String(raw.expires_at || Date.now())),
  };
}

export const InvitationModel = {
  async findByToken(token: string): Promise<IInvitation | null> {
    try {
      const results = await base44.entities.Invitation.filter({ token });
      return results?.length ? mapToInvitation(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async create(data: Omit<IInvitation, 'id' | 'createdAt'>): Promise<IInvitation> {
    const raw = await base44.entities.Invitation.create({
      email: data.email,
      type: data.type,
      organization_id: data.organizationId,
      program_id: data.programId,
      token: data.token,
      status: data.status,
      expires_at: data.expiresAt.toISOString(),
    });
    return mapToInvitation(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IInvitation, 'id' | 'createdAt'>>): Promise<IInvitation> {
    const updates: Record<string, unknown> = {};
    if (data.email !== undefined) updates.email = data.email;
    if (data.type !== undefined) updates.type = data.type;
    if (data.organizationId !== undefined) updates.organization_id = data.organizationId;
    if (data.programId !== undefined) updates.program_id = data.programId;
    if (data.token !== undefined) updates.token = data.token;
    if (data.status !== undefined) updates.status = data.status;
    if (data.expiresAt !== undefined) updates.expires_at = data.expiresAt.toISOString();

    const raw = await base44.entities.Invitation.update(id, updates);
    return mapToInvitation(raw as Record<string, unknown>);
  },
};
