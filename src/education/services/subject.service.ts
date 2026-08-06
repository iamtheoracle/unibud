/**
 * Education Module — Subject Service
 */

import type { ISubject, ISubjectService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class SubjectService implements ISubjectService {
  private readonly store: Map<string, ISubject> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('SubjectService');
  }

  createSubject(
    programId: string,
    code: string,
    name: string,
    description?: string,
  ): ISubject {
    const now = new Date();
    const subject: ISubject = {
      id: generateId(),
      programId,
      code,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(subject.id, subject);
    this.logger.info('subject.created', { id: subject.id, code, name });
    return subject;
  }

  getSubject(id: string): ISubject {
    const subject = this.store.get(id);
    if (!subject) throw new Error(`Subject not found: ${id}`);
    return subject;
  }

  updateSubject(
    id: string,
    data: Partial<Omit<ISubject, 'id' | 'createdAt'>>,
  ): ISubject {
    const subject = this.getSubject(id);
    const updated: ISubject = { ...subject, ...data, id, createdAt: subject.createdAt, updatedAt: new Date() };
    this.store.set(id, updated);
    this.logger.info('subject.updated', { id });
    return updated;
  }

  listSubjects(programId?: string): ISubject[] {
    const all = [...this.store.values()];
    if (programId === undefined) return all;
    return all.filter((s) => s.programId === programId);
  }

  deleteSubject(id: string): void {
    this.getSubject(id);
    this.store.delete(id);
    this.logger.info('subject.deleted', { id });
  }
}
