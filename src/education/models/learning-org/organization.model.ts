import { base44 } from '@/api/base44Client';
import type { ILearningOrganization } from '../../types/learning-org';

function mapToOrganization(raw: Record<string, unknown>): ILearningOrganization {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    type: (raw.type as ILearningOrganization['type']) || 'academy',
    description: raw.description ? String(raw.description) : undefined,
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const LearningOrganizationModel = {
  async findById(id: string): Promise<ILearningOrganization | null> {
    try {
      const results = await base44.entities.LearningOrganization.filter({ id });
      return results?.length ? mapToOrganization(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByName(name: string): Promise<ILearningOrganization | null> {
    try {
      const results = await base44.entities.LearningOrganization.filter({ name });
      return results?.length ? mapToOrganization(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(type?: ILearningOrganization['type']): Promise<ILearningOrganization[]> {
    try {
      const results = type ? await base44.entities.LearningOrganization.filter({ type }) : await base44.entities.LearningOrganization.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToOrganization(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<ILearningOrganization, 'id' | 'createdAt' | 'updatedAt'>): Promise<ILearningOrganization> {
    const raw = await base44.entities.LearningOrganization.create({
      name: data.name,
      type: data.type,
      description: data.description,
      metadata: data.metadata,
    });
    return mapToOrganization(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<ILearningOrganization, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ILearningOrganization> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.type !== undefined) updates.type = data.type;
    if (data.description !== undefined) updates.description = data.description;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.LearningOrganization.update(id, updates);
    return mapToOrganization(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.LearningOrganization.delete(id);
  },
};
