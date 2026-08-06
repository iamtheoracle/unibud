import type { IFaculty } from '../../types/university';

export class FacultyModel implements IFaculty {
  id: string;
  universityId: string;
  name: string;
  code: string;
  description?: string;
  departments: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IFaculty, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.universityId = data.universityId;
    this.name = data.name;
    this.code = data.code;
    this.description = data.description;
    this.departments = data.departments ?? [];
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IFaculty {
    return {
      id: this.id,
      universityId: this.universityId,
      name: this.name,
      code: this.code,
      description: this.description,
      departments: this.departments,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
