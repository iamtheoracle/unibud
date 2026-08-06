import type { ILearningOrgStudent } from '../../types/learning-org';

export class LearningOrgStudentModel implements ILearningOrgStudent {
  id: string;
  userId: string;
  organizationId: string;
  programId: string;
  enrollmentNumber?: string;
  status: 'active' | 'inactive' | 'completed' | 'withdrawn';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<ILearningOrgStudent, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.userId = data.userId;
    this.organizationId = data.organizationId;
    this.programId = data.programId;
    this.enrollmentNumber = data.enrollmentNumber;
    this.status = data.status ?? 'active';
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): ILearningOrgStudent {
    return {
      id: this.id,
      userId: this.userId,
      organizationId: this.organizationId,
      programId: this.programId,
      enrollmentNumber: this.enrollmentNumber,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
