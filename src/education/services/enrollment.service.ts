/**
 * Education Module — Enrollment Service
 */

import type { IEnrollment, IEnrollmentService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class EnrollmentService implements IEnrollmentService {
  private readonly store: Map<string, IEnrollment> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('EnrollmentService');
  }

  enrollInClass(studentId: string, classId: string): IEnrollment {
    const existing = [...this.store.values()].find(
      (e) => e.studentId === studentId && e.classId === classId && e.status !== 'withdrawn',
    );
    if (existing) throw new Error(`Student ${studentId} is already enrolled in class ${classId}`);

    const now = new Date();
    const enrollment: IEnrollment = {
      id: generateId(),
      studentId,
      classId,
      status: 'pending',
      enrolledAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(enrollment.id, enrollment);
    this.logger.info('enrollment.created', { id: enrollment.id, studentId, classId });
    return enrollment;
  }

  getEnrollment(id: string): IEnrollment {
    const enrollment = this.store.get(id);
    if (!enrollment) throw new Error(`Enrollment not found: ${id}`);
    return enrollment;
  }

  listEnrollments(studentId?: string, classId?: string): IEnrollment[] {
    return [...this.store.values()].filter(
      (e) =>
        (studentId === undefined || e.studentId === studentId) &&
        (classId === undefined || e.classId === classId),
    );
  }

  withdrawFromClass(studentId: string, classId: string): void {
    const enrollment = [...this.store.values()].find(
      (e) => e.studentId === studentId && e.classId === classId && e.status !== 'withdrawn',
    );
    if (!enrollment) throw new Error(`No active enrollment for student ${studentId} in class ${classId}`);
    enrollment.status = 'withdrawn';
    enrollment.withdrawnAt = new Date();
    enrollment.updatedAt = new Date();
    this.store.set(enrollment.id, enrollment);
    this.logger.info('enrollment.withdrawn', { id: enrollment.id, studentId, classId });
  }

  approveEnrollment(enrollmentId: string): void {
    const enrollment = this.getEnrollment(enrollmentId);
    if (enrollment.status !== 'pending') {
      throw new Error(`Enrollment ${enrollmentId} is not pending (status: ${enrollment.status})`);
    }
    enrollment.status = 'approved';
    enrollment.approvedAt = new Date();
    enrollment.updatedAt = new Date();
    this.store.set(enrollmentId, enrollment);
    this.logger.info('enrollment.approved', { id: enrollmentId });
  }

  rejectEnrollment(enrollmentId: string): void {
    const enrollment = this.getEnrollment(enrollmentId);
    if (enrollment.status !== 'pending') {
      throw new Error(`Enrollment ${enrollmentId} is not pending (status: ${enrollment.status})`);
    }
    enrollment.status = 'rejected';
    enrollment.updatedAt = new Date();
    this.store.set(enrollmentId, enrollment);
    this.logger.info('enrollment.rejected', { id: enrollmentId });
  }
}
