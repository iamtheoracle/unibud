/**
 * Domain: Identity — Student Model
 *
 * Data access layer — wraps the EduStudent Base44 entity.
 */

import { base44 } from '@/api/base44Client';

export const StudentModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduStudent.create(data);
  },
  async get(id: string) {
    return base44.entities.EduStudent.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduStudent.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduStudent.filter(filters ?? {});
  },
};

export const StudentContextModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduStudentContext.create(data);
  },
  async get(id: string) {
    return base44.entities.EduStudentContext.get(id);
  },
  async delete(id: string) {
    return base44.entities.EduStudentContext.delete(id);
  },
  async listByStudent(studentId: string) {
    return base44.entities.EduStudentContext.filter({ student_id: studentId });
  },
};
