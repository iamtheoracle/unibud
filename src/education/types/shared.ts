export interface IStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentContext {
  id: string;
  studentId: string;
  contextType: 'university' | 'learning_organization';
  contextId: string;
  enrollmentNumber?: string;
  status: 'active' | 'graduated' | 'withdrawn';
  enrolledAt: Date;
}

export interface IEducator {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  qualifications?: string[];
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducatorContext {
  id: string;
  educatorId: string;
  contextType: 'university' | 'learning_organization';
  contextId: string;
  assignedAt: Date;
}

export interface IAcademicProgram {
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

export interface ISubject {
  id: string;
  programId: string;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass {
  id: string;
  programId: string;
  subjectId: string;
  educatorId: string;
  organizationId?: string;
  name: string;
  code?: string;
  schedule?: Record<string, unknown>;
  capacity?: number;
  students: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'withdrawn';
  enrolledAt: Date;
  updatedAt: Date;
}

export interface IPermission {
  id: string;
  name: string;
  description: string;
  scope: string;
  createdAt: Date;
}

export interface IUserPermission {
  id: string;
  userId: string;
  permissionName: string;
  context?: string;
  grantedAt: Date;
}

export interface IInvitation {
  id: string;
  email: string;
  type: 'student' | 'educator';
  organizationId: string;
  programId?: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}
