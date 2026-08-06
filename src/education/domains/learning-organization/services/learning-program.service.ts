/**
 * Domain: Learning Organization — LearningProgramService
 */

import { LearningProgramModel } from '../models/learning-org.models';
import type {
  ILearningProgram,
  CreateLearningProgramInput,
  UpdateLearningProgramInput,
} from '../types';

export const LearningProgramService = {
  async createProgram(input: CreateLearningProgramInput): Promise<ILearningProgram> {
    const record = await LearningProgramModel.create({
      organization_id: input.organizationId,
      program_id: input.programId,
      start_date: input.startDate.toISOString(),
      end_date: input.endDate.toISOString(),
      status: 'active',
      metadata: input.metadata ?? {},
    });
    return mapProgram(record);
  },

  async getProgram(id: string): Promise<ILearningProgram> {
    const record = await LearningProgramModel.get(id);
    return mapProgram(record);
  },

  async updateProgram(id: string, data: UpdateLearningProgramInput): Promise<ILearningProgram> {
    const updates: Record<string, unknown> = {};
    if (data.startDate !== undefined) updates.start_date = data.startDate.toISOString();
    if (data.endDate !== undefined) updates.end_date = data.endDate.toISOString();
    if (data.status !== undefined) updates.status = data.status;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await LearningProgramModel.update(id, updates);
    return mapProgram(record);
  },

  async listPrograms(organizationId?: string): Promise<ILearningProgram[]> {
    const filters = organizationId ? { organization_id: organizationId } : {};
    const records = await LearningProgramModel.list(filters);
    return records.map(mapProgram);
  },

  async deleteProgram(id: string): Promise<void> {
    await LearningProgramModel.delete(id);
  },
};

function mapProgram(r: Record<string, unknown>): ILearningProgram {
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    programId: r.program_id as string,
    startDate: new Date(r.start_date as string),
    endDate: new Date(r.end_date as string),
    status: (r.status as ILearningProgram['status']) ?? 'active',
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
