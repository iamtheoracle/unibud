import { describe, it, expect, beforeEach } from 'vitest';
import { ProgramService } from '../services/program.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('ProgramService', () => {
  let service: ProgramService;

  beforeEach(() => {
    service = new ProgramService(logger);
  });

  it('creates a program', () => {
    const p = service.createProgram('WAEC', 'West African Examination', { type: 'preUniversity' });
    expect(p.id).toBeTruthy();
    expect(p.name).toBe('WAEC');
    expect(p.description).toBe('West African Examination');
    expect(p.subjects).toEqual([]);
  });

  it('gets a program by id', () => {
    const created = service.createProgram('NECO');
    const fetched = service.getProgram(created.id);
    expect(fetched).toEqual(created);
  });

  it('throws when getting unknown program', () => {
    expect(() => service.getProgram('nonexistent')).toThrow('Program not found');
  });

  it('updates a program', () => {
    const p = service.createProgram('JAMB');
    const updated = service.updateProgram(p.id, { name: 'JAMB 2025' });
    expect(updated.name).toBe('JAMB 2025');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(p.updatedAt.getTime());
  });

  it('lists all programs', () => {
    service.createProgram('A');
    service.createProgram('B');
    expect(service.listPrograms()).toHaveLength(2);
  });

  it('deletes a program', () => {
    const p = service.createProgram('DeleteMe');
    service.deleteProgram(p.id);
    expect(() => service.getProgram(p.id)).toThrow();
  });

  it('adds and removes subjects', () => {
    const p = service.createProgram('WAEC');
    service.addSubject(p.id, 'sub-1');
    service.addSubject(p.id, 'sub-2');
    expect(service.getProgram(p.id).subjects).toEqual(['sub-1', 'sub-2']);

    service.removeSubject(p.id, 'sub-1');
    expect(service.getProgram(p.id).subjects).toEqual(['sub-2']);
  });

  it('does not duplicate subjects', () => {
    const p = service.createProgram('WAEC');
    service.addSubject(p.id, 'sub-1');
    service.addSubject(p.id, 'sub-1');
    expect(service.getProgram(p.id).subjects).toHaveLength(1);
  });
});
