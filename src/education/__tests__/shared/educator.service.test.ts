import { describe, it, expect, beforeEach } from 'vitest';
import { EducatorService } from '../../services/shared/educator.service';

describe('EducatorService', () => {
  let service: EducatorService;

  beforeEach(() => {
    service = new EducatorService();
  });

  it('registers an educator', () => {
    const edu = service.registerEducator('alice@example.com', 'Alice Smith', 'Math teacher');
    expect(edu.id).toBeTruthy();
    expect(edu.email).toBe('alice@example.com');
    expect(edu.name).toBe('Alice Smith');
    expect(edu.organizationIds).toEqual([]);
  });

  it('throws on duplicate email', () => {
    service.registerEducator('dup@example.com', 'Dup User');
    expect(() => service.registerEducator('dup@example.com', 'Another')).toThrow('already exists');
  });

  it('retrieves an educator', () => {
    const edu = service.registerEducator('bob@example.com', 'Bob');
    const found = service.getEducator(edu.id);
    expect(found.id).toBe(edu.id);
  });

  it('throws on get if not found', () => {
    expect(() => service.getEducator('bad')).toThrow('Educator not found');
  });

  it('updates educator', () => {
    const edu = service.registerEducator('c@example.com', 'C');
    const updated = service.updateEducator(edu.id, { bio: 'New bio' });
    expect(updated.bio).toBe('New bio');
  });

  it('assigns educator to organization', () => {
    const edu = service.registerEducator('d@example.com', 'D');
    service.assignToOrganization(edu.id, 'org1');
    const found = service.getEducator(edu.id);
    expect(found.organizationIds).toContain('org1');
  });

  it('does not duplicate organization assignment', () => {
    const edu = service.registerEducator('e@example.com', 'E');
    service.assignToOrganization(edu.id, 'org1');
    service.assignToOrganization(edu.id, 'org1');
    const found = service.getEducator(edu.id);
    expect(found.organizationIds).toHaveLength(1);
  });

  it('lists educators filtered by organization', () => {
    const e1 = service.registerEducator('f1@example.com', 'F1');
    const e2 = service.registerEducator('f2@example.com', 'F2');
    service.assignToOrganization(e1.id, 'orgA');
    service.assignToOrganization(e2.id, 'orgB');
    expect(service.listEducators('orgA')).toHaveLength(1);
    expect(service.listEducators()).toHaveLength(2);
  });
});
