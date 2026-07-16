import { describe, it, expect, beforeEach } from 'vitest';
import { ClassService } from '../../services/shared/class.service';

describe('ClassService', () => {
  let service: ClassService;

  beforeEach(() => {
    service = new ClassService();
  });

  describe('createClass', () => {
    it('creates a class with required fields', () => {
      const cls = service.createClass('org1', 'prog1', 'subj1', 'edu1', 'Math A');
      expect(cls.id).toBeTruthy();
      expect(cls.organizationId).toBe('org1');
      expect(cls.programId).toBe('prog1');
      expect(cls.subjectId).toBe('subj1');
      expect(cls.educatorId).toBe('edu1');
      expect(cls.name).toBe('Math A');
      expect(cls.students).toEqual([]);
    });

    it('creates a class with optional fields', () => {
      const schedule = { day: 'Monday', time: '09:00' };
      const cls = service.createClass('org1', 'prog1', 'subj1', 'edu1', 'Bio', schedule, 'BIO-01', 30);
      expect(cls.schedule).toEqual(schedule);
      expect(cls.code).toBe('BIO-01');
      expect(cls.capacity).toBe(30);
    });
  });

  describe('getClass', () => {
    it('returns an existing class', () => {
      const created = service.createClass('org1', 'p1', 's1', 'e1', 'Physics');
      const found = service.getClass(created.id);
      expect(found.id).toBe(created.id);
    });

    it('throws if class not found', () => {
      expect(() => service.getClass('bad-id')).toThrow('Class not found');
    });
  });

  describe('updateClass', () => {
    it('updates class fields', () => {
      const cls = service.createClass('org1', 'p1', 's1', 'e1', 'Old Name');
      const updated = service.updateClass(cls.id, { name: 'New Name', capacity: 25 });
      expect(updated.name).toBe('New Name');
      expect(updated.capacity).toBe(25);
    });

    it('throws if class not found', () => {
      expect(() => service.updateClass('bad-id', { name: 'X' })).toThrow('Class not found');
    });
  });

  describe('listClasses', () => {
    it('lists all classes', () => {
      service.createClass('org1', 'p1', 's1', 'e1', 'C1');
      service.createClass('org1', 'p1', 's2', 'e2', 'C2');
      service.createClass('org2', 'p2', 's3', 'e3', 'C3');
      expect(service.listClasses()).toHaveLength(3);
    });

    it('filters by organizationId', () => {
      service.createClass('org1', 'p1', 's1', 'e1', 'C1');
      service.createClass('org2', 'p2', 's2', 'e2', 'C2');
      expect(service.listClasses('org1')).toHaveLength(1);
    });

    it('filters by programId', () => {
      service.createClass('org1', 'prog1', 's1', 'e1', 'C1');
      service.createClass('org1', 'prog2', 's2', 'e2', 'C2');
      expect(service.listClasses(undefined, 'prog1')).toHaveLength(1);
    });

    it('filters by educatorId', () => {
      service.createClass('org1', 'p1', 's1', 'edu1', 'C1');
      service.createClass('org1', 'p1', 's2', 'edu2', 'C2');
      expect(service.listClasses(undefined, undefined, 'edu1')).toHaveLength(1);
    });
  });

  describe('deleteClass', () => {
    it('deletes a class', () => {
      const cls = service.createClass('org1', 'p1', 's1', 'e1', 'TMP');
      service.deleteClass(cls.id);
      expect(service.listClasses()).toHaveLength(0);
    });

    it('throws if class not found', () => {
      expect(() => service.deleteClass('bad-id')).toThrow('Class not found');
    });
  });
});
