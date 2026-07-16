import { describe, it, expect, beforeEach } from 'vitest';
import { SubjectService } from '../../services/shared/subject.service';

describe('SubjectService', () => {
  let service: SubjectService;

  beforeEach(() => {
    service = new SubjectService();
  });

  it('creates a subject', () => {
    const s = service.createSubject('p1', 'MATH101', 'Mathematics', 'Core math');
    expect(s.id).toBeTruthy();
    expect(s.programId).toBe('p1');
    expect(s.code).toBe('MATH101');
    expect(s.name).toBe('Mathematics');
  });

  it('retrieves a subject', () => {
    const s = service.createSubject('p1', 'ENG101', 'English');
    const found = service.getSubject(s.id);
    expect(found.id).toBe(s.id);
  });

  it('throws on get if not found', () => {
    expect(() => service.getSubject('bad')).toThrow('Subject not found');
  });

  it('updates subject fields', () => {
    const s = service.createSubject('p1', 'PHY101', 'Physics');
    const updated = service.updateSubject(s.id, { name: 'Advanced Physics' });
    expect(updated.name).toBe('Advanced Physics');
  });

  it('lists subjects filtered by program', () => {
    service.createSubject('p1', 'M1', 'Math');
    service.createSubject('p1', 'E1', 'English');
    service.createSubject('p2', 'B1', 'Biology');
    expect(service.listSubjects('p1')).toHaveLength(2);
    expect(service.listSubjects('p2')).toHaveLength(1);
    expect(service.listSubjects()).toHaveLength(3);
  });

  it('deletes a subject', () => {
    const s = service.createSubject('p1', 'X1', 'X');
    service.deleteSubject(s.id);
    expect(service.listSubjects()).toHaveLength(0);
  });

  it('throws on delete if not found', () => {
    expect(() => service.deleteSubject('bad')).toThrow('Subject not found');
  });
});
