/**
 * Domain: Academic — EnrollmentService
 */

import { EnrollmentModel } from '../models/academic.models';
import type { IEnrollment, ListEnrollmentsFilter } from '../types/enrollment.types';

export const EnrollmentService = {
  async enrollInClass(studentId: string, classId: string): Promise<IEnrollment> {
    const record = await EnrollmentModel.create({
      student_id: studentId,
      class_id: classId,
      status: 'pending',
      enrolled_at: new Date().toISOString(),
    });
    return mapEnrollment(record);
  },

  async getEnrollment(id: string): Promise<IEnrollment> {
    const record = await EnrollmentModel.get(id);
    return mapEnrollment(record);
  },

  async listEnrollments(filter?: ListEnrollmentsFilter): Promise<IEnrollment[]> {
    const filters: Record<string, unknown> = {};
    if (filter?.studentId) filters.student_id = filter.studentId;
    if (filter?.classId) filters.class_id = filter.classId;
    const records = await EnrollmentModel.list(filters);
    return records.map(mapEnrollment);
  },

  async withdrawFromClass(studentId: string, classId: string): Promise<void> {
    const records = await EnrollmentModel.list({ student_id: studentId, class_id: classId });
    if (records.length > 0) {
      await EnrollmentModel.update(records[0].id as string, {
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
      });
    }
  },

  async approveEnrollment(enrollmentId: string): Promise<void> {
    await EnrollmentModel.update(enrollmentId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
  },

  async rejectEnrollment(enrollmentId: string): Promise<void> {
    await EnrollmentModel.update(enrollmentId, { status: 'rejected' });
  },
};

function mapEnrollment(r: Record<string, unknown>): IEnrollment {
  return {
    id: r.id as string,
    studentId: r.student_id as string,
    classId: r.class_id as string,
    status: (r.status as IEnrollment['status']) ?? 'pending',
    enrolledAt: new Date(r.enrolled_at as string),
    approvedAt: r.approved_at ? new Date(r.approved_at as string) : undefined,
    withdrawnAt: r.withdrawn_at ? new Date(r.withdrawn_at as string) : undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
