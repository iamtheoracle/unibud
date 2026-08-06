/**
 * Education Module — Public API
 */

export type {
  IProgram,
  IOrganization,
  IStudent,
  StudentStatus,
  IEducator,
  IClass,
  IClassSchedule,
  ISubject,
  IEnrollment,
  EnrollmentStatus,
  IPermission,
  IUserPermissionGrant,
  IPermissionContext,
  PermissionScope,
  IInvitation,
  InvitationType,
  InvitationStatus,
  IProgramService,
  IOrganizationService,
  IStudentService,
  IEducatorService,
  IClassService,
  ISubjectService,
  IEnrollmentService,
  IPermissionService,
  IInvitationService,
  IEducationModule,
} from './types/index.js';

export { DEFAULT_PERMISSIONS } from './types/index.js';

export { ProgramService } from './services/program.service.js';
export { OrganizationService } from './services/organization.service.js';
export { StudentService } from './services/student.service.js';
export { EducatorService } from './services/educator.service.js';
export { ClassService } from './services/class.service.js';
export { SubjectService } from './services/subject.service.js';
export { EnrollmentService } from './services/enrollment.service.js';
export { PermissionService } from './services/permission.service.js';
export { InvitationService } from './services/invitation.service.js';

export { EducationModule, educationModule, EDUCATION_VERSION } from './module.js';
