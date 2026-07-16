import { EducatorModel } from '../../models/shared/educator.model';
import { InvitationModel } from '../../models/shared/invitation.model';
import { StudentModel } from '../../models/shared/student.model';
import type { IEducator, IInvitation, IStudent } from '../../types/shared';

function createToken(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Node.js < 19 fallback: use crypto.randomBytes via dynamic import is async,
  // so we fall back to a hex string built from crypto.getRandomValues if available.
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function deriveNames(email: string): { firstName: string; lastName: string } {
  const localPart = email.split('@')[0] || 'user';
  const [first, ...rest] = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1));

  return {
    firstName: first || 'Invited',
    lastName: rest.join(' ') || 'User',
  };
}

export class InvitationService {
  async sendInvitation(
    email: string,
    type: IInvitation['type'],
    organizationId: string,
    programId?: string
  ): Promise<IInvitation> {
    return InvitationModel.create({
      email,
      type,
      organizationId,
      programId,
      token: createToken(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  async acceptInvitation(token: string, password: string): Promise<IStudent | IEducator> {
    // password is accepted for forward-compatibility: callers may provide it
    // so that auth integrations can set it during account creation. It is not
    // consumed here because identity management belongs to the Oracle layer.
    const invitation = await InvitationModel.findByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    if (invitation.status !== 'pending') {
      throw new Error(`Invitation ${invitation.id} is not pending`);
    }
    if (invitation.expiresAt.getTime() < Date.now()) {
      await InvitationModel.update(invitation.id, { status: 'expired' });
      throw new Error('Invitation has expired');
    }

    const names = deriveNames(invitation.email);
    let user: IStudent | IEducator;

    if (invitation.type === 'student') {
      const existing = await StudentModel.findByEmail(invitation.email);
      if (existing) {
        user = existing;
      } else {
        user = await StudentModel.create({
          userId: '',
          email: invitation.email,
          firstName: names.firstName,
          lastName: names.lastName,
          status: 'active',
        });
      }
    } else {
      const existing = await EducatorModel.findByEmail(invitation.email);
      if (existing) {
        user = existing;
      } else {
        user = await EducatorModel.create({
          userId: '',
          email: invitation.email,
          firstName: names.firstName,
          lastName: names.lastName,
          status: 'active',
        });
      }
    }

    await InvitationModel.update(invitation.id, { status: 'accepted' });
    return user;
  }

  async rejectInvitation(token: string): Promise<void> {
    const invitation = await InvitationModel.findByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    await InvitationModel.update(invitation.id, { status: 'rejected' });
  }
}

export const invitationService = new InvitationService();
