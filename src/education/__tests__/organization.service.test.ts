import { describe, it, expect, beforeEach } from 'vitest';
import { OrganizationService } from '../services/organization.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    service = new OrganizationService(logger);
  });

  it('creates an organization', () => {
    const org = service.createOrganization('Lagos Tutorial Centre', 'TutorialCentre');
    expect(org.id).toBeTruthy();
    expect(org.name).toBe('Lagos Tutorial Centre');
    expect(org.type).toBe('TutorialCentre');
    expect(org.educators).toEqual([]);
  });

  it('gets an organization by id', () => {
    const created = service.createOrganization('UNILAG', 'University');
    expect(service.getOrganization(created.id)).toEqual(created);
  });

  it('throws when getting unknown organization', () => {
    expect(() => service.getOrganization('unknown')).toThrow('Organization not found');
  });

  it('updates an organization', () => {
    const org = service.createOrganization('Old Name', 'ExamCentre');
    const updated = service.updateOrganization(org.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
    expect(updated.type).toBe('ExamCentre');
  });

  it('lists all organizations', () => {
    service.createOrganization('Org A', 'University');
    service.createOrganization('Org B', 'TutorialCentre');
    expect(service.listOrganizations()).toHaveLength(2);
  });

  it('filters organizations', () => {
    service.createOrganization('Uni A', 'University');
    service.createOrganization('Tut B', 'TutorialCentre');
    const unis = service.listOrganizations({ type: 'University' });
    expect(unis).toHaveLength(1);
    expect(unis[0].name).toBe('Uni A');
  });

  it('deletes an organization', () => {
    const org = service.createOrganization('Delete Me', 'ExamCentre');
    service.deleteOrganization(org.id);
    expect(() => service.getOrganization(org.id)).toThrow();
  });

  it('adds and removes educators', () => {
    const org = service.createOrganization('School', 'TutorialCentre');
    service.addEducator(org.id, 'edu-1');
    service.addEducator(org.id, 'edu-2');
    expect(service.getOrganization(org.id).educators).toEqual(['edu-1', 'edu-2']);

    service.removeEducator(org.id, 'edu-1');
    expect(service.getOrganization(org.id).educators).toEqual(['edu-2']);
  });

  it('does not duplicate educators', () => {
    const org = service.createOrganization('School', 'TutorialCentre');
    service.addEducator(org.id, 'edu-1');
    service.addEducator(org.id, 'edu-1');
    expect(service.getOrganization(org.id).educators).toHaveLength(1);
  });
});
