/**
 * Education Module — Organization Service
 */

import type { IOrganization, IOrganizationService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class OrganizationService implements IOrganizationService {
  private readonly store: Map<string, IOrganization> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('OrganizationService');
  }

  createOrganization(
    name: string,
    type: string,
    metadata?: Record<string, unknown>,
  ): IOrganization {
    const now = new Date();
    const org: IOrganization = {
      id: generateId(),
      name,
      type,
      educators: [],
      metadata,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(org.id, org);
    this.logger.info('organization.created', { id: org.id, name, type });
    return org;
  }

  getOrganization(id: string): IOrganization {
    const org = this.store.get(id);
    if (!org) throw new Error(`Organization not found: ${id}`);
    return org;
  }

  updateOrganization(
    id: string,
    data: Partial<Omit<IOrganization, 'id' | 'createdAt'>>,
  ): IOrganization {
    const org = this.getOrganization(id);
    const updated: IOrganization = { ...org, ...data, id, createdAt: org.createdAt, updatedAt: new Date() };
    this.store.set(id, updated);
    this.logger.info('organization.updated', { id });
    return updated;
  }

  listOrganizations(filter?: Partial<IOrganization>): IOrganization[] {
    const all = [...this.store.values()];
    if (!filter) return all;
    return all.filter((o) =>
      Object.entries(filter).every(([k, v]) => (o as unknown as Record<string, unknown>)[k] === v),
    );
  }

  deleteOrganization(id: string): void {
    this.getOrganization(id);
    this.store.delete(id);
    this.logger.info('organization.deleted', { id });
  }

  addEducator(orgId: string, educatorId: string): void {
    const org = this.getOrganization(orgId);
    if (!org.educators.includes(educatorId)) {
      org.educators.push(educatorId);
      org.updatedAt = new Date();
      this.store.set(orgId, org);
    }
  }

  removeEducator(orgId: string, educatorId: string): void {
    const org = this.getOrganization(orgId);
    org.educators = org.educators.filter((e) => e !== educatorId);
    org.updatedAt = new Date();
    this.store.set(orgId, org);
  }
}
