/**
 * Education Module — IEducationModule Interface
 *
 * Defines the public contract of the Education Module.
 * Registered with the Oracle Kernel on bootstrap.
 */

import type { IModule } from '@/oracle/kernel';

import type { StudentService as StudentServiceType } from './domains/identity/services/student.service';
import type { EducatorService as EducatorServiceType } from './domains/identity/services/educator.service';
import type { ProgramService as ProgramServiceType } from './domains/academic/services/program.service';
import type { SubjectService as SubjectServiceType } from './domains/academic/services/subject.service';
import type { ClassService as ClassServiceType } from './domains/academic/services/class.service';
import type { EnrollmentService as EnrollmentServiceType } from './domains/academic/services/enrollment.service';
import type { UniversityService as UniversityServiceType } from './domains/university/services/university.service';
import type { FacultyService as FacultyServiceType } from './domains/university/services/faculty.service';
import type { DepartmentService as DepartmentServiceType } from './domains/university/services/department.service';
import type { CourseService as CourseServiceType } from './domains/university/services/course.service';
import type { LearningOrganizationService as LearningOrganizationServiceType } from './domains/learning-organization/services/organization.service';
import type { LearningProgramService as LearningProgramServiceType } from './domains/learning-organization/services/learning-program.service';
import type { PermissionService as PermissionServiceType } from './domains/shared/services/permission.service';
import type { InvitationService as InvitationServiceType } from './domains/shared/services/invitation.service';

export interface IEducationModule extends IModule {
  readonly name: 'education';
  readonly version: '1.0.0';

  domains: {
    /** Domain 1: Identity */
    identity: {
      students: typeof StudentServiceType;
      educators: typeof EducatorServiceType;
    };

    /** Domain 2: Academic */
    academic: {
      programs: typeof ProgramServiceType;
      subjects: typeof SubjectServiceType;
      classes: typeof ClassServiceType;
      enrollments: typeof EnrollmentServiceType;
    };

    /** Domain 3: University */
    university: {
      universities: typeof UniversityServiceType;
      faculties: typeof FacultyServiceType;
      departments: typeof DepartmentServiceType;
      courses: typeof CourseServiceType;
    };

    /** Domain 4: Learning Organization */
    learningOrganization: {
      organizations: typeof LearningOrganizationServiceType;
      learningPrograms: typeof LearningProgramServiceType;
    };

    /** Domain 5: Shared Infrastructure */
    shared: {
      permissions: typeof PermissionServiceType;
      invitations: typeof InvitationServiceType;
    };
  };
}
