import { ProgramModel } from '../../models/shared/program.model';
import { SubjectModel } from '../../models/shared/subject.model';
import type { ISubject } from '../../types/shared';

export class SubjectService {
  async createSubject(programId: string, code: string, name: string, description?: string): Promise<ISubject> {
    const program = await ProgramModel.findById(programId);
    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }

    const existing = await SubjectModel.findByCode(programId, code);
    if (existing) {
      throw new Error(`Subject with code ${code} already exists in program ${programId}`);
    }

    const subject = await SubjectModel.create({ programId, code, name, description });
    if (!program.subjects.includes(subject.id)) {
      await ProgramModel.update(programId, { subjects: [...program.subjects, subject.id] });
    }
    return subject;
  }

  async getSubject(id: string): Promise<ISubject> {
    const subject = await SubjectModel.findById(id);
    if (!subject) {
      throw new Error(`Subject ${id} not found`);
    }

    return subject;
  }

  async updateSubject(id: string, data: Partial<Omit<ISubject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ISubject> {
    return SubjectModel.update(id, data);
  }

  async listSubjects(programId?: string): Promise<ISubject[]> {
    return SubjectModel.findAll(programId);
  }

  async deleteSubject(id: string): Promise<void> {
    const subject = await this.getSubject(id);
    await SubjectModel.delete(id);
    const program = await ProgramModel.findById(subject.programId);
    if (program) {
      await ProgramModel.update(program.id, { subjects: program.subjects.filter((subjectId) => subjectId !== id) });
    }
  }
}

export const subjectService = new SubjectService();
