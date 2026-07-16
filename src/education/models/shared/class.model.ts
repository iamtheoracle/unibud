import { base44 } from '@/api/base44Client';
import type { IClass } from '../../types/shared';

function parseCapacity(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (value !== undefined && value !== null && value !== '') {
    const n = Number(value);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

function mapToClass(raw: Record<string, unknown>): IClass {
  return {
    id: String(raw.id || ''),
    programId: String(raw.program_id || ''),
    subjectId: String(raw.subject_id || ''),
    educatorId: String(raw.educator_id || ''),
    organizationId: raw.organization_id ? String(raw.organization_id) : undefined,
    name: String(raw.name || ''),
    code: raw.code ? String(raw.code) : undefined,
    schedule: (raw.schedule as Record<string, unknown>) || undefined,
    capacity: parseCapacity(raw.capacity),
    students: Array.isArray(raw.students) ? raw.students.map((value) => String(value)) : [],
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

export const ClassModel = {
  async findById(id: string): Promise<IClass | null> {
    try {
      const results = await base44.entities.Class.filter({ id });
      return results?.length ? mapToClass(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(filters?: { programId?: string; educatorId?: string; organizationId?: string }): Promise<IClass[]> {
    try {
      const query: Record<string, string> = {};
      if (filters?.programId) query.program_id = filters.programId;
      if (filters?.educatorId) query.educator_id = filters.educatorId;
      if (filters?.organizationId) query.organization_id = filters.organizationId;

      const results = Object.keys(query).length ? await base44.entities.Class.filter(query) : await base44.entities.Class.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToClass(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IClass, 'id' | 'createdAt' | 'updatedAt'>): Promise<IClass> {
    const raw = await base44.entities.Class.create({
      program_id: data.programId,
      subject_id: data.subjectId,
      educator_id: data.educatorId,
      organization_id: data.organizationId,
      name: data.name,
      code: data.code,
      schedule: data.schedule,
      capacity: data.capacity,
      students: data.students,
      metadata: data.metadata,
    });
    return mapToClass(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IClass, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IClass> {
    const updates: Record<string, unknown> = {};
    if (data.programId !== undefined) updates.program_id = data.programId;
    if (data.subjectId !== undefined) updates.subject_id = data.subjectId;
    if (data.educatorId !== undefined) updates.educator_id = data.educatorId;
    if (data.organizationId !== undefined) updates.organization_id = data.organizationId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.schedule !== undefined) updates.schedule = data.schedule;
    if (data.capacity !== undefined) updates.capacity = data.capacity;
    if (data.students !== undefined) updates.students = data.students;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.Class.update(id, updates);
    return mapToClass(raw as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    await base44.entities.Class.delete(id);
  },
};
