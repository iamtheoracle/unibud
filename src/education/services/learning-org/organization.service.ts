import type { ILearningOrganization, LearningOrgType } from '../../types/learning-org';
import { LearningOrganizationModel } from '../../models/learning-org/organization.model';
import { generateId } from '../../utils';

export class LearningOrganizationService {
  private store = new Map<string, LearningOrganizationModel>();

  createOrganization(name: string, type: LearningOrgType, description?: string, metadata?: Record<string, unknown>): ILearningOrganization {
    const id = generateId('lorg');
    const org = new LearningOrganizationModel({ id, name, type, description, educators: [], metadata });
    this.store.set(id, org);
    return org.toJSON();
  }

  getOrganization(id: string): ILearningOrganization {
    const org = this.store.get(id);
    if (!org) throw new Error(`Learning organization not found: ${id}`);
    return org.toJSON();
  }

  updateOrganization(id: string, data: Partial<Pick<ILearningOrganization, 'name' | 'type' | 'description' | 'metadata'>>): ILearningOrganization {
    const org = this.store.get(id);
    if (!org) throw new Error(`Learning organization not found: ${id}`);
    if (data.name !== undefined) org.name = data.name;
    if (data.type !== undefined) org.type = data.type;
    if (data.description !== undefined) org.description = data.description;
    if (data.metadata !== undefined) org.metadata = data.metadata;
    org.updatedAt = new Date();
    return org.toJSON();
  }

  listOrganizations(type?: LearningOrgType): ILearningOrganization[] {
    return Array.from(this.store.values())
      .filter(o => !type || o.type === type)
      .map(o => o.toJSON());
  }

  deleteOrganization(id: string): void {
    if (!this.store.has(id)) throw new Error(`Learning organization not found: ${id}`);
    this.store.delete(id);
  }

  addEducator(organizationId: string, educatorId: string): void {
    const org = this.store.get(organizationId);
    if (!org) throw new Error(`Learning organization not found: ${organizationId}`);
    if (!org.educators.includes(educatorId)) {
      org.educators.push(educatorId);
      org.updatedAt = new Date();
    }
  }
}
