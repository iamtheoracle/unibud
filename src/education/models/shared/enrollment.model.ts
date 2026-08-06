import type { IEnrollment } from '../../types/shared';

export class EnrollmentModel implements IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'withdrawn';
  enrolledAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IEnrollment, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.classId = data.classId;
    this.status = data.status ?? 'pending';
    this.enrolledAt = data.enrolledAt ?? new Date();
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IEnrollment {
    return {
      id: this.id,
      studentId: this.studentId,
      classId: this.classId,
      status: this.status,
      enrolledAt: this.enrolledAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
