import { base44 } from '@/api/base44Client';
import type { IUniversity } from '../../types/university';

function mapToUniversity(raw: Record<string, unknown>): IUniversity {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    description: raw.description ? String(raw.description) : undefined,
    faculties: Array.isArray(raw.faculties) ? raw.faculties.map((value) => String(value)) : [],
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const UniversityModel = {
  async findById(id: string): Promise<IUniversity | null> {
    try {
      const results = await base44.entities.University.filter({ id });
      return results?.length ? mapToUniversity(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByCode(code: string): Promise<IUniversity | null> {
    try {
      const results = await base44.entities.University.filter({ code });
      return results?.length ? mapToUniversity(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(): Promise<IUniversity[]> {
    try {
      const results = await base44.entities.University.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToUniversity(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IUniversity, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUniversity> {
    const raw = await base44.entities.University.create({
      name: data.name,
      code: data.code,
      description: data.description,
      faculties: data.faculties,
      metadata: data.metadata,
    });
    return mapToUniversity(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IUniversity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IUniversity> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.description !== undefined) updates.description = data.description;
    if (data.faculties !== undefined) updates.faculties = data.faculties;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.University.update(id, updates);
    return mapToUniversity(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.University.delete(id);
  },
};
