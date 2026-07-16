import { base44 } from '@/api/base44Client';
import type { IEnrollment } from '../../types/shared';

function mapToEnrollment(raw: Record<string, unknown>): IEnrollment {
  return {
    id: String(raw.id || ''),
    studentId: String(raw.student_id || ''),
    classId: String(raw.class_id || ''),
    status: (raw.status as IEnrollment['status']) || 'pending',
    enrolledAt: new Date(String(raw.enrolled_at || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const EnrollmentModel = {
  async findById(id: string): Promise<IEnrollment | null> {
    try {
      const results = await base44.entities.Enrollment.filter({ id });
      return results?.length ? mapToEnrollment(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByStudentAndClass(studentId: string, classId: string): Promise<IEnrollment | null> {
    try {
      const results = await base44.entities.Enrollment.filter({ student_id: studentId, class_id: classId });
      return results?.length ? mapToEnrollment(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(filters?: { studentId?: string; classId?: string }): Promise<IEnrollment[]> {
    try {
      const query: Record<string, string> = {};
      if (filters?.studentId) query.student_id = filters.studentId;
      if (filters?.classId) query.class_id = filters.classId;
      const results = Object.keys(query).length ? await base44.entities.Enrollment.filter(query) : await base44.entities.Enrollment.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToEnrollment(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IEnrollment, 'id' | 'updatedAt'>): Promise<IEnrollment> {
    const raw = await base44.entities.Enrollment.create({
      student_id: data.studentId,
      class_id: data.classId,
      status: data.status,
      enrolled_at: data.enrolledAt.toISOString(),
    });
    return mapToEnrollment(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IEnrollment, 'id' | 'enrolledAt' | 'updatedAt'>>): Promise<IEnrollment> {
    const updates: Record<string, unknown> = {};
    if (data.studentId !== undefined) updates.student_id = data.studentId;
    if (data.classId !== undefined) updates.class_id = data.classId;
    if (data.status !== undefined) updates.status = data.status;

    const raw = await base44.entities.Enrollment.update(id, updates);
    return mapToEnrollment(raw as Record<string, unknown>);
  },
};
