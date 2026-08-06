/**
 * Domain: Academic — SubjectService
 */

import { SubjectModel } from '../models/academic.models';
import type { ISubject, CreateSubjectInput, UpdateSubjectInput } from '../types/subject.types';

export const SubjectService = {
  async createSubject(input: CreateSubjectInput): Promise<ISubject> {
    const record = await SubjectModel.create({
      program_id: input.programId,
      code: input.code,
      name: input.name,
      description: input.description,
      credits: input.credits,
      metadata: input.metadata ?? {},
    });
    return mapSubject(record);
  },

  async getSubject(id: string): Promise<ISubject> {
    const record = await SubjectModel.get(id);
    return mapSubject(record);
  },

  async updateSubject(id: string, data: UpdateSubjectInput): Promise<ISubject> {
    const updates: Record<string, unknown> = {};
    if (data.code !== undefined) updates.code = data.code;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.credits !== undefined) updates.credits = data.credits;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await SubjectModel.update(id, updates);
    return mapSubject(record);
  },

  async listSubjects(programId?: string): Promise<ISubject[]> {
    const filters = programId ? { program_id: programId } : {};
    const records = await SubjectModel.list(filters);
    return records.map(mapSubject);
  },

  async deleteSubject(id: string): Promise<void> {
    await SubjectModel.delete(id);
  },
};

function mapSubject(r: Record<string, unknown>): ISubject {
  return {
    id: r.id as string,
    programId: r.program_id as string,
    code: r.code as string,
    name: r.name as string,
    description: r.description as string | undefined,
    credits: r.credits as number | undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
