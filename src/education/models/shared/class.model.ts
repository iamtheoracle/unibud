import type { IClass } from '../../types/shared';

export class ClassModel implements IClass {
  id: string;
  organizationId: string;
  programId: string;
  subjectId: string;
  educatorId: string;
  name: string;
  code?: string;
  schedule?: unknown;
  capacity?: number;
  students: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IClass, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.programId = data.programId;
    this.subjectId = data.subjectId;
    this.educatorId = data.educatorId;
    this.name = data.name;
    this.code = data.code;
    this.schedule = data.schedule;
    this.capacity = data.capacity;
    this.students = data.students ?? [];
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IClass {
    return {
      id: this.id,
      organizationId: this.organizationId,
      programId: this.programId,
      subjectId: this.subjectId,
      educatorId: this.educatorId,
      name: this.name,
      code: this.code,
      schedule: this.schedule,
      capacity: this.capacity,
      students: this.students,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
