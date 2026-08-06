import { describe, it, expect, beforeEach } from 'vitest';
import { StudentService } from '../services/student.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(() => {
    service = new StudentService(logger);
  });

  it('enrolls a student', () => {
    const student = service.enrollStudent('org-1', 'user-1', 'prog-1');
    expect(student.id).toBeTruthy();
    expect(student.userId).toBe('user-1');
    expect(student.organizationId).toBe('org-1');
    expect(student.programId).toBe('prog-1');
    expect(student.status).toBe('active');
  });

  it('gets a student by id', () => {
    const created = service.enrollStudent('org-1', 'user-2', 'prog-1');
    expect(service.getStudent(created.id)).toEqual(created);
  });

  it('throws when getting unknown student', () => {
    expect(() => service.getStudent('unknown')).toThrow('Student not found');
  });

  it('updates a student', () => {
    const s = service.enrollStudent('org-1', 'user-3', 'prog-1');
    const updated = service.updateStudent(s.id, { enrollmentNumber: 'EN-001' });
    expect(updated.enrollmentNumber).toBe('EN-001');
  });

  it('lists students by org', () => {
    service.enrollStudent('org-1', 'u1', 'p1');
    service.enrollStudent('org-1', 'u2', 'p1');
    service.enrollStudent('org-2', 'u3', 'p1');
    expect(service.listStudents('org-1')).toHaveLength(2);
    expect(service.listStudents('org-2')).toHaveLength(1);
  });

  it('lists students by program', () => {
    service.enrollStudent('org-1', 'u1', 'prog-A');
    service.enrollStudent('org-1', 'u2', 'prog-B');
    expect(service.listStudents(undefined, 'prog-A')).toHaveLength(1);
  });

  it('activates and deactivates a student', () => {
    const s = service.enrollStudent('org-1', 'user-4', 'prog-1');
    service.deactivateStudent(s.id);
    expect(service.getStudent(s.id).status).toBe('inactive');
    service.activateStudent(s.id);
    expect(service.getStudent(s.id).status).toBe('active');
  });
});
