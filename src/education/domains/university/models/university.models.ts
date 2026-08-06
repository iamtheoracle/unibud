/**
 * Domain: University — Models
 *
 * Data access layer — wraps Base44 entities.
 */

import { base44 } from '@/api/base44Client';

export const UniversityModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduUniversity.create(data);
  },
  async get(id: string) {
    return base44.entities.EduUniversity.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduUniversity.update(id, data);
  },
  async list() {
    return base44.entities.EduUniversity.filter({});
  },
  async delete(id: string) {
    return base44.entities.EduUniversity.delete(id);
  },
};

export const FacultyModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduFaculty.create(data);
  },
  async get(id: string) {
    return base44.entities.EduFaculty.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduFaculty.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduFaculty.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduFaculty.delete(id);
  },
};

export const DepartmentModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduDepartment.create(data);
  },
  async get(id: string) {
    return base44.entities.EduDepartment.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduDepartment.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduDepartment.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduDepartment.delete(id);
  },
};

export const UniCourseModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduCourse.create(data);
  },
  async get(id: string) {
    return base44.entities.EduCourse.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduCourse.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduCourse.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduCourse.delete(id);
  },
};
