/**
 * Domain: Academic — Class Types
 */

export interface IClass {
  id: string;
  programId: string;
  subjectId: string;
  educatorId: string;
  organizationId?: string;
  name: string;
  code?: string;
  schedule?: unknown;
  capacity?: number;
  students: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassInput {
  programId: string;
  subjectId: string;
  educatorId: string;
  organizationId?: string;
  name: string;
  code?: string;
  schedule?: unknown;
  capacity?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateClassInput {
  name?: string;
  code?: string;
  schedule?: unknown;
  capacity?: number;
  metadata?: Record<string, unknown>;
}

export interface ListClassesFilter {
  programId?: string;
  educatorId?: string;
  organizationId?: string;
}
