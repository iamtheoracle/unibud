/**
 * Domain: University — UniversityService
 */

import { UniversityModel } from '../models/university.models';
import type {
  IUniversity,
  CreateUniversityInput,
  UpdateUniversityInput,
} from '../types';

export const UniversityService = {
  async createUniversity(input: CreateUniversityInput): Promise<IUniversity> {
    const record = await UniversityModel.create({
      name: input.name,
      code: input.code,
      description: input.description,
      faculties: [],
      metadata: input.metadata ?? {},
    });
    return mapUniversity(record);
  },

  async getUniversity(id: string): Promise<IUniversity> {
    const record = await UniversityModel.get(id);
    return mapUniversity(record);
  },

  async updateUniversity(id: string, data: UpdateUniversityInput): Promise<IUniversity> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.description !== undefined) updates.description = data.description;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await UniversityModel.update(id, updates);
    return mapUniversity(record);
  },

  async listUniversities(): Promise<IUniversity[]> {
    const records = await UniversityModel.list();
    return records.map(mapUniversity);
  },

  async deleteUniversity(id: string): Promise<void> {
    await UniversityModel.delete(id);
  },
};

function mapUniversity(r: Record<string, unknown>): IUniversity {
  return {
    id: r.id as string,
    name: r.name as string,
    code: r.code as string,
    description: r.description as string | undefined,
    faculties: (r.faculties as string[]) ?? [],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
