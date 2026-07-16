import { base44 } from '@/api/base44Client';
import type { IEducator, IEducatorContext } from '../../types/shared';

function mapToEducator(raw: Record<string, unknown>): IEducator {
  return {
    id: String(raw.id || ''),
    userId: String(raw.user_id || ''),
    firstName: String(raw.first_name || ''),
    lastName: String(raw.last_name || ''),
    email: String(raw.email || ''),
    bio: raw.bio ? String(raw.bio) : undefined,
    qualifications: Array.isArray(raw.qualifications) ? raw.qualifications.map((value) => String(value)) : undefined,
    status: (raw.status as IEducator['status']) || 'active',
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

function mapToEducatorContext(raw: Record<string, unknown>): IEducatorContext {
  return {
    id: String(raw.id || ''),
    educatorId: String(raw.educator_id || ''),
    contextType: (raw.context_type as IEducatorContext['contextType']) || 'university',
    contextId: String(raw.context_id || ''),
    assignedAt: new Date(String(raw.assigned_at || Date.now())),
  };
}

export const EducatorModel = {
  async findById(id: string): Promise<IEducator | null> {
    try {
      const results = await base44.entities.Educator.filter({ id });
      return results?.length ? mapToEducator(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByEmail(email: string): Promise<IEducator | null> {
    try {
      const results = await base44.entities.Educator.filter({ email });
      return results?.length ? mapToEducator(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(): Promise<IEducator[]> {
    try {
      const results = await base44.entities.Educator.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToEducator(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IEducator, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEducator> {
    const raw = await base44.entities.Educator.create({
      user_id: data.userId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      bio: data.bio,
      qualifications: data.qualifications,
      status: data.status,
      metadata: data.metadata,
    });
    return mapToEducator(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IEducator, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IEducator> {
    const updates: Record<string, unknown> = {};
    if (data.userId !== undefined) updates.user_id = data.userId;
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName !== undefined) updates.last_name = data.lastName;
    if (data.email !== undefined) updates.email = data.email;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.qualifications !== undefined) updates.qualifications = data.qualifications;
    if (data.status !== undefined) updates.status = data.status;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.Educator.update(id, updates);
    return mapToEducator(raw as Record<string, unknown>);
  },

  async findContexts(educatorId: string): Promise<IEducatorContext[]> {
    try {
      const results = await base44.entities.EducatorContext.filter({ educator_id: educatorId });
      return (results || []).map((raw: Record<string, unknown>) => mapToEducatorContext(raw));
    } catch {
      return [];
    }
  },

  async createContext(data: Omit<IEducatorContext, 'id'>): Promise<IEducatorContext> {
    const raw = await base44.entities.EducatorContext.create({
      educator_id: data.educatorId,
      context_type: data.contextType,
      context_id: data.contextId,
      assigned_at: data.assignedAt.toISOString(),
    });
    return mapToEducatorContext(raw as Record<string, unknown>);
  },

  async deleteContext(id: string): Promise<void> {
    await base44.entities.EducatorContext.delete(id);
  },
};
