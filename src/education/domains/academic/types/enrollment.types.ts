/**
 * Domain: Academic — Enrollment Types
 */

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  approvedAt?: Date;
  withdrawnAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListEnrollmentsFilter {
  studentId?: string;
  classId?: string;
}
