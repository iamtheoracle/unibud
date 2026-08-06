import type { IUniversity } from '../../types/university';

export class UniversityModel implements IUniversity {
  id: string;
  name: string;
  code: string;
  description?: string;
  faculties: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IUniversity, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.description = data.description;
    this.faculties = data.faculties ?? [];
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IUniversity {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      faculties: this.faculties,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
