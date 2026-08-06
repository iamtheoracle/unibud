/**
 * Education Module — IEducationModule Implementation
 *
 * Registers all education services with Oracle Kernel.
 * Oracle remains domain-agnostic — this module owns all education logic.
 */

import type { IOracle, ILogger } from '../oracle/kernel/types.js';
import type { IEducationModule } from './types/index.js';
import { DEFAULT_PERMISSIONS } from './types/index.js';

import { ProgramService } from './services/program.service.js';
import { OrganizationService } from './services/organization.service.js';
import { StudentService } from './services/student.service.js';
import { EducatorService } from './services/educator.service.js';
import { ClassService } from './services/class.service.js';
import { SubjectService } from './services/subject.service.js';
import { EnrollmentService } from './services/enrollment.service.js';
import { PermissionService } from './services/permission.service.js';
import { InvitationService } from './services/invitation.service.js';

export const EDUCATION_VERSION = '1.0.0';

export class EducationModule implements IEducationModule {
  readonly name = 'education' as const;
  readonly version = EDUCATION_VERSION;
  readonly description = 'Education Module — Programs, Organizations, Classes, Students, Educators';

  private moduleLogger?: ILogger;

  // Services are created lazily on initialize() to ensure the logger is available.
  programs!: ProgramService;
  organizations!: OrganizationService;
  students!: StudentService;
  educators!: EducatorService;
  classes!: ClassService;
  subjects!: SubjectService;
  enrollments!: EnrollmentService;
  permissions!: PermissionService;
  invitations!: InvitationService;

  async initialize(oracle: IOracle): Promise<void> {
    this.moduleLogger = oracle.logger.child('EducationModule');
    const logger = this.moduleLogger;
    logger.info('Education Module initializing…');

    // 1. Create service instances
    this.programs = new ProgramService(oracle.logger);
    this.organizations = new OrganizationService(oracle.logger);
    this.students = new StudentService(oracle.logger);
    this.educators = new EducatorService(oracle.logger);
    this.classes = new ClassService(oracle.logger);
    this.subjects = new SubjectService(oracle.logger);
    this.enrollments = new EnrollmentService(oracle.logger);
    this.permissions = new PermissionService(oracle.logger);
    this.invitations = new InvitationService(oracle.logger);

    // 2. Register services with Oracle DI
    oracle.dependencies.register('ProgramService', this.programs);
    oracle.dependencies.register('OrganizationService', this.organizations);
    oracle.dependencies.register('StudentService', this.students);
    oracle.dependencies.register('EducatorService', this.educators);
    oracle.dependencies.register('ClassService', this.classes);
    oracle.dependencies.register('SubjectService', this.subjects);
    oracle.dependencies.register('EnrollmentService', this.enrollments);
    oracle.dependencies.register('PermissionService', this.permissions);
    oracle.dependencies.register('InvitationService', this.invitations);

    // 3. Register capabilities with Oracle
    const capabilities = [
      'education.manage_programs',
      'education.manage_organizations',
      'education.manage_students',
      'education.manage_educators',
      'education.manage_classes',
      'education.manage_subjects',
      'education.manage_enrollments',
      'education.manage_permissions',
      'education.manage_invitations',
    ];
    for (const cap of capabilities) {
      oracle.capabilities.register({ name: cap, provider: 'education', version: EDUCATION_VERSION });
    }

    // 4. Register resources with Oracle
    oracle.resources.register({ id: 'education.programs', type: 'resource_collection', provider: 'education', name: 'Academic Programs' });
    oracle.resources.register({ id: 'education.organizations', type: 'resource_collection', provider: 'education', name: 'Learning Organizations' });
    oracle.resources.register({ id: 'education.students', type: 'resource_collection', provider: 'education', name: 'Students' });
    oracle.resources.register({ id: 'education.educators', type: 'resource_collection', provider: 'education', name: 'Educators' });
    oracle.resources.register({ id: 'education.classes', type: 'resource_collection', provider: 'education', name: 'Classes' });
    oracle.resources.register({ id: 'education.subjects', type: 'resource_collection', provider: 'education', name: 'Subjects' });
    oracle.resources.register({ id: 'education.enrollments', type: 'resource_collection', provider: 'education', name: 'Enrollments' });

    // 5. Seed default permissions
    for (const { name, description, scope } of DEFAULT_PERMISSIONS) {
      this.permissions.definePermission(name, description, scope);
    }

    // 6. Register health check
    oracle.health.register('education', async () => ({
      name: 'education',
      status: 'healthy',
      message: 'Education Module operational',
      checkedAt: new Date(),
      metadata: { version: EDUCATION_VERSION },
    }));

    logger.info('Education Module initialized.', { version: EDUCATION_VERSION });
  }

  async shutdown(): Promise<void> {
    // In-memory stores are cleared automatically on process exit.
    // Persistent stores would flush/disconnect here.
    this.moduleLogger?.info('Education Module shut down.');
  }
}

/** Singleton Education Module instance. */
export const educationModule = new EducationModule();
