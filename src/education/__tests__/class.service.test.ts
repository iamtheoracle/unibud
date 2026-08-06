import { describe, it, expect, beforeEach } from 'vitest';
import { ClassService } from '../services/class.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('ClassService', () => {
  let service: ClassService;

  beforeEach(() => {
    service = new ClassService(logger);
  });

  it('creates a class', () => {
    const cls = service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'Math Class A', {
      days: ['Monday', 'Wednesday'],
      time: '09:00',
    });
    expect(cls.id).toBeTruthy();
    expect(cls.name).toBe('Math Class A');
    expect(cls.students).toEqual([]);
    expect(cls.schedule?.days).toEqual(['Monday', 'Wednesday']);
  });

  it('gets a class by id', () => {
    const created = service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'Class B');
    expect(service.getClass(created.id)).toEqual(created);
  });

  it('throws when getting unknown class', () => {
    expect(() => service.getClass('unknown')).toThrow('Class not found');
  });

  it('updates a class', () => {
    const cls = service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'Original');
    const updated = service.updateClass(cls.id, { name: 'Renamed', capacity: 30 });
    expect(updated.name).toBe('Renamed');
    expect(updated.capacity).toBe(30);
  });

  it('lists classes with filters', () => {
    service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'C1');
    service.createClass('org-1', 'prog-2', 'sub-2', 'edu-2', 'C2');
    service.createClass('org-2', 'prog-1', 'sub-1', 'edu-1', 'C3');

    expect(service.listClasses('org-1')).toHaveLength(2);
    expect(service.listClasses('org-2')).toHaveLength(1);
    expect(service.listClasses(undefined, 'prog-1')).toHaveLength(2);
    expect(service.listClasses(undefined, undefined, 'edu-2')).toHaveLength(1);
  });

  it('deletes a class', () => {
    const cls = service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'Delete Me');
    service.deleteClass(cls.id);
    expect(() => service.getClass(cls.id)).toThrow();
  });

  it('adds and removes students', () => {
    const cls = service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'Class');
    service.addStudent(cls.id, 'stu-1');
    service.addStudent(cls.id, 'stu-2');
    expect(service.getClass(cls.id).students).toEqual(['stu-1', 'stu-2']);

    service.removeStudent(cls.id, 'stu-1');
    expect(service.getClass(cls.id).students).toEqual(['stu-2']);
  });

  it('does not duplicate students', () => {
    const cls = service.createClass('org-1', 'prog-1', 'sub-1', 'edu-1', 'Class');
    service.addStudent(cls.id, 'stu-1');
    service.addStudent(cls.id, 'stu-1');
    expect(service.getClass(cls.id).students).toHaveLength(1);
  });
});
