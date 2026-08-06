import type { IProgram } from '../../types/shared';
import { ProgramModel } from '../../models/shared/program.model';
import { generateId } from '../../utils';

export class ProgramService {
  private store = new Map<string, ProgramModel>();

  createProgram(
    name: string,
    type: string,
    organizationType: 'university' | 'learningOrg',
    description?: string,
    metadata?: Record<string, unknown>,
  ): IProgram {
    const id = generateId('prog');
    const program = new ProgramModel({ id, name, type, organizationType, subjects: [], description, metadata });
    this.store.set(id, program);
    return program.toJSON();
  }

  getProgram(id: string): IProgram {
    const program = this.store.get(id);
    if (!program) throw new Error(`Program not found: ${id}`);
    return program.toJSON();
  }

  updateProgram(id: string, data: Partial<Pick<IProgram, 'name' | 'type' | 'description' | 'subjects' | 'metadata'>>): IProgram {
    const program = this.store.get(id);
    if (!program) throw new Error(`Program not found: ${id}`);
    if (data.name !== undefined) program.name = data.name;
    if (data.type !== undefined) program.type = data.type;
    if (data.description !== undefined) program.description = data.description;
    if (data.subjects !== undefined) program.subjects = data.subjects;
    if (data.metadata !== undefined) program.metadata = data.metadata;
    program.updatedAt = new Date();
    return program.toJSON();
  }

  listPrograms(type?: string, organizationType?: 'university' | 'learningOrg'): IProgram[] {
    return Array.from(this.store.values())
      .filter(p => (!type || p.type === type) && (!organizationType || p.organizationType === organizationType))
      .map(p => p.toJSON());
  }

  deleteProgram(id: string): void {
    if (!this.store.has(id)) throw new Error(`Program not found: ${id}`);
    this.store.delete(id);
  }
}
