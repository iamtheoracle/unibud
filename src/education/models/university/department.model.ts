import { base44 } from '@/api/base44Client';
import type { IDepartment } from '../../types/university';

function mapToDepartment(raw: Record<string, unknown>): IDepartment {
  return {
    id: String(raw.id || ''),
    facultyId: String(raw.faculty_id || ''),
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    description: raw.description ? String(raw.description) : undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const DepartmentModel = {
  async findById(id: string): Promise<IDepartment | null> {
    try {
      const results = await base44.entities.Department.filter({ id });
      return results?.length ? mapToDepartment(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByCode(facultyId: string, code: string): Promise<IDepartment | null> {
    try {
      const results = await base44.entities.Department.filter({ faculty_id: facultyId, code });
      return results?.length ? mapToDepartment(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(facultyId?: string): Promise<IDepartment[]> {
    try {
      const results = facultyId ? await base44.entities.Department.filter({ faculty_id: facultyId }) : await base44.entities.Department.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToDepartment(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IDepartment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDepartment> {
    const raw = await base44.entities.Department.create({
      faculty_id: data.facultyId,
      name: data.name,
      code: data.code,
      description: data.description,
    });
    return mapToDepartment(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IDepartment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IDepartment> {
    const updates: Record<string, unknown> = {};
    if (data.facultyId !== undefined) updates.faculty_id = data.facultyId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.description !== undefined) updates.description = data.description;

    const raw = await base44.entities.Department.update(id, updates);
    return mapToDepartment(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.Department.delete(id);
  },
};
