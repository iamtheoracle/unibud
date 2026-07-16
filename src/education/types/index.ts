/**
 * Education Module — TypeScript Interfaces
 *
 * All data model interfaces for the Education Module.
 */

import type { IModule } from '../../oracle/kernel/types.js';

// ─── Academic Program ─────────────────────────────────────────────────────────

export interface IProgram {
  id: string;
  name: string;
  code?: string;
  description?: string;
  type: string;
  subjects: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Learning Organization ───────────────────────────────────────────────────

export interface IOrganization {
  id: string;
  name: string;
  type: string;
  description?: string;
  educators: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Student ─────────────────────────────────────────────────────────────────

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn';

export interface IStudent {
  id: string;
  userId: string;
  organizationId: string;
  programId: string;
  enrollmentNumber?: string;
  status: StudentStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Educator ────────────────────────────────────────────────────────────────

export interface IEducator {
  id: string;
  userId: string;
  bio?: string;
  qualifications?: string[];
  organizations: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Class ───────────────────────────────────────────────────────────────────

export interface IClassSchedule {
  days?: string[];
  time?: string;
  location?: string;
}

export interface IClass {
  id: string;
  organizationId: string;
  programId: string;
  subjectId: string;
  educatorId: string;
  name: string;
  code?: string;
  schedule?: IClassSchedule;
  capacity?: number;
  students: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Subject ─────────────────────────────────────────────────────────────────

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

// ─── Enrollment ──────────────────────────────────────────────────────────────

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  approvedAt?: Date;
  withdrawnAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Permission ──────────────────────────────────────────────────────────────

export type PermissionScope = 'global' | 'organization' | 'class';

export interface IPermission {
  id: string;
  name: string;
  description?: string;
  scope: PermissionScope;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IUserPermissionGrant {
  id: string;
  userId: string;
  permissionName: string;
  organizationId?: string;
  classId?: string;
  grantedAt: Date;
}

export interface IPermissionContext {
  organizationId?: string;
  classId?: string;
}

// ─── Invitation ──────────────────────────────────────────────────────────────

export type InvitationType = 'student' | 'educator';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'revoked';

export interface IInvitation {
  id: string;
  email: string;
  token: string;
  type: InvitationType;
  organizationId?: string;
  programId?: string;
  status: InvitationStatus;
  data?: Record<string, unknown>;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

// ─── Service Interfaces ───────────────────────────────────────────────────────

export interface IProgramService {
  createProgram(name: string, description?: string, metadata?: Record<string, unknown>): IProgram;
  getProgram(id: string): IProgram;
  updateProgram(id: string, data: Partial<Omit<IProgram, 'id' | 'createdAt'>>): IProgram;
  listPrograms(filter?: Partial<IProgram>): IProgram[];
  deleteProgram(id: string): void;
  addSubject(programId: string, subjectId: string): void;
  removeSubject(programId: string, subjectId: string): void;
}

export interface IOrganizationService {
  createOrganization(name: string, type: string, metadata?: Record<string, unknown>): IOrganization;
  getOrganization(id: string): IOrganization;
  updateOrganization(id: string, data: Partial<Omit<IOrganization, 'id' | 'createdAt'>>): IOrganization;
  listOrganizations(filter?: Partial<IOrganization>): IOrganization[];
  deleteOrganization(id: string): void;
  addEducator(orgId: string, educatorId: string): void;
  removeEducator(orgId: string, educatorId: string): void;
}

export interface IStudentService {
  enrollStudent(orgId: string, userId: string, programId: string, metadata?: Record<string, unknown>): IStudent;
  getStudent(id: string): IStudent;
  updateStudent(id: string, data: Partial<Omit<IStudent, 'id' | 'createdAt'>>): IStudent;
  listStudents(orgId?: string, programId?: string): IStudent[];
  activateStudent(id: string): void;
  deactivateStudent(id: string): void;
}

export interface IEducatorService {
  registerEducator(userId: string, bio?: string, qualifications?: string[]): IEducator;
  getEducator(id: string): IEducator;
  updateEducator(id: string, data: Partial<Omit<IEducator, 'id' | 'createdAt'>>): IEducator;
  listEducators(orgId?: string): IEducator[];
  assignEducator(educatorId: string, orgId: string): void;
  unassignEducator(educatorId: string, orgId: string): void;
}

export interface IClassService {
  createClass(orgId: string, programId: string, subjectId: string, educatorId: string, name: string, schedule?: IClassSchedule): IClass;
  getClass(id: string): IClass;
  updateClass(id: string, data: Partial<Omit<IClass, 'id' | 'createdAt'>>): IClass;
  listClasses(orgId?: string, programId?: string, educatorId?: string): IClass[];
  deleteClass(id: string): void;
  addStudent(classId: string, studentId: string): void;
  removeStudent(classId: string, studentId: string): void;
}

export interface ISubjectService {
  createSubject(programId: string, code: string, name: string, description?: string): ISubject;
  getSubject(id: string): ISubject;
  updateSubject(id: string, data: Partial<Omit<ISubject, 'id' | 'createdAt'>>): ISubject;
  listSubjects(programId?: string): ISubject[];
  deleteSubject(id: string): void;
}

export interface IEnrollmentService {
  enrollInClass(studentId: string, classId: string): IEnrollment;
  getEnrollment(id: string): IEnrollment;
  listEnrollments(studentId?: string, classId?: string): IEnrollment[];
  withdrawFromClass(studentId: string, classId: string): void;
  approveEnrollment(enrollmentId: string): void;
  rejectEnrollment(enrollmentId: string): void;
}

export interface IPermissionService {
  definePermission(name: string, description?: string, scope?: PermissionScope): IPermission;
  grantPermission(userId: string, permissionName: string, orgId?: string, classId?: string): void;
  revokePermission(userId: string, permissionName: string, orgId?: string, classId?: string): void;
  hasPermission(userId: string, permissionName: string, context?: IPermissionContext): boolean;
  listPermissions(userId: string): IPermission[];
}

export interface IInvitationService {
  sendInvitation(email: string, type: InvitationType, orgId?: string, programId?: string, data?: Record<string, unknown>): IInvitation;
  getInvitation(token: string): IInvitation;
  acceptInvitation(token: string): IInvitation;
  rejectInvitation(token: string): void;
  listInvitations(orgId?: string): IInvitation[];
  revokeInvitation(id: string): void;
}

// ─── Education Module Interface ───────────────────────────────────────────────

export interface IEducationModule extends IModule {
  readonly name: 'education';
  readonly programs: IProgramService;
  readonly organizations: IOrganizationService;
  readonly students: IStudentService;
  readonly educators: IEducatorService;
  readonly classes: IClassService;
  readonly subjects: ISubjectService;
  readonly enrollments: IEnrollmentService;
  readonly permissions: IPermissionService;
  readonly invitations: IInvitationService;
}

// ─── Default Permissions ──────────────────────────────────────────────────────

export const DEFAULT_PERMISSIONS: Array<{ name: string; description: string; scope: PermissionScope }> = [
  { name: 'student.view_class', description: 'View class details', scope: 'class' },
  { name: 'student.submit_assignment', description: 'Submit assignments in a class', scope: 'class' },
  { name: 'educator.create_class', description: 'Create classes in an organization', scope: 'organization' },
  { name: 'educator.grade_assignment', description: 'Grade student assignments', scope: 'class' },
  { name: 'org_admin.manage_educators', description: 'Manage educators in an organization', scope: 'organization' },
  { name: 'org_admin.manage_students', description: 'Manage students in an organization', scope: 'organization' },
];
