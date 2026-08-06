/**
 * Domain: Identity — Educator Types
 */

export type EducatorStatus = 'active' | 'inactive';
export type EducatorContextType = 'university' | 'learning_organization';

export interface IEducator {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  qualifications?: string[];
  status: EducatorStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducatorContext {
  id: string;
  educatorId: string;
  contextType: EducatorContextType;
  contextId: string;
  assignedAt: Date;
}

export interface RegisterEducatorInput {
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  qualifications?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateEducatorInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  qualifications?: string[];
  metadata?: Record<string, unknown>;
}

export interface AssignEducatorContextInput {
  contextType: EducatorContextType;
  contextId: string;
}
