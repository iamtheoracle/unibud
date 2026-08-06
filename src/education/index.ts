/**
 * Education Module — Entry Point
 *
 * Creates and exports the EducationModule instance.
 * Register with the Oracle Kernel via bootstrap().
 *
 * @example
 * ```ts
 * import { bootstrap } from '@/oracle/kernel';
 * import { educationModule } from '@/education';
 *
 * await bootstrap({ modules: [educationModule] });
 * ```
 */

import type { IOracle } from '@/oracle/kernel';

// Domain 1: Identity
import { StudentService } from './domains/identity/services/student.service';
import { EducatorService } from './domains/identity/services/educator.service';

// Domain 2: Academic
import { ProgramService } from './domains/academic/services/program.service';
import { SubjectService } from './domains/academic/services/subject.service';
import { ClassService } from './domains/academic/services/class.service';
import { EnrollmentService } from './domains/academic/services/enrollment.service';

// Domain 3: University
import { UniversityService } from './domains/university/services/university.service';
import { FacultyService } from './domains/university/services/faculty.service';
import { DepartmentService } from './domains/university/services/department.service';
import { CourseService } from './domains/university/services/course.service';

// Domain 4: Learning Organization
import { LearningOrganizationService } from './domains/learning-organization/services/organization.service';
import { LearningProgramService } from './domains/learning-organization/services/learning-program.service';

// Domain 5: Shared Infrastructure
import { PermissionService } from './domains/shared/services/permission.service';
import { InvitationService } from './domains/shared/services/invitation.service';

import type { IEducationModule } from './module';

// ─── Education Module Implementation ─────────────────────────────────────────

const EducationModule: IEducationModule = {
  name: 'education',
  version: '1.0.0',

  domains: {
    // Domain 1: Identity
    identity: {
      students: StudentService,
      educators: EducatorService,
    },

    // Domain 2: Academic
    academic: {
      programs: ProgramService,
      subjects: SubjectService,
      classes: ClassService,
      enrollments: EnrollmentService,
    },

    // Domain 3: University
    university: {
      universities: UniversityService,
      faculties: FacultyService,
      departments: DepartmentService,
      courses: CourseService,
    },

    // Domain 4: Learning Organization
    learningOrganization: {
      organizations: LearningOrganizationService,
      learningPrograms: LearningProgramService,
    },

    // Domain 5: Shared Infrastructure
    shared: {
      permissions: PermissionService,
      invitations: InvitationService,
    },
  },

  async initialize(oracle: IOracle): Promise<void> {
    // Register capabilities with the Oracle Kernel
    oracle.registerCapability({
      name: 'education.students',
      description: 'Student identity management',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.educators',
      description: 'Educator identity management',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.programs',
      description: 'Academic program management',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.classes',
      description: 'Class management and enrollment',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.universities',
      description: 'University structure management',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.learningOrganizations',
      description: 'Learning organization management',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.permissions',
      description: 'Education permission management',
      scope: 'module',
      moduleOwner: 'education',
    });
    oracle.registerCapability({
      name: 'education.invitations',
      description: 'Education invitation workflow',
      scope: 'module',
      moduleOwner: 'education',
    });

    oracle.emit('education:initialized', { version: this.version });
  },

  async shutdown(): Promise<void> {
    // Clean-up if needed in future
  },
};

export { EducationModule as educationModule };
export default EducationModule;
