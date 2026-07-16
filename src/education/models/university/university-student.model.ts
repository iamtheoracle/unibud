import type { IUniversityStudent } from '../../types/university';

export class UniversityStudentModel implements IUniversityStudent {
  id: string;
  userId: string;
  universityId: string;
  departmentId: string;
  courseId: string;
  matriculationNumber?: string;
  level?: '100' | '200' | '300' | '400' | '500' | '600';
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IUniversityStudent, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.userId = data.userId;
    this.universityId = data.universityId;
    this.departmentId = data.departmentId;
    this.courseId = data.courseId;
    this.matriculationNumber = data.matriculationNumber;
    this.level = data.level;
    this.status = data.status ?? 'active';
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IUniversityStudent {
    return {
      id: this.id,
      userId: this.userId,
      universityId: this.universityId,
      departmentId: this.departmentId,
      courseId: this.courseId,
      matriculationNumber: this.matriculationNumber,
      level: this.level,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
