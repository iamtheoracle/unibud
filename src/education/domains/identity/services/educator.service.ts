/**
 * Domain: Identity — EducatorService
 *
 * Manages educator identity and context assignment.
 */

import { EducatorModel, EducatorContextModel } from '../models/educator.model';
import type {
  IEducator,
  IEducatorContext,
  RegisterEducatorInput,
  UpdateEducatorInput,
  AssignEducatorContextInput,
} from '../types/educator.types';

export const EducatorService = {
  // ─── Identity Management ──────────────────────────────────────────────────

  async registerEducator(input: RegisterEducatorInput): Promise<IEducator> {
    const record = await EducatorModel.create({
      user_id: input.userId ?? '',
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      bio: input.bio,
      qualifications: input.qualifications ?? [],
      status: 'active',
      metadata: input.metadata ?? {},
    });
    return mapEducator(record);
  },

  async getEducator(id: string): Promise<IEducator> {
    const record = await EducatorModel.get(id);
    return mapEducator(record);
  },

  async updateEducator(id: string, data: UpdateEducatorInput): Promise<IEducator> {
    const updates: Record<string, unknown> = {};
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName !== undefined) updates.last_name = data.lastName;
    if (data.email !== undefined) updates.email = data.email;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.qualifications !== undefined) updates.qualifications = data.qualifications;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await EducatorModel.update(id, updates);
    return mapEducator(record);
  },

  async listEducators(): Promise<IEducator[]> {
    const records = await EducatorModel.list();
    return records.map(mapEducator);
  },

  // ─── Context Management ───────────────────────────────────────────────────

  async getEducatorContexts(educatorId: string): Promise<IEducatorContext[]> {
    const records = await EducatorContextModel.listByEducator(educatorId);
    return records.map(mapEducatorContext);
  },

  async assignToContext(
    educatorId: string,
    input: AssignEducatorContextInput,
  ): Promise<IEducatorContext> {
    const record = await EducatorContextModel.create({
      educator_id: educatorId,
      context_type: input.contextType,
      context_id: input.contextId,
      assigned_at: new Date().toISOString(),
    });
    return mapEducatorContext(record);
  },

  async removeFromContext(contextId: string): Promise<void> {
    await EducatorContextModel.delete(contextId);
  },
};

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapEducator(r: Record<string, unknown>): IEducator {
  return {
    id: r.id as string,
    userId: (r.user_id as string) ?? '',
    firstName: r.first_name as string,
    lastName: r.last_name as string,
    email: r.email as string,
    bio: r.bio as string | undefined,
    qualifications: (r.qualifications as string[]) ?? [],
    status: (r.status as IEducator['status']) ?? 'active',
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}

function mapEducatorContext(r: Record<string, unknown>): IEducatorContext {
  return {
    id: r.id as string,
    educatorId: r.educator_id as string,
    contextType: r.context_type as IEducatorContext['contextType'],
    contextId: r.context_id as string,
    assignedAt: new Date(r.assigned_at as string),
  };
}
