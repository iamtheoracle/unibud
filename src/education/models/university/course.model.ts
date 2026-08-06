import type { ICourse } from '../../types/university';

export class CourseModel implements ICourse {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<ICourse, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.departmentId = data.departmentId;
    this.code = data.code;
    this.name = data.name;
    this.description = data.description;
    this.credits = data.credits;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): ICourse {
    return {
      id: this.id,
      departmentId: this.departmentId,
      code: this.code,
      name: this.name,
      description: this.description,
      credits: this.credits,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
