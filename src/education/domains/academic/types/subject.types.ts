/**
 * Domain: Academic — Subject Types
 */

export interface ISubject {
  id: string;
  programId: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubjectInput {
  programId: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubjectInput {
  code?: string;
  name?: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
}
