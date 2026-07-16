import { base44 } from '@/api/base44Client';
import type { IFaculty } from '../../types/university';

function mapToFaculty(raw: Record<string, unknown>): IFaculty {
  return {
    id: String(raw.id || ''),
    universityId: String(raw.university_id || ''),
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    description: raw.description ? String(raw.description) : undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const FacultyModel = {
  async findById(id: string): Promise<IFaculty | null> {
    try {
      const results = await base44.entities.Faculty.filter({ id });
      return results?.length ? mapToFaculty(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByCode(universityId: string, code: string): Promise<IFaculty | null> {
    try {
      const results = await base44.entities.Faculty.filter({ university_id: universityId, code });
      return results?.length ? mapToFaculty(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(universityId?: string): Promise<IFaculty[]> {
    try {
      const results = universityId ? await base44.entities.Faculty.filter({ university_id: universityId }) : await base44.entities.Faculty.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToFaculty(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IFaculty, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFaculty> {
    const raw = await base44.entities.Faculty.create({
      university_id: data.universityId,
      name: data.name,
      code: data.code,
      description: data.description,
    });
    return mapToFaculty(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IFaculty, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IFaculty> {
    const updates: Record<string, unknown> = {};
    if (data.universityId !== undefined) updates.university_id = data.universityId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.description !== undefined) updates.description = data.description;

    const raw = await base44.entities.Faculty.update(id, updates);
    return mapToFaculty(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.Faculty.delete(id);
  },
};
