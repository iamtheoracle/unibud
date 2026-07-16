import { ProgramModel } from '../../models/shared/program.model';
import type { IAcademicProgram } from '../../types/shared';

export class ProgramService {
  async createProgram(name: string, code: string, type: string, description?: string): Promise<IAcademicProgram> {
    const existing = await ProgramModel.findByCode(code);
    if (existing) {
      throw new Error(`Program with code ${code} already exists`);
    }

    return ProgramModel.create({
      name,
      code,
      type,
      description,
      subjects: [],
    });
  }

  async getProgram(id: string): Promise<IAcademicProgram> {
    const program = await ProgramModel.findById(id);
    if (!program) {
      throw new Error(`Program ${id} not found`);
    }

    return program;
  }

  async updateProgram(
    id: string,
    data: Partial<Omit<IAcademicProgram, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IAcademicProgram> {
    return ProgramModel.update(id, data);
  }

  async listPrograms(type?: string): Promise<IAcademicProgram[]> {
    return ProgramModel.findAll(type);
  }

  async deleteProgram(id: string): Promise<void> {
    await ProgramModel.delete(id);
  }

  async addSubject(programId: string, subjectId: string): Promise<void> {
    const program = await this.getProgram(programId);
    if (!program.subjects.includes(subjectId)) {
      await ProgramModel.update(programId, { subjects: [...program.subjects, subjectId] });
    }
  }

  async removeSubject(programId: string, subjectId: string): Promise<void> {
    const program = await this.getProgram(programId);
    await ProgramModel.update(programId, { subjects: program.subjects.filter((id) => id !== subjectId) });
  }
}

export const programService = new ProgramService();
