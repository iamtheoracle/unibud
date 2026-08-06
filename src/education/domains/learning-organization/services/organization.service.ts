/**
 * Domain: Learning Organization — LearningOrganizationService
 */

import { LearningOrganizationModel } from '../models/learning-org.models';
import type {
  ILearningOrganization,
  LearningOrganizationType,
  CreateLearningOrganizationInput,
  UpdateLearningOrganizationInput,
} from '../types';

export const LearningOrganizationService = {
  async createOrganization(
    input: CreateLearningOrganizationInput,
  ): Promise<ILearningOrganization> {
    const record = await LearningOrganizationModel.create({
      name: input.name,
      type: input.type,
      description: input.description,
      metadata: input.metadata ?? {},
    });
    return mapOrganization(record);
  },

  async getOrganization(id: string): Promise<ILearningOrganization> {
    const record = await LearningOrganizationModel.get(id);
    return mapOrganization(record);
  },

  async updateOrganization(
    id: string,
    data: UpdateLearningOrganizationInput,
  ): Promise<ILearningOrganization> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.type !== undefined) updates.type = data.type;
    if (data.description !== undefined) updates.description = data.description;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await LearningOrganizationModel.update(id, updates);
    return mapOrganization(record);
  },

  async listOrganizations(type?: LearningOrganizationType): Promise<ILearningOrganization[]> {
    const filters = type ? { type } : {};
    const records = await LearningOrganizationModel.list(filters);
    return records.map(mapOrganization);
  },

  async deleteOrganization(id: string): Promise<void> {
    await LearningOrganizationModel.delete(id);
  },
};

function mapOrganization(r: Record<string, unknown>): ILearningOrganization {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as ILearningOrganization['type'],
    description: r.description as string | undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
