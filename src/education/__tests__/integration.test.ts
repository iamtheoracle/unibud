import { describe, it, expect, beforeEach } from 'vitest';
import { OracleKernel } from '../../oracle/kernel/oracle-kernel.js';
import { EducationModule } from '../module.js';
import type { ProgramService } from '../services/program.service.js';
import type { OrganizationService } from '../services/organization.service.js';
import type { StudentService } from '../services/student.service.js';
import type { EducatorService } from '../services/educator.service.js';
import type { ClassService } from '../services/class.service.js';
import type { SubjectService } from '../services/subject.service.js';
import type { EnrollmentService } from '../services/enrollment.service.js';
import type { PermissionService } from '../services/permission.service.js';
import type { InvitationService } from '../services/invitation.service.js';
import { DEFAULT_PERMISSIONS } from '../types/index.js';

describe('Education Module ↔ Oracle Integration', () => {
  let oracle: OracleKernel;
  let education: EducationModule;

  beforeEach(async () => {
    oracle = new OracleKernel();
    education = new EducationModule();
    await oracle.modules.register(education);
    await oracle.bootstrap();
  });

  it('registers education module with Oracle', () => {
    expect(oracle.modules.has('education')).toBe(true);
    expect(oracle.modules.get('education')).toBe(education);
  });

  it('registers all 9 services with Oracle DI', () => {
    const tokens = [
      'ProgramService',
      'OrganizationService',
      'StudentService',
      'EducatorService',
      'ClassService',
      'SubjectService',
      'EnrollmentService',
      'PermissionService',
      'InvitationService',
    ];
    for (const token of tokens) {
      expect(oracle.dependencies.has(token)).toBe(true);
    }
  });

  it('resolves services from Oracle DI', () => {
    const programs = oracle.dependencies.resolve<ProgramService>('ProgramService');
    expect(typeof programs.createProgram).toBe('function');
  });

  it('registers 9 capabilities with Oracle', () => {
    const caps = oracle.capabilities.listByProvider('education');
    expect(caps.length).toBeGreaterThanOrEqual(9);
    const capNames = caps.map((c) => c.name);
    expect(capNames).toContain('education.manage_programs');
    expect(capNames).toContain('education.manage_students');
    expect(capNames).toContain('education.manage_enrollments');
  });

  it('registers resources with Oracle', () => {
    const resources = oracle.resources.listByProvider('education');
    expect(resources.length).toBeGreaterThanOrEqual(7);
    const types = resources.map((r) => r.id);
    expect(types).toContain('education.programs');
    expect(types).toContain('education.classes');
  });

  it('registers education health check', async () => {
    const result = await oracle.health.check('education');
    expect(result.status).toBe('healthy');
    expect(result.name).toBe('education');
  });

  it('seeds default permissions', () => {
    for (const { name } of DEFAULT_PERMISSIONS) {
      expect(
        education.permissions.listPermissions('nobody').find(() => true) ?? null,
      ).toBe(null); // user has none
      // Verify the permission is defined by granting it
      expect(() =>
        education.permissions.grantPermission('user-test', name),
      ).not.toThrow();
    }
  });

  it('full end-to-end education workflow', () => {
    const programs = oracle.dependencies.resolve<ProgramService>('ProgramService');
    const orgs = oracle.dependencies.resolve<OrganizationService>('OrganizationService');
    const students = oracle.dependencies.resolve<StudentService>('StudentService');
    const educators = oracle.dependencies.resolve<EducatorService>('EducatorService');
    const classes = oracle.dependencies.resolve<ClassService>('ClassService');
    const subjects = oracle.dependencies.resolve<SubjectService>('SubjectService');
    const enrollments = oracle.dependencies.resolve<EnrollmentService>('EnrollmentService');
    const permissions = oracle.dependencies.resolve<PermissionService>('PermissionService');
    const invitations = oracle.dependencies.resolve<InvitationService>('InvitationService');

    // 1. Create a program
    const program = programs.createProgram('WAEC 2025', 'West African Exams', { type: 'preUniversity' });
    expect(program.id).toBeTruthy();

    // 2. Create a subject and link to program
    const subject = subjects.createSubject(program.id, 'ENG101', 'English Language');
    programs.addSubject(program.id, subject.id);
    expect(programs.getProgram(program.id).subjects).toContain(subject.id);

    // 3. Create an organization
    const org = orgs.createOrganization('Lagos Tutorial Centre', 'TutorialCentre');
    expect(org.id).toBeTruthy();

    // 4. Register and assign an educator
    const educator = educators.registerEducator('user-edu-1', 'MSc English');
    educators.assignEducator(educator.id, org.id);
    orgs.addEducator(org.id, educator.id);
    expect(educators.getEducator(educator.id).organizations).toContain(org.id);

    // 5. Create a class
    const cls = classes.createClass(org.id, program.id, subject.id, educator.id, 'English A', {
      days: ['Monday'],
      time: '10:00',
    });
    expect(cls.students).toHaveLength(0);

    // 6. Enroll a student
    const student = students.enrollStudent(org.id, 'user-stu-1', program.id);
    classes.addStudent(cls.id, student.id);
    expect(classes.getClass(cls.id).students).toContain(student.id);

    // 7. Class enrollment with approval flow
    const enrollment = enrollments.enrollInClass(student.id, cls.id);
    expect(enrollment.status).toBe('pending');
    enrollments.approveEnrollment(enrollment.id);
    expect(enrollments.getEnrollment(enrollment.id).status).toBe('approved');

    // 8. Permission check
    permissions.grantPermission(student.userId, 'student.view_class', org.id, cls.id);
    expect(
      permissions.hasPermission(student.userId, 'student.view_class', { classId: cls.id }),
    ).toBe(true);

    // 9. Invitation
    const inv = invitations.sendInvitation('new@student.com', 'student', org.id, program.id);
    expect(inv.status).toBe('pending');
    invitations.acceptInvitation(inv.token);
    expect(invitations.getInvitation(inv.token).status).toBe('accepted');
  });

  it('Oracle lifecycle correctly starts and stops', async () => {
    expect(oracle.lifecycle.getStatus()).toBe('running');
    await oracle.shutdown();
    expect(oracle.lifecycle.getStatus()).toBe('stopped');
  });
});
