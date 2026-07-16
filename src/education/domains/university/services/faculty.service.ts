/**
 * Domain: University — FacultyService
 */

import { FacultyModel, UniversityModel } from '../models/university.models';
import type { IFaculty, CreateFacultyInput, UpdateFacultyInput } from '../types';

export const FacultyService = {
  async createFaculty(input: CreateFacultyInput): Promise<IFaculty> {
    const record = await FacultyModel.create({
      university_id: input.universityId,
      name: input.name,
      code: input.code,
      departments: [],
      metadata: input.metadata ?? {},
    });
    // Register faculty on the university
    const uni = await UniversityModel.get(input.universityId);
    const faculties: string[] = Array.isArray(uni.faculties) ? uni.faculties : [];
    await UniversityModel.update(input.universityId, {
      faculties: [...faculties, record.id as string],
    });
    return mapFaculty(record);
  },

  async getFaculty(id: string): Promise<IFaculty> {
    const record = await FacultyModel.get(id);
    return mapFaculty(record);
  },

  async updateFaculty(id: string, data: UpdateFacultyInput): Promise<IFaculty> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await FacultyModel.update(id, updates);
    return mapFaculty(record);
  },

  async listFaculties(universityId?: string): Promise<IFaculty[]> {
    const filters = universityId ? { university_id: universityId } : {};
    const records = await FacultyModel.list(filters);
    return records.map(mapFaculty);
  },

  async deleteFaculty(id: string): Promise<void> {
    await FacultyModel.delete(id);
  },
};

function mapFaculty(r: Record<string, unknown>): IFaculty {
  return {
    id: r.id as string,
    universityId: r.university_id as string,
    name: r.name as string,
    code: r.code as string,
    departments: (r.departments as string[]) ?? [],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
