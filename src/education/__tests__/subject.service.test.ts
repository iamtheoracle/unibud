import { describe, it, expect, beforeEach } from 'vitest';
import { SubjectService } from '../services/subject.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('SubjectService', () => {
  let service: SubjectService;

  beforeEach(() => {
    service = new SubjectService(logger);
  });

  it('creates a subject', () => {
    const s = service.createSubject('prog-1', 'ENG101', 'English Language', 'Foundation English');
    expect(s.id).toBeTruthy();
    expect(s.code).toBe('ENG101');
    expect(s.name).toBe('English Language');
    expect(s.programId).toBe('prog-1');
  });

  it('gets a subject by id', () => {
    const created = service.createSubject('prog-1', 'MTH101', 'Mathematics');
    expect(service.getSubject(created.id)).toEqual(created);
  });

  it('throws when getting unknown subject', () => {
    expect(() => service.getSubject('none')).toThrow('Subject not found');
  });

  it('updates a subject', () => {
    const s = service.createSubject('prog-1', 'PHY101', 'Physics');
    const updated = service.updateSubject(s.id, { credits: 4 });
    expect(updated.credits).toBe(4);
    expect(updated.code).toBe('PHY101');
  });

  it('lists all subjects', () => {
    service.createSubject('prog-1', 'A', 'Subject A');
    service.createSubject('prog-2', 'B', 'Subject B');
    expect(service.listSubjects()).toHaveLength(2);
  });

  it('filters subjects by program', () => {
    service.createSubject('prog-1', 'A', 'Sub A');
    service.createSubject('prog-1', 'B', 'Sub B');
    service.createSubject('prog-2', 'C', 'Sub C');
    expect(service.listSubjects('prog-1')).toHaveLength(2);
    expect(service.listSubjects('prog-2')).toHaveLength(1);
  });

  it('deletes a subject', () => {
    const s = service.createSubject('prog-1', 'DEL', 'Delete Me');
    service.deleteSubject(s.id);
    expect(() => service.getSubject(s.id)).toThrow();
  });
});
