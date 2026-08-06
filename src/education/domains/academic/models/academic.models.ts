/**
 * Domain: Academic — Models
 *
 * Data access layer — wraps Base44 entities.
 */

import { base44 } from '@/api/base44Client';

export const AcademicProgramModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduAcademicProgram.create(data);
  },
  async get(id: string) {
    return base44.entities.EduAcademicProgram.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduAcademicProgram.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduAcademicProgram.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduAcademicProgram.delete(id);
  },
};

export const SubjectModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduSubject.create(data);
  },
  async get(id: string) {
    return base44.entities.EduSubject.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduSubject.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduSubject.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduSubject.delete(id);
  },
};

export const ClassModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduClass.create(data);
  },
  async get(id: string) {
    return base44.entities.EduClass.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduClass.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduClass.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduClass.delete(id);
  },
};

export const EnrollmentModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduEnrollment.create(data);
  },
  async get(id: string) {
    return base44.entities.EduEnrollment.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduEnrollment.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduEnrollment.filter(filters ?? {});
  },
};
