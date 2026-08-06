/**
 * Education Module — Invitation Service
 */

import type {
  IInvitation,
  IInvitationService,
  InvitationType,
} from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId, generateToken } from '../utils.js';

const INVITATION_TTL_HOURS = 72;

export class InvitationService implements IInvitationService {
  private readonly store: Map<string, IInvitation> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('InvitationService');
  }

  sendInvitation(
    email: string,
    type: InvitationType,
    orgId?: string,
    programId?: string,
    data?: Record<string, unknown>,
  ): IInvitation {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
    const invitation: IInvitation = {
      id: generateId(),
      email,
      token: generateToken(),
      type,
      organizationId: orgId,
      programId,
      status: 'pending',
      data,
      expiresAt,
      createdAt: now,
    };
    this.store.set(invitation.id, invitation);
    this.logger.info('invitation.sent', { id: invitation.id, email, type, orgId });
    return invitation;
  }

  getInvitation(token: string): IInvitation {
    const invitation = [...this.store.values()].find((i) => i.token === token);
    if (!invitation) throw new Error(`Invitation not found for token`);
    return invitation;
  }

  acceptInvitation(token: string): IInvitation {
    const invitation = this.getInvitation(token);
    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is not pending (status: ${invitation.status})`);
    }
    if (new Date() > invitation.expiresAt) {
      throw new Error('Invitation has expired');
    }
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    this.store.set(invitation.id, invitation);
    this.logger.info('invitation.accepted', { id: invitation.id, email: invitation.email });
    return invitation;
  }

  rejectInvitation(token: string): void {
    const invitation = this.getInvitation(token);
    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is not pending (status: ${invitation.status})`);
    }
    invitation.status = 'rejected';
    this.store.set(invitation.id, invitation);
    this.logger.info('invitation.rejected', { id: invitation.id });
  }

  listInvitations(orgId?: string): IInvitation[] {
    const all = [...this.store.values()];
    if (orgId === undefined) return all;
    return all.filter((i) => i.organizationId === orgId);
  }

  revokeInvitation(id: string): void {
    const invitation = this.store.get(id);
    if (!invitation) throw new Error(`Invitation not found: ${id}`);
    invitation.status = 'revoked';
    this.store.set(id, invitation);
    this.logger.info('invitation.revoked', { id });
  }
}
