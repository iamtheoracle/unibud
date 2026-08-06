import type { IInvitation } from '../../types/shared';

export class InvitationModel implements IInvitation {
  id: string;
  email: string;
  type: 'educator' | 'student' | 'admin';
  organizationId: string;
  programId?: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  data?: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IInvitation, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.email = data.email;
    this.type = data.type;
    this.organizationId = data.organizationId;
    this.programId = data.programId;
    this.token = data.token;
    this.status = data.status ?? 'pending';
    this.data = data.data;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IInvitation {
    return {
      id: this.id,
      email: this.email,
      type: this.type,
      organizationId: this.organizationId,
      programId: this.programId,
      token: this.token,
      status: this.status,
      data: this.data,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
