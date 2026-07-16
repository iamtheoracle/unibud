import type { IEducator } from '../../types/shared';
import { EducatorModel } from '../../models/shared/educator.model';
import { generateId } from '../../utils';

export class EducatorService {
  private store = new Map<string, EducatorModel>();

  registerEducator(email: string, name: string, bio?: string, metadata?: Record<string, unknown>): IEducator {
    const existing = Array.from(this.store.values()).find(e => e.email === email);
    if (existing) throw new Error(`Educator with email ${email} already exists`);
    const id = generateId('edu');
    const educator = new EducatorModel({ id, email, name, bio, organizationIds: [], metadata });
    this.store.set(id, educator);
    return educator.toJSON();
  }

  getEducator(id: string): IEducator {
    const educator = this.store.get(id);
    if (!educator) throw new Error(`Educator not found: ${id}`);
    return educator.toJSON();
  }

  updateEducator(id: string, data: Partial<Pick<IEducator, 'name' | 'bio' | 'metadata'>>): IEducator {
    const educator = this.store.get(id);
    if (!educator) throw new Error(`Educator not found: ${id}`);
    if (data.name !== undefined) educator.name = data.name;
    if (data.bio !== undefined) educator.bio = data.bio;
    if (data.metadata !== undefined) educator.metadata = data.metadata;
    educator.updatedAt = new Date();
    return educator.toJSON();
  }

  listEducators(organizationId?: string): IEducator[] {
    return Array.from(this.store.values())
      .filter(e => !organizationId || e.organizationIds.includes(organizationId))
      .map(e => e.toJSON());
  }

  assignToOrganization(educatorId: string, organizationId: string): void {
    const educator = this.store.get(educatorId);
    if (!educator) throw new Error(`Educator not found: ${educatorId}`);
    if (!educator.organizationIds.includes(organizationId)) {
      educator.organizationIds.push(organizationId);
      educator.updatedAt = new Date();
    }
  }
}
