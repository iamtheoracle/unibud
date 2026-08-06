import type { IModule, IOracle } from './oracle.interface';

// Shared foundation services
import { ProgramService } from './services/shared/program.service';
import { ClassService } from './services/shared/class.service';
import { SubjectService } from './services/shared/subject.service';
import { EducatorService } from './services/shared/educator.service';
import { EnrollmentService } from './services/shared/enrollment.service';
import { PermissionService } from './services/shared/permission.service';
import { InvitationService } from './services/shared/invitation.service';

// University ecosystem services
import { UniversityService } from './services/university/university.service';
import { FacultyService } from './services/university/faculty.service';
import { DepartmentService } from './services/university/department.service';
import { CourseService } from './services/university/course.service';
import { UniversityStudentService } from './services/university/university-student.service';

// Learning organization ecosystem services
import { LearningOrganizationService } from './services/learning-org/organization.service';
import { LearningOrgStudentService } from './services/learning-org/org-student.service';

export interface IEducationModule extends IModule {
  name: 'education';
  version: '1.0.0';

  // Shared foundation
  programs: ProgramService;
  classes: ClassService;
  subjects: SubjectService;
  educators: EducatorService;
  enrollments: EnrollmentService;
  permissions: PermissionService;
  invitations: InvitationService;

  // University ecosystem
  universities: UniversityService;
  faculties: FacultyService;
  departments: DepartmentService;
  courses: CourseService;
  universityStudents: UniversityStudentService;

  // Learning organization ecosystem
  organizations: LearningOrganizationService;
  orgStudents: LearningOrgStudentService;
}

export class EducationModule implements IEducationModule {
  readonly name = 'education' as const;
  readonly version = '1.0.0' as const;

  // Shared foundation services
  readonly programs = new ProgramService();
  readonly classes = new ClassService();
  readonly subjects = new SubjectService();
  readonly educators = new EducatorService();
  readonly enrollments = new EnrollmentService();
  readonly permissions = new PermissionService();
  readonly invitations = new InvitationService();

  // University ecosystem services
  readonly universities = new UniversityService();
  readonly faculties = new FacultyService();
  readonly departments = new DepartmentService();
  readonly courses = new CourseService();
  readonly universityStudents = new UniversityStudentService();

  // Learning organization ecosystem services
  readonly organizations = new LearningOrganizationService();
  readonly orgStudents = new LearningOrgStudentService();

  private oracle?: IOracle;

  async initialize(oracle: IOracle): Promise<void> {
    this.oracle = oracle;
    oracle.registerModule(this);
    oracle.logger.info('Education Module initialized', { name: this.name, version: this.version });
    this.registerDefaultPermissions();
  }

  async shutdown(): Promise<void> {
    this.oracle?.logger.info('Education Module shutting down', { name: this.name });
    this.oracle = undefined;
  }

  private registerDefaultPermissions(): void {
    const defaultPermissions = [
      // University ecosystem
      { name: 'university:create', description: 'Create universities', scope: 'university' },
      { name: 'university:read', description: 'Read university data', scope: 'university' },
      { name: 'university:update', description: 'Update university data', scope: 'university' },
      { name: 'university:delete', description: 'Delete universities', scope: 'university' },
      { name: 'faculty:create', description: 'Create faculties', scope: 'university' },
      { name: 'faculty:read', description: 'Read faculty data', scope: 'university' },
      { name: 'faculty:update', description: 'Update faculty data', scope: 'university' },
      { name: 'faculty:delete', description: 'Delete faculties', scope: 'university' },
      { name: 'department:create', description: 'Create departments', scope: 'university' },
      { name: 'department:read', description: 'Read department data', scope: 'university' },
      { name: 'department:update', description: 'Update department data', scope: 'university' },
      { name: 'department:delete', description: 'Delete departments', scope: 'university' },
      { name: 'course:create', description: 'Create courses', scope: 'university' },
      { name: 'course:read', description: 'Read course data', scope: 'university' },
      { name: 'course:update', description: 'Update course data', scope: 'university' },
      { name: 'course:delete', description: 'Delete courses', scope: 'university' },
      // Learning org ecosystem
      { name: 'organization:create', description: 'Create learning organizations', scope: 'learningOrg' },
      { name: 'organization:read', description: 'Read organization data', scope: 'learningOrg' },
      { name: 'organization:update', description: 'Update organization data', scope: 'learningOrg' },
      { name: 'organization:delete', description: 'Delete organizations', scope: 'learningOrg' },
      // Shared
      { name: 'program:create', description: 'Create academic programs', scope: 'global' },
      { name: 'program:read', description: 'Read program data', scope: 'global' },
      { name: 'program:update', description: 'Update program data', scope: 'global' },
      { name: 'class:create', description: 'Create classes', scope: 'global' },
      { name: 'class:read', description: 'Read class data', scope: 'global' },
      { name: 'class:update', description: 'Update class data', scope: 'global' },
      { name: 'enrollment:create', description: 'Enroll in classes', scope: 'global' },
      { name: 'enrollment:approve', description: 'Approve enrollments', scope: 'global' },
      { name: 'educator:register', description: 'Register educators', scope: 'global' },
      { name: 'invitation:send', description: 'Send invitations', scope: 'global' },
    ];

    for (const perm of defaultPermissions) {
      try {
        this.permissions.definePermission(perm.name, perm.description, perm.scope);
      } catch {
        // Permission may already exist — skip
      }
    }
  }
}
