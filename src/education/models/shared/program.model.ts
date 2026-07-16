import { base44 } from '@/api/base44Client';
import type { IAcademicProgram } from '../../types/shared';

function mapToProgram(raw: Record<string, unknown>): IAcademicProgram {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    type: String(raw.type || ''),
    description: raw.description ? String(raw.description) : undefined,
    subjects: Array.isArray(raw.subjects) ? raw.subjects.map((value) => String(value)) : [],
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const ProgramModel = {
  async findById(id: string): Promise<IAcademicProgram | null> {
    try {
      const results = await base44.entities.AcademicProgram.filter({ id });
      return results?.length ? mapToProgram(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByCode(code: string): Promise<IAcademicProgram | null> {
    try {
      const results = await base44.entities.AcademicProgram.filter({ code });
      return results?.length ? mapToProgram(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(type?: string): Promise<IAcademicProgram[]> {
    try {
      const results = type ? await base44.entities.AcademicProgram.filter({ type }) : await base44.entities.AcademicProgram.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToProgram(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IAcademicProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAcademicProgram> {
    const raw = await base44.entities.AcademicProgram.create({
      name: data.name,
      code: data.code,
      type: data.type,
      description: data.description,
      subjects: data.subjects,
      metadata: data.metadata,
    });
    return mapToProgram(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IAcademicProgram, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IAcademicProgram> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.type !== undefined) updates.type = data.type;
    if (data.description !== undefined) updates.description = data.description;
    if (data.subjects !== undefined) updates.subjects = data.subjects;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.AcademicProgram.update(id, updates);
    return mapToProgram(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.AcademicProgram.delete(id);
  },
};
