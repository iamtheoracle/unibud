import { LearningProgramModel } from '../../models/learning-org/learning-program.model';
import { LearningOrganizationModel } from '../../models/learning-org/organization.model';
import { ProgramModel } from '../../models/shared/program.model';
import type { ILearningProgram } from '../../types/learning-org';

export class LearningProgramService {
  async createProgram(
    organizationId: string,
    programId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ILearningProgram> {
    const [organization, program] = await Promise.all([
      LearningOrganizationModel.findById(organizationId),
      ProgramModel.findById(programId),
    ]);

    if (!organization) {
      throw new Error(`Learning organization ${organizationId} not found`);
    }
    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }

    return LearningProgramModel.create({
      organizationId,
      programId,
      startDate,
      endDate,
      status: 'active',
    });
  }

  async getProgram(id: string): Promise<ILearningProgram> {
    const program = await LearningProgramModel.findById(id);
    if (!program) {
      throw new Error(`Learning program ${id} not found`);
    }

    return program;
  }

  async updateProgram(
    id: string,
    data: Partial<Omit<ILearningProgram, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ILearningProgram> {
    return LearningProgramModel.update(id, data);
  }

  async listPrograms(organizationId?: string): Promise<ILearningProgram[]> {
    return LearningProgramModel.findAll(organizationId);
  }

  async deleteProgram(id: string): Promise<void> {
    await LearningProgramModel.delete(id);
  }
}

export const learningProgramService = new LearningProgramService();
