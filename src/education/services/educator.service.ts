/**
 * Education Module — Educator Service
 */

import type { IEducator, IEducatorService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class EducatorService implements IEducatorService {
  private readonly store: Map<string, IEducator> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('EducatorService');
  }

  registerEducator(userId: string, bio?: string, qualifications?: string[]): IEducator {
    const now = new Date();
    const educator: IEducator = {
      id: generateId(),
      userId,
      bio,
      qualifications: qualifications ?? [],
      organizations: [],
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(educator.id, educator);
    this.logger.info('educator.registered', { id: educator.id, userId });
    return educator;
  }

  getEducator(id: string): IEducator {
    const educator = this.store.get(id);
    if (!educator) throw new Error(`Educator not found: ${id}`);
    return educator;
  }

  updateEducator(
    id: string,
    data: Partial<Omit<IEducator, 'id' | 'createdAt'>>,
  ): IEducator {
    const educator = this.getEducator(id);
    const updated: IEducator = { ...educator, ...data, id, createdAt: educator.createdAt, updatedAt: new Date() };
    this.store.set(id, updated);
    this.logger.info('educator.updated', { id });
    return updated;
  }

  listEducators(orgId?: string): IEducator[] {
    const all = [...this.store.values()];
    if (orgId === undefined) return all;
    return all.filter((e) => e.organizations.includes(orgId));
  }

  assignEducator(educatorId: string, orgId: string): void {
    const educator = this.getEducator(educatorId);
    if (!educator.organizations.includes(orgId)) {
      educator.organizations.push(orgId);
      educator.updatedAt = new Date();
      this.store.set(educatorId, educator);
      this.logger.info('educator.assigned', { educatorId, orgId });
    }
  }

  unassignEducator(educatorId: string, orgId: string): void {
    const educator = this.getEducator(educatorId);
    educator.organizations = educator.organizations.filter((o) => o !== orgId);
    educator.updatedAt = new Date();
    this.store.set(educatorId, educator);
    this.logger.info('educator.unassigned', { educatorId, orgId });
  }
}
