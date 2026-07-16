import { EducatorModel } from '../../models/shared/educator.model';
import { InvitationModel } from '../../models/shared/invitation.model';
import { StudentModel } from '../../models/shared/student.model';
import type { IEducator, IInvitation, IStudent } from '../../types/shared';

function createToken(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    void password;
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
      user = existing ?? await StudentModel.create({
        userId: '',
        email: invitation.email,
        firstName: names.firstName,
        lastName: names.lastName,
        status: 'active',
      });
    } else {
      const existing = await EducatorModel.findByEmail(invitation.email);
      user = existing ?? await EducatorModel.create({
        userId: '',
        email: invitation.email,
        firstName: names.firstName,
        lastName: names.lastName,
        status: 'active',
      });
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
