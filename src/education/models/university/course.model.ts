import { base44 } from '@/api/base44Client';
import type { ICourse } from '../../types/university';

function mapToCourse(raw: Record<string, unknown>): ICourse {
  return {
    id: String(raw.id || ''),
    departmentId: String(raw.department_id || ''),
    code: String(raw.code || ''),
    name: String(raw.name || ''),
    description: raw.description ? String(raw.description) : undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const CourseModel = {
  async findById(id: string): Promise<ICourse | null> {
    try {
      const results = await base44.entities.Course.filter({ id });
      return results?.length ? mapToCourse(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByCode(departmentId: string, code: string): Promise<ICourse | null> {
    try {
      const results = await base44.entities.Course.filter({ department_id: departmentId, code });
      return results?.length ? mapToCourse(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(departmentId?: string): Promise<ICourse[]> {
    try {
      const results = departmentId ? await base44.entities.Course.filter({ department_id: departmentId }) : await base44.entities.Course.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToCourse(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<ICourse, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICourse> {
    const raw = await base44.entities.Course.create({
      department_id: data.departmentId,
      code: data.code,
      name: data.name,
      description: data.description,
    });
    return mapToCourse(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<ICourse, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ICourse> {
    const updates: Record<string, unknown> = {};
    if (data.departmentId !== undefined) updates.department_id = data.departmentId;
    if (data.code !== undefined) updates.code = data.code;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;

    const raw = await base44.entities.Course.update(id, updates);
    return mapToCourse(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.Course.delete(id);
  },
};
