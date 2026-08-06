import type { ISubject } from '../../types/shared';

export class SubjectModel implements ISubject {
  id: string;
  programId: string;
  code: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<ISubject, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.programId = data.programId;
    this.code = data.code;
    this.name = data.name;
    this.description = data.description;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): ISubject {
    return {
      id: this.id,
      programId: this.programId,
      code: this.code,
      name: this.name,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
