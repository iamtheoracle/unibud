// ─── Education Module ─────────────────────────────────────────────────────────
// Two distinct education ecosystems sharing a common foundation.
//
// University Ecosystem:  University → Faculty → Department → Course → Student
// Learning Org Ecosystem: Organization → Program → Class → Student
//
// Shared Foundation: Programs, Classes, Subjects, Educators, Enrollments,
//                    Permissions, Invitations

export { EducationModule } from './module';
export type { IEducationModule } from './module';

// Oracle interface
export type { IModule, IOracle, IOracleEvent, IOracleCommand, IOracleLogger } from './oracle.interface';

// Types
export type {
  IProgram,
  IClass,
  ISubject,
  IEducator,
  IEnrollment,
  IPermission,
  IUserPermission,
  IInvitation,
} from './types/shared';

export type {
  IUniversity,
  IFaculty,
  IDepartment,
  ICourse,
  IUniversityStudent,
} from './types/university';

export type {
  LearningOrgType,
  ILearningOrganization,
  ILearningOrgStudent,
} from './types/learning-org';

// Shared services
export { ProgramService } from './services/shared/program.service';
export { ClassService } from './services/shared/class.service';
export { SubjectService } from './services/shared/subject.service';
export { EducatorService } from './services/shared/educator.service';
export { EnrollmentService } from './services/shared/enrollment.service';
export { PermissionService } from './services/shared/permission.service';
export { InvitationService } from './services/shared/invitation.service';

// University ecosystem services
export { UniversityService } from './services/university/university.service';
export { FacultyService } from './services/university/faculty.service';
export { DepartmentService } from './services/university/department.service';
export { CourseService } from './services/university/course.service';
export { UniversityStudentService } from './services/university/university-student.service';

// Learning organization ecosystem services
export { LearningOrganizationService } from './services/learning-org/organization.service';
export { LearningOrgStudentService } from './services/learning-org/org-student.service';

// API route factories
export { createProgramRoutes } from './api/shared/programs.routes';
export { createClassRoutes } from './api/shared/classes.routes';
export { createSubjectRoutes } from './api/shared/subjects.routes';
export { createEducatorRoutes } from './api/shared/educators.routes';
export { createEnrollmentRoutes } from './api/shared/enrollments.routes';
export { createPermissionRoutes } from './api/shared/permissions.routes';
export { createInvitationRoutes } from './api/shared/invitations.routes';
export { createUniversityRoutes } from './api/university/universities.routes';
export { createFacultyRoutes } from './api/university/faculties.routes';
export { createDepartmentRoutes } from './api/university/departments.routes';
export { createCourseRoutes } from './api/university/courses.routes';
export { createUniversityStudentRoutes } from './api/university/university-students.routes';
export { createOrganizationRoutes } from './api/learning-org/organizations.routes';
export { createOrgStudentRoutes } from './api/learning-org/org-students.routes';
