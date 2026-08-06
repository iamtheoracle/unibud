/**
 * Domain: Academic — ProgramService
 */

import { AcademicProgramModel } from '../models/academic.models';
import type { IProgram, CreateProgramInput, UpdateProgramInput } from '../types/program.types';

export const ProgramService = {
  async createProgram(input: CreateProgramInput): Promise<IProgram> {
    const record = await AcademicProgramModel.create({
      name: input.name,
      code: input.code,
      type: input.type,
      description: input.description,
      subjects: [],
      metadata: input.metadata ?? {},
    });
    return mapProgram(record);
  },

  async getProgram(id: string): Promise<IProgram> {
    const record = await AcademicProgramModel.get(id);
    return mapProgram(record);
  },

  async updateProgram(id: string, data: UpdateProgramInput): Promise<IProgram> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.type !== undefined) updates.type = data.type;
    if (data.description !== undefined) updates.description = data.description;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await AcademicProgramModel.update(id, updates);
    return mapProgram(record);
  },

  async listPrograms(type?: string): Promise<IProgram[]> {
    const filters = type ? { type } : {};
    const records = await AcademicProgramModel.list(filters);
    return records.map(mapProgram);
  },

  async deleteProgram(id: string): Promise<void> {
    await AcademicProgramModel.delete(id);
  },

  async addSubject(programId: string, subjectId: string): Promise<void> {
    const program = await AcademicProgramModel.get(programId);
    const subjects: string[] = Array.isArray(program.subjects) ? program.subjects : [];
    if (!subjects.includes(subjectId)) {
      await AcademicProgramModel.update(programId, { subjects: [...subjects, subjectId] });
    }
  },

  async removeSubject(programId: string, subjectId: string): Promise<void> {
    const program = await AcademicProgramModel.get(programId);
    const subjects: string[] = Array.isArray(program.subjects) ? program.subjects : [];
    await AcademicProgramModel.update(programId, {
      subjects: subjects.filter((s) => s !== subjectId),
    });
  },
};

function mapProgram(r: Record<string, unknown>): IProgram {
  return {
    id: r.id as string,
    name: r.name as string,
    code: r.code as string,
    type: r.type as string,
    description: r.description as string | undefined,
    subjects: (r.subjects as string[]) ?? [],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
