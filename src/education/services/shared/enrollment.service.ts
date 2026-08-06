import type { IEnrollment } from '../../types/shared';
import { EnrollmentModel } from '../../models/shared/enrollment.model';
import { generateId } from '../../utils';

export class EnrollmentService {
  private store = new Map<string, EnrollmentModel>();

  enrollInClass(studentId: string, classId: string, metadata?: Record<string, unknown>): IEnrollment {
    const existing = Array.from(this.store.values()).find(
      e => e.studentId === studentId && e.classId === classId && e.status !== 'withdrawn'
    );
    if (existing) throw new Error(`Student ${studentId} is already enrolled in class ${classId}`);
    const id = generateId('enr');
    const enrollment = new EnrollmentModel({ id, studentId, classId, status: 'pending', enrolledAt: new Date(), metadata });
    this.store.set(id, enrollment);
    return enrollment.toJSON();
  }

  getEnrollment(id: string): IEnrollment {
    const enrollment = this.store.get(id);
    if (!enrollment) throw new Error(`Enrollment not found: ${id}`);
    return enrollment.toJSON();
  }

  listEnrollments(studentId?: string, classId?: string): IEnrollment[] {
    return Array.from(this.store.values())
      .filter(e => (!studentId || e.studentId === studentId) && (!classId || e.classId === classId))
      .map(e => e.toJSON());
  }

  withdrawFromClass(studentId: string, classId: string): void {
    const enrollment = Array.from(this.store.values()).find(
      e => e.studentId === studentId && e.classId === classId && e.status !== 'withdrawn'
    );
    if (!enrollment) throw new Error(`No active enrollment found for student ${studentId} in class ${classId}`);
    enrollment.status = 'withdrawn';
    enrollment.updatedAt = new Date();
  }

  approveEnrollment(enrollmentId: string): void {
    const enrollment = this.store.get(enrollmentId);
    if (!enrollment) throw new Error(`Enrollment not found: ${enrollmentId}`);
    if (enrollment.status === 'withdrawn') throw new Error('Cannot approve a withdrawn enrollment');
    enrollment.status = 'approved';
    enrollment.updatedAt = new Date();
  }
}
