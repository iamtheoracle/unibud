// ─── Shared Foundation Types ──────────────────────────────────────────────────
// Used by both University and Learning Organization ecosystems

export interface IProgram {
  id: string;
  name: string;
  type: string;
  organizationType: 'university' | 'learningOrg';
  subjects: string[];
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass {
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
}

export interface ISubject {
  id: string;
  programId: string;
  code: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducator {
  id: string;
  email: string;
  name: string;
  bio?: string;
  organizationIds: string[];
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
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermission {
  id: string;
  name: string;
  description?: string;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPermission {
  userId: string;
  permissionName: string;
  context?: Record<string, unknown>;
  grantedAt: Date;
}

export interface IInvitation {
  id: string;
  email: string;
  type: 'educator' | 'student' | 'admin';
  organizationId: string;
  programId?: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  data?: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
