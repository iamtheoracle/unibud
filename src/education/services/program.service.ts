/**
 * Education Module — Program Service
 */

import type { IProgram, IProgramService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class ProgramService implements IProgramService {
  private readonly store: Map<string, IProgram> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('ProgramService');
  }

  createProgram(
    name: string,
    description?: string,
    metadata?: Record<string, unknown>,
  ): IProgram {
    const now = new Date();
    const program: IProgram = {
      id: generateId(),
      name,
      description,
      type: (metadata?.type as string) ?? 'general',
      subjects: [],
      metadata,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(program.id, program);
    this.logger.info('program.created', { id: program.id, name });
    return program;
  }

  getProgram(id: string): IProgram {
    const program = this.store.get(id);
    if (!program) throw new Error(`Program not found: ${id}`);
    return program;
  }

  updateProgram(
    id: string,
    data: Partial<Omit<IProgram, 'id' | 'createdAt'>>,
  ): IProgram {
    const program = this.getProgram(id);
    const updated: IProgram = { ...program, ...data, id, createdAt: program.createdAt, updatedAt: new Date() };
    this.store.set(id, updated);
    this.logger.info('program.updated', { id });
    return updated;
  }

  listPrograms(filter?: Partial<IProgram>): IProgram[] {
    const all = [...this.store.values()];
    if (!filter) return all;
    return all.filter((p) =>
      Object.entries(filter).every(([k, v]) => (p as unknown as Record<string, unknown>)[k] === v),
    );
  }

  deleteProgram(id: string): void {
    this.getProgram(id);
    this.store.delete(id);
    this.logger.info('program.deleted', { id });
  }

  addSubject(programId: string, subjectId: string): void {
    const program = this.getProgram(programId);
    if (!program.subjects.includes(subjectId)) {
      program.subjects.push(subjectId);
      program.updatedAt = new Date();
      this.store.set(programId, program);
    }
  }

  removeSubject(programId: string, subjectId: string): void {
    const program = this.getProgram(programId);
    program.subjects = program.subjects.filter((s) => s !== subjectId);
    program.updatedAt = new Date();
    this.store.set(programId, program);
  }
}
