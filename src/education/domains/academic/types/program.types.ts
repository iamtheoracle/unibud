/**
 * Domain: Academic — Program Types
 */

export interface IProgram {
  id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  subjects: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProgramInput {
  name: string;
  code: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProgramInput {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
