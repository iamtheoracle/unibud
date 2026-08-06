/**
 * Domain: University — DepartmentService
 */

import { DepartmentModel, FacultyModel } from '../models/university.models';
import type { IDepartment, CreateDepartmentInput, UpdateDepartmentInput } from '../types';

export const DepartmentService = {
  async createDepartment(input: CreateDepartmentInput): Promise<IDepartment> {
    const record = await DepartmentModel.create({
      faculty_id: input.facultyId,
      name: input.name,
      code: input.code,
      courses: [],
      metadata: input.metadata ?? {},
    });
    // Register department on the faculty
    const faculty = await FacultyModel.get(input.facultyId);
    const departments: string[] = Array.isArray(faculty.departments) ? faculty.departments : [];
    await FacultyModel.update(input.facultyId, {
      departments: [...departments, record.id as string],
    });
    return mapDepartment(record);
  },

  async getDepartment(id: string): Promise<IDepartment> {
    const record = await DepartmentModel.get(id);
    return mapDepartment(record);
  },

  async updateDepartment(id: string, data: UpdateDepartmentInput): Promise<IDepartment> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await DepartmentModel.update(id, updates);
    return mapDepartment(record);
  },

  async listDepartments(facultyId?: string): Promise<IDepartment[]> {
    const filters = facultyId ? { faculty_id: facultyId } : {};
    const records = await DepartmentModel.list(filters);
    return records.map(mapDepartment);
  },

  async deleteDepartment(id: string): Promise<void> {
    await DepartmentModel.delete(id);
  },
};

function mapDepartment(r: Record<string, unknown>): IDepartment {
  return {
    id: r.id as string,
    facultyId: r.faculty_id as string,
    name: r.name as string,
    code: r.code as string,
    courses: (r.courses as string[]) ?? [],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
