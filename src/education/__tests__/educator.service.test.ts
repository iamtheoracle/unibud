import { describe, it, expect, beforeEach } from 'vitest';
import { EducatorService } from '../services/educator.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('EducatorService', () => {
  let service: EducatorService;

  beforeEach(() => {
    service = new EducatorService(logger);
  });

  it('registers an educator', () => {
    const e = service.registerEducator('user-1', 'PhD in Mathematics', ['B.Sc', 'M.Sc']);
    expect(e.id).toBeTruthy();
    expect(e.userId).toBe('user-1');
    expect(e.bio).toBe('PhD in Mathematics');
    expect(e.qualifications).toEqual(['B.Sc', 'M.Sc']);
    expect(e.organizations).toEqual([]);
  });

  it('gets an educator by id', () => {
    const created = service.registerEducator('user-2');
    expect(service.getEducator(created.id)).toEqual(created);
  });

  it('throws when getting unknown educator', () => {
    expect(() => service.getEducator('nope')).toThrow('Educator not found');
  });

  it('updates an educator', () => {
    const e = service.registerEducator('user-3');
    const updated = service.updateEducator(e.id, { bio: 'Updated bio' });
    expect(updated.bio).toBe('Updated bio');
  });

  it('lists all educators', () => {
    service.registerEducator('u1');
    service.registerEducator('u2');
    expect(service.listEducators()).toHaveLength(2);
  });

  it('filters educators by organization', () => {
    const e1 = service.registerEducator('u1');
    const e2 = service.registerEducator('u2');
    service.assignEducator(e1.id, 'org-1');
    expect(service.listEducators('org-1')).toHaveLength(1);
    expect(service.listEducators('org-1')[0].id).toBe(e1.id);
  });

  it('assigns and unassigns educators to organizations', () => {
    const e = service.registerEducator('u1');
    service.assignEducator(e.id, 'org-1');
    service.assignEducator(e.id, 'org-2');
    expect(service.getEducator(e.id).organizations).toEqual(['org-1', 'org-2']);

    service.unassignEducator(e.id, 'org-1');
    expect(service.getEducator(e.id).organizations).toEqual(['org-2']);
  });

  it('does not duplicate organization assignments', () => {
    const e = service.registerEducator('u1');
    service.assignEducator(e.id, 'org-1');
    service.assignEducator(e.id, 'org-1');
    expect(service.getEducator(e.id).organizations).toHaveLength(1);
  });
});
