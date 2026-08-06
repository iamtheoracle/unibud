/**
 * Domain: Shared Infrastructure — InvitationService
 */

import { InvitationModel } from '../models/shared.models';
import type { IInvitation, SendInvitationInput } from '../types';

/** Generate a random URL-safe token */
function generateToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const InvitationService = {
  async sendInvitation(input: SendInvitationInput): Promise<IInvitation> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays ?? 7));

    const record = await InvitationModel.create({
      email: input.email,
      token: generateToken(),
      type: input.type,
      organization_id: input.organizationId,
      program_id: input.programId,
      status: 'pending',
      data: input.data ?? {},
      expires_at: expiresAt.toISOString(),
    });
    return mapInvitation(record);
  },

  async getInvitation(token: string): Promise<IInvitation | null> {
    const record = await InvitationModel.findByToken(token);
    return record ? mapInvitation(record) : null;
  },

  async acceptInvitation(token: string): Promise<IInvitation> {
    const record = await InvitationModel.findByToken(token);
    if (!record) throw new Error('Invitation not found.');
    if (record.status !== 'pending') throw new Error('Invitation is no longer pending.');
    if (new Date(record.expires_at as string) < new Date()) {
      throw new Error('Invitation has expired.');
    }
    const updated = await InvitationModel.update(record.id as string, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });
    return mapInvitation(updated);
  },

  async rejectInvitation(token: string): Promise<void> {
    const record = await InvitationModel.findByToken(token);
    if (!record) throw new Error('Invitation not found.');
    await InvitationModel.update(record.id as string, { status: 'rejected' });
  },

  async listInvitations(organizationId?: string): Promise<IInvitation[]> {
    const filters = organizationId ? { organization_id: organizationId } : {};
    const records = await InvitationModel.list(filters);
    return records.map(mapInvitation);
  },

  async revokeInvitation(id: string): Promise<void> {
    await InvitationModel.update(id, { status: 'revoked' });
  },
};

function mapInvitation(r: Record<string, unknown>): IInvitation {
  return {
    id: r.id as string,
    email: r.email as string,
    token: r.token as string,
    type: r.type as IInvitation['type'],
    organizationId: r.organization_id as string | undefined,
    programId: r.program_id as string | undefined,
    status: (r.status as IInvitation['status']) ?? 'pending',
    data: (r.data as Record<string, unknown>) ?? {},
    expiresAt: new Date(r.expires_at as string),
    acceptedAt: r.accepted_at ? new Date(r.accepted_at as string) : undefined,
    createdAt: new Date(r.created_at as string),
  };
}
