import type { IInvitation } from '../../types/shared';
import { InvitationModel } from '../../models/shared/invitation.model';
import { generateId, generateToken } from '../../utils';

const DEFAULT_EXPIRY_DAYS = 7;

export class InvitationService {
  private store = new Map<string, InvitationModel>();

  sendInvitation(
    email: string,
    type: 'educator' | 'student' | 'admin',
    organizationId: string,
    programId?: string,
    data?: Record<string, unknown>,
  ): IInvitation {
    const id = generateId('inv');
    const token = generateToken();
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const invitation = new InvitationModel({ id, email, type, organizationId, programId, token, status: 'pending', data, expiresAt });
    this.store.set(id, invitation);
    return invitation.toJSON();
  }

  getInvitation(id: string): IInvitation {
    const invitation = this.store.get(id);
    if (!invitation) throw new Error(`Invitation not found: ${id}`);
    return invitation.toJSON();
  }

  getInvitationByToken(token: string): IInvitation {
    const invitation = Array.from(this.store.values()).find(i => i.token === token);
    if (!invitation) throw new Error(`Invitation not found for token`);
    return invitation.toJSON();
  }

  acceptInvitation(token: string): IInvitation {
    const invitation = Array.from(this.store.values()).find(i => i.token === token);
    if (!invitation) throw new Error('Invalid invitation token');
    if (invitation.status !== 'pending') throw new Error(`Invitation is already ${invitation.status}`);
    if (invitation.expiresAt < new Date()) throw new Error('Invitation has expired');
    invitation.status = 'accepted';
    invitation.updatedAt = new Date();
    return invitation.toJSON();
  }

  rejectInvitation(token: string): void {
    const invitation = Array.from(this.store.values()).find(i => i.token === token);
    if (!invitation) throw new Error('Invalid invitation token');
    if (invitation.status !== 'pending') throw new Error(`Invitation is already ${invitation.status}`);
    invitation.status = 'rejected';
    invitation.updatedAt = new Date();
  }

  listInvitations(organizationId?: string, status?: IInvitation['status']): IInvitation[] {
    return Array.from(this.store.values())
      .filter(i => (!organizationId || i.organizationId === organizationId) && (!status || i.status === status))
      .map(i => i.toJSON());
  }
}
