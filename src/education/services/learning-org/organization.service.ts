import { LearningOrganizationModel } from '../../models/learning-org/organization.model';
import type { ILearningOrganization } from '../../types/learning-org';

export class LearningOrganizationService {
  async createOrganization(
    name: string,
    type: ILearningOrganization['type'],
    description?: string
  ): Promise<ILearningOrganization> {
    const existing = await LearningOrganizationModel.findByName(name);
    if (existing && existing.type === type) {
      throw new Error(`Learning organization ${name} already exists`);
    }

    return LearningOrganizationModel.create({
      name,
      type,
      description,
    });
  }

  async getOrganization(id: string): Promise<ILearningOrganization> {
    const organization = await LearningOrganizationModel.findById(id);
    if (!organization) {
      throw new Error(`Learning organization ${id} not found`);
    }

    return organization;
  }

  async updateOrganization(
    id: string,
    data: Partial<Omit<ILearningOrganization, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ILearningOrganization> {
    return LearningOrganizationModel.update(id, data);
  }

  async listOrganizations(type?: ILearningOrganization['type']): Promise<ILearningOrganization[]> {
    return LearningOrganizationModel.findAll(type);
  }

  async deleteOrganization(id: string): Promise<void> {
    await LearningOrganizationModel.delete(id);
  }
}

export const organizationService = new LearningOrganizationService();
