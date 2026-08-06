import { describe, it, expect, beforeEach } from 'vitest';
import { EducationModule } from '../module';
import type { IOracle, IOracleEvent, IOracleCommand } from '../oracle.interface';

// ─── Mock Oracle ──────────────────────────────────────────────────────────────
function createMockOracle(): IOracle {
  const modules = new Map();
  const events: IOracleEvent[] = [];
  return {
    registerModule: (m) => modules.set(m.name, m),
    getModule: (name) => modules.get(name),
    emit: (event) => events.push(event),
    execute: async (_cmd: IOracleCommand) => null,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

describe('EducationModule Integration', () => {
  let module: EducationModule;
  let oracle: IOracle;

  beforeEach(async () => {
    module = new EducationModule();
    oracle = createMockOracle();
    await module.initialize(oracle);
  });

  it('registers with oracle on initialize', () => {
    expect(oracle.getModule('education')).toBe(module);
  });

  it('has correct name and version', () => {
    expect(module.name).toBe('education');
    expect(module.version).toBe('1.0.0');
  });

  it('registers default permissions on initialize', () => {
    const perms = module.permissions.listPermissions();
    expect(perms.length).toBeGreaterThan(0);
    const names = perms.map(p => p.name);
    expect(names).toContain('university:create');
    expect(names).toContain('organization:create');
    expect(names).toContain('enrollment:create');
  });

  it('shuts down gracefully', async () => {
    await expect(module.shutdown()).resolves.toBeUndefined();
  });

  describe('University Ecosystem Workflow', () => {
    it('creates full university hierarchy', () => {
      const uni = module.universities.createUniversity('UNILAG', 'UNILAG', 'University of Lagos');
      const faculty = module.faculties.createFaculty(uni.id, 'Engineering', 'ENG');
      module.universities.addFaculty(uni.id, faculty.id);
      const dept = module.departments.createDepartment(faculty.id, 'Computer Science', 'CS');
      module.faculties.addDepartment(faculty.id, dept.id);
      const course = module.courses.createCourse(dept.id, 'CS101', 'Intro to CS', undefined, 3);
      module.departments.addCourse(dept.id, course.id);

      const foundUni = module.universities.getUniversity(uni.id);
      expect(foundUni.faculties).toContain(faculty.id);
      const foundFac = module.faculties.getFaculty(faculty.id);
      expect(foundFac.departments).toContain(dept.id);
      const foundDept = module.departments.getDepartment(dept.id);
      expect(foundDept.courses).toContain(course.id);
    });

    it('enrolls university student', () => {
      const uni = module.universities.createUniversity('ABU', 'ABU');
      const fac = module.faculties.createFaculty(uni.id, 'Sciences', 'SCI');
      const dept = module.departments.createDepartment(fac.id, 'Physics', 'PHY');
      const crs = module.courses.createCourse(dept.id, 'PHY101', 'Mechanics');
      const student = module.universityStudents.enrollStudent(uni.id, 'user123', dept.id, crs.id, 'ABU/2024/0001', '100');
      expect(student.status).toBe('active');
      expect(student.level).toBe('100');
    });
  });

  describe('Learning Organization Ecosystem Workflow', () => {
    it('creates a learning org and enrolls students', () => {
      const prog = module.programs.createProgram('WAEC 2025', 'waec', 'learningOrg');
      const org = module.organizations.createOrganization('Top Exam Centre', 'examCentre', 'WAEC prep');
      const subject = module.subjects.createSubject(prog.id, 'MATH', 'Mathematics');
      const educator = module.educators.registerEducator('teach@example.com', 'Mr. Obi');
      module.educators.assignToOrganization(educator.id, org.id);
      module.organizations.addEducator(org.id, educator.id);
      const cls = module.classes.createClass(org.id, prog.id, subject.id, educator.id, 'WAEC Maths Class A');
      const student = module.orgStudents.enrollStudent(org.id, 'user456', prog.id, 'ENR-001');
      const enrollment = module.enrollments.enrollInClass(student.id, cls.id);
      module.enrollments.approveEnrollment(enrollment.id);

      expect(student.organizationId).toBe(org.id);
      const approvedEnrollment = module.enrollments.getEnrollment(enrollment.id);
      expect(approvedEnrollment.status).toBe('approved');
    });
  });

  describe('Shared Foundation Across Both Ecosystems', () => {
    it('uses same class service for both ecosystems', () => {
      const uniProg = module.programs.createProgram('B.Sc. CS', 'university_degree', 'university');
      const orgProg = module.programs.createProgram('JAMB', 'jamb', 'learningOrg');
      const subject = module.subjects.createSubject(uniProg.id, 'CS101', 'Intro CS');
      const educator = module.educators.registerEducator('prof@uni.edu', 'Prof. Ada');

      const uniClass = module.classes.createClass('uni1', uniProg.id, subject.id, educator.id, 'CS101 Lecture A');
      const orgClass = module.classes.createClass('org1', orgProg.id, subject.id, educator.id, 'JAMB CS');

      expect(module.classes.listClasses('uni1')).toHaveLength(1);
      expect(module.classes.listClasses('org1')).toHaveLength(1);
      expect(module.classes.listClasses()).toHaveLength(2);
    });
  });
});
