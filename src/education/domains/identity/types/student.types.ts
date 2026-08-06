/**
 * Domain: Identity — Student Types
 */

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn';
export type StudentContextType = 'university' | 'learning_organization';
export type StudentContextStatus = 'active' | 'graduated' | 'withdrawn';

export interface IStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: StudentStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentContext {
  id: string;
  studentId: string;
  contextType: StudentContextType;
  contextId: string;
  enrollmentNumber?: string;
  status: StudentContextStatus;
  enrolledAt: Date;
}

export interface RegisterStudentInput {
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export interface AddStudentContextInput {
  contextType: StudentContextType;
  contextId: string;
  enrollmentNumber?: string;
}
