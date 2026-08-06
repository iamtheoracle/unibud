import { describe, it, expect, beforeEach } from 'vitest';
import { ProgramService } from '../../services/shared/program.service';

describe('ProgramService', () => {
  let service: ProgramService;

  beforeEach(() => {
    service = new ProgramService();
  });

  describe('createProgram', () => {
    it('creates a university program', () => {
      const program = service.createProgram('B.Sc. Computer Science', 'university_degree', 'university', 'Bachelor degree in CS');
      expect(program.id).toBeTruthy();
      expect(program.name).toBe('B.Sc. Computer Science');
      expect(program.type).toBe('university_degree');
      expect(program.organizationType).toBe('university');
      expect(program.subjects).toEqual([]);
      expect(program.createdAt).toBeInstanceOf(Date);
    });

    it('creates a learning org program', () => {
      const program = service.createProgram('WAEC 2024', 'waec', 'learningOrg', 'West African Examinations Council');
      expect(program.organizationType).toBe('learningOrg');
      expect(program.type).toBe('waec');
    });

    it('creates programs with metadata', () => {
      const metadata = { year: 2024, country: 'NG' };
      const program = service.createProgram('NECO', 'neco', 'learningOrg', undefined, metadata);
      expect(program.metadata).toEqual(metadata);
    });
  });

  describe('getProgram', () => {
    it('returns an existing program', () => {
      const created = service.createProgram('JAMB', 'jamb', 'learningOrg');
      const found = service.getProgram(created.id);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('JAMB');
    });

    it('throws if program not found', () => {
      expect(() => service.getProgram('nonexistent')).toThrow('Program not found');
    });
  });

  describe('updateProgram', () => {
    it('updates program fields', () => {
      const program = service.createProgram('WAEC', 'waec', 'learningOrg');
      const updated = service.updateProgram(program.id, { name: 'WAEC 2025', subjects: ['math', 'english'] });
      expect(updated.name).toBe('WAEC 2025');
      expect(updated.subjects).toEqual(['math', 'english']);
    });

    it('throws if program not found', () => {
      expect(() => service.updateProgram('bad-id', { name: 'X' })).toThrow('Program not found');
    });
  });

  describe('listPrograms', () => {
    it('lists all programs', () => {
      service.createProgram('P1', 'waec', 'learningOrg');
      service.createProgram('P2', 'jamb', 'learningOrg');
      service.createProgram('P3', 'university_degree', 'university');
      expect(service.listPrograms()).toHaveLength(3);
    });

    it('filters by type', () => {
      service.createProgram('P1', 'waec', 'learningOrg');
      service.createProgram('P2', 'jamb', 'learningOrg');
      service.createProgram('P3', 'university_degree', 'university');
      expect(service.listPrograms('waec')).toHaveLength(1);
    });

    it('filters by organizationType', () => {
      service.createProgram('P1', 'waec', 'learningOrg');
      service.createProgram('P2', 'jamb', 'learningOrg');
      service.createProgram('P3', 'university_degree', 'university');
      expect(service.listPrograms(undefined, 'learningOrg')).toHaveLength(2);
      expect(service.listPrograms(undefined, 'university')).toHaveLength(1);
    });
  });

  describe('deleteProgram', () => {
    it('deletes a program', () => {
      const program = service.createProgram('TMP', 'tmp', 'university');
      service.deleteProgram(program.id);
      expect(service.listPrograms()).toHaveLength(0);
    });

    it('throws if program not found', () => {
      expect(() => service.deleteProgram('nonexistent')).toThrow('Program not found');
    });
  });
});
