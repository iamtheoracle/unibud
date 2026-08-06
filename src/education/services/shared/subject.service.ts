import type { ISubject } from '../../types/shared';
import { SubjectModel } from '../../models/shared/subject.model';
import { generateId } from '../../utils';

export class SubjectService {
  private store = new Map<string, SubjectModel>();

  createSubject(programId: string, code: string, name: string, description?: string, metadata?: Record<string, unknown>): ISubject {
    const id = generateId('subj');
    const subject = new SubjectModel({ id, programId, code, name, description, metadata });
    this.store.set(id, subject);
    return subject.toJSON();
  }

  getSubject(id: string): ISubject {
    const subject = this.store.get(id);
    if (!subject) throw new Error(`Subject not found: ${id}`);
    return subject.toJSON();
  }

  updateSubject(id: string, data: Partial<Pick<ISubject, 'code' | 'name' | 'description' | 'metadata'>>): ISubject {
    const subject = this.store.get(id);
    if (!subject) throw new Error(`Subject not found: ${id}`);
    if (data.code !== undefined) subject.code = data.code;
    if (data.name !== undefined) subject.name = data.name;
    if (data.description !== undefined) subject.description = data.description;
    if (data.metadata !== undefined) subject.metadata = data.metadata;
    subject.updatedAt = new Date();
    return subject.toJSON();
  }

  listSubjects(programId?: string): ISubject[] {
    return Array.from(this.store.values())
      .filter(s => !programId || s.programId === programId)
      .map(s => s.toJSON());
  }

  deleteSubject(id: string): void {
    if (!this.store.has(id)) throw new Error(`Subject not found: ${id}`);
    this.store.delete(id);
  }
}
