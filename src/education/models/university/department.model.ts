import type { IDepartment } from '../../types/university';

export class DepartmentModel implements IDepartment {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  description?: string;
  courses: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IDepartment, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.facultyId = data.facultyId;
    this.name = data.name;
    this.code = data.code;
    this.description = data.description;
    this.courses = data.courses ?? [];
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IDepartment {
    return {
      id: this.id,
      facultyId: this.facultyId,
      name: this.name,
      code: this.code,
      description: this.description,
      courses: this.courses,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
