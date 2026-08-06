/**
 * Domain: University — CourseService
 */

import { UniCourseModel, DepartmentModel } from '../models/university.models';
import type { IUniCourse, CreateUniCourseInput, UpdateUniCourseInput } from '../types';

export const CourseService = {
  async createCourse(input: CreateUniCourseInput): Promise<IUniCourse> {
    const record = await UniCourseModel.create({
      department_id: input.departmentId,
      code: input.code,
      name: input.name,
      description: input.description,
      credits: input.credits,
      metadata: input.metadata ?? {},
    });
    // Register course on the department
    const dept = await DepartmentModel.get(input.departmentId);
    const courses: string[] = Array.isArray(dept.courses) ? dept.courses : [];
    await DepartmentModel.update(input.departmentId, {
      courses: [...courses, record.id as string],
    });
    return mapCourse(record);
  },

  async getCourse(id: string): Promise<IUniCourse> {
    const record = await UniCourseModel.get(id);
    return mapCourse(record);
  },

  async updateCourse(id: string, data: UpdateUniCourseInput): Promise<IUniCourse> {
    const updates: Record<string, unknown> = {};
    if (data.code !== undefined) updates.code = data.code;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.credits !== undefined) updates.credits = data.credits;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await UniCourseModel.update(id, updates);
    return mapCourse(record);
  },

  async listCourses(departmentId?: string): Promise<IUniCourse[]> {
    const filters = departmentId ? { department_id: departmentId } : {};
    const records = await UniCourseModel.list(filters);
    return records.map(mapCourse);
  },

  async deleteCourse(id: string): Promise<void> {
    await UniCourseModel.delete(id);
  },
};

function mapCourse(r: Record<string, unknown>): IUniCourse {
  return {
    id: r.id as string,
    departmentId: r.department_id as string,
    code: r.code as string,
    name: r.name as string,
    description: r.description as string | undefined,
    credits: r.credits as number | undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
