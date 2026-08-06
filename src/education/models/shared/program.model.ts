import type { IProgram } from '../../types/shared';

export class ProgramModel implements IProgram {
  id: string;
  name: string;
  type: string;
  organizationType: 'university' | 'learningOrg';
  subjects: string[];
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IProgram, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.organizationType = data.organizationType;
    this.subjects = data.subjects ?? [];
    this.description = data.description;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IProgram {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      organizationType: this.organizationType,
      subjects: this.subjects,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
