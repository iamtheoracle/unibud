import { base44 } from '@/api/base44Client';
import type { ILearningProgram } from '../../types/learning-org';

function mapToLearningProgram(raw: Record<string, unknown>): ILearningProgram {
  return {
    id: String(raw.id || ''),
    organizationId: String(raw.organization_id || ''),
    programId: String(raw.program_id || ''),
    startDate: new Date(String(raw.start_date || Date.now())),
    endDate: new Date(String(raw.end_date || Date.now())),
    status: (raw.status as ILearningProgram['status']) || 'active',
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const LearningProgramModel = {
  async findById(id: string): Promise<ILearningProgram | null> {
    try {
      const results = await base44.entities.LearningProgram.filter({ id });
      return results?.length ? mapToLearningProgram(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(organizationId?: string): Promise<ILearningProgram[]> {
    try {
      const results = organizationId ? await base44.entities.LearningProgram.filter({ organization_id: organizationId }) : await base44.entities.LearningProgram.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToLearningProgram(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<ILearningProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<ILearningProgram> {
    const raw = await base44.entities.LearningProgram.create({
      organization_id: data.organizationId,
      program_id: data.programId,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      status: data.status,
      metadata: data.metadata,
    });
    return mapToLearningProgram(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<ILearningProgram, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ILearningProgram> {
    const updates: Record<string, unknown> = {};
    if (data.organizationId !== undefined) updates.organization_id = data.organizationId;
    if (data.programId !== undefined) updates.program_id = data.programId;
    if (data.startDate !== undefined) updates.start_date = data.startDate.toISOString();
    if (data.endDate !== undefined) updates.end_date = data.endDate.toISOString();
    if (data.status !== undefined) updates.status = data.status;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.LearningProgram.update(id, updates);
    return mapToLearningProgram(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.LearningProgram.delete(id);
  },
};
