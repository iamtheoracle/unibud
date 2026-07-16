import { base44 } from '@/api/base44Client';
import type { ISubject } from '../../types/shared';

function mapToSubject(raw: Record<string, unknown>): ISubject {
  return {
    id: String(raw.id || ''),
    programId: String(raw.program_id || ''),
    code: String(raw.code || ''),
    name: String(raw.name || ''),
    description: raw.description ? String(raw.description) : undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const SubjectModel = {
  async findById(id: string): Promise<ISubject | null> {
    try {
      const results = await base44.entities.Subject.filter({ id });
      return results?.length ? mapToSubject(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByCode(programId: string, code: string): Promise<ISubject | null> {
    try {
      const results = await base44.entities.Subject.filter({ program_id: programId, code });
      return results?.length ? mapToSubject(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(programId?: string): Promise<ISubject[]> {
    try {
      const results = programId ? await base44.entities.Subject.filter({ program_id: programId }) : await base44.entities.Subject.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToSubject(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<ISubject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISubject> {
    const raw = await base44.entities.Subject.create({
      program_id: data.programId,
      code: data.code,
      name: data.name,
      description: data.description,
    });
    return mapToSubject(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<ISubject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ISubject> {
    const updates: Record<string, unknown> = {};
    if (data.programId !== undefined) updates.program_id = data.programId;
    if (data.code !== undefined) updates.code = data.code;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;

    const raw = await base44.entities.Subject.update(id, updates);
    return mapToSubject(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.Subject.delete(id);
  },
};
