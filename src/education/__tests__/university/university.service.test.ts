import { describe, it, expect, beforeEach } from 'vitest';
import { UniversityService } from '../../services/university/university.service';
import { FacultyService } from '../../services/university/faculty.service';
import { DepartmentService } from '../../services/university/department.service';
import { CourseService } from '../../services/university/course.service';
import { UniversityStudentService } from '../../services/university/university-student.service';

describe('University Ecosystem Services', () => {
  describe('UniversityService', () => {
    let service: UniversityService;

    beforeEach(() => { service = new UniversityService(); });

    it('creates a university', () => {
      const uni = service.createUniversity('University of Lagos', 'UNILAG', 'Premier uni');
      expect(uni.id).toBeTruthy();
      expect(uni.code).toBe('UNILAG');
      expect(uni.faculties).toEqual([]);
    });

    it('gets a university', () => {
      const uni = service.createUniversity('U1', 'U1CODE');
      expect(service.getUniversity(uni.id).id).toBe(uni.id);
    });

    it('throws if not found', () => {
      expect(() => service.getUniversity('bad')).toThrow('University not found');
    });

    it('updates university', () => {
      const uni = service.createUniversity('Old', 'OLD');
      const updated = service.updateUniversity(uni.id, { name: 'New', code: 'NEW' });
      expect(updated.name).toBe('New');
    });

    it('lists universities', () => {
      service.createUniversity('A', 'A1');
      service.createUniversity('B', 'B1');
      expect(service.listUniversities()).toHaveLength(2);
    });

    it('deletes university', () => {
      const uni = service.createUniversity('X', 'X1');
      service.deleteUniversity(uni.id);
      expect(service.listUniversities()).toHaveLength(0);
    });

    it('throws delete if not found', () => {
      expect(() => service.deleteUniversity('bad')).toThrow('University not found');
    });

    it('adds a faculty reference', () => {
      const uni = service.createUniversity('UNILAG', 'ULAG');
      service.addFaculty(uni.id, 'fac1');
      service.addFaculty(uni.id, 'fac1'); // idempotent
      expect(service.getUniversity(uni.id).faculties).toHaveLength(1);
    });
  });

  describe('FacultyService', () => {
    let service: FacultyService;

    beforeEach(() => { service = new FacultyService(); });

    it('creates a faculty', () => {
      const fac = service.createFaculty('uni1', 'Engineering', 'ENG');
      expect(fac.universityId).toBe('uni1');
      expect(fac.code).toBe('ENG');
      expect(fac.departments).toEqual([]);
    });

    it('lists faculties by university', () => {
      service.createFaculty('u1', 'Eng', 'ENG');
      service.createFaculty('u1', 'Sci', 'SCI');
      service.createFaculty('u2', 'Art', 'ART');
      expect(service.listFaculties('u1')).toHaveLength(2);
      expect(service.listFaculties('u2')).toHaveLength(1);
    });

    it('adds department reference', () => {
      const fac = service.createFaculty('u1', 'Med', 'MED');
      service.addDepartment(fac.id, 'dept1');
      expect(service.getFaculty(fac.id).departments).toContain('dept1');
    });

    it('throws if not found', () => {
      expect(() => service.getFaculty('bad')).toThrow('Faculty not found');
    });

    it('deletes a faculty', () => {
      const fac = service.createFaculty('u1', 'Law', 'LAW');
      service.deleteFaculty(fac.id);
      expect(service.listFaculties()).toHaveLength(0);
    });
  });

  describe('DepartmentService', () => {
    let service: DepartmentService;

    beforeEach(() => { service = new DepartmentService(); });

    it('creates a department', () => {
      const dept = service.createDepartment('fac1', 'Computer Science', 'CS');
      expect(dept.facultyId).toBe('fac1');
      expect(dept.code).toBe('CS');
      expect(dept.courses).toEqual([]);
    });

    it('lists departments by faculty', () => {
      service.createDepartment('f1', 'CS', 'CS');
      service.createDepartment('f1', 'EE', 'EE');
      service.createDepartment('f2', 'Chem', 'CHM');
      expect(service.listDepartments('f1')).toHaveLength(2);
    });

    it('adds course reference', () => {
      const dept = service.createDepartment('f1', 'CS', 'CS');
      service.addCourse(dept.id, 'crs1');
      expect(service.getDepartment(dept.id).courses).toContain('crs1');
    });

    it('throws if not found', () => {
      expect(() => service.getDepartment('bad')).toThrow('Department not found');
    });
  });

  describe('CourseService', () => {
    let service: CourseService;

    beforeEach(() => { service = new CourseService(); });

    it('creates a course', () => {
      const crs = service.createCourse('dept1', 'CS101', 'Intro to CS', 'Fundamentals', 3);
      expect(crs.departmentId).toBe('dept1');
      expect(crs.code).toBe('CS101');
      expect(crs.credits).toBe(3);
    });

    it('lists courses by department', () => {
      service.createCourse('d1', 'CS101', 'C1');
      service.createCourse('d1', 'CS102', 'C2');
      service.createCourse('d2', 'EE101', 'C3');
      expect(service.listCourses('d1')).toHaveLength(2);
    });

    it('updates course', () => {
      const crs = service.createCourse('d1', 'X', 'X');
      const updated = service.updateCourse(crs.id, { credits: 4 });
      expect(updated.credits).toBe(4);
    });

    it('deletes course', () => {
      const crs = service.createCourse('d1', 'Y', 'Y');
      service.deleteCourse(crs.id);
      expect(service.listCourses()).toHaveLength(0);
    });

    it('throws if not found', () => {
      expect(() => service.getCourse('bad')).toThrow('Course not found');
    });
  });

  describe('UniversityStudentService', () => {
    let service: UniversityStudentService;

    beforeEach(() => { service = new UniversityStudentService(); });

    it('enrolls a university student', () => {
      const s = service.enrollStudent('uni1', 'user1', 'dept1', 'crs1', 'ULAG/2024/001', '100');
      expect(s.universityId).toBe('uni1');
      expect(s.matriculationNumber).toBe('ULAG/2024/001');
      expect(s.level).toBe('100');
      expect(s.status).toBe('active');
    });

    it('lists students by university, department, course', () => {
      service.enrollStudent('uni1', 'u1', 'd1', 'c1');
      service.enrollStudent('uni1', 'u2', 'd1', 'c2');
      service.enrollStudent('uni2', 'u3', 'd2', 'c3');
      expect(service.listStudents('uni1')).toHaveLength(2);
      expect(service.listStudents(undefined, 'd1')).toHaveLength(2);
      expect(service.listStudents(undefined, undefined, 'c3')).toHaveLength(1);
    });

    it('activates and deactivates student', () => {
      const s = service.enrollStudent('uni1', 'u1', 'd1', 'c1');
      service.deactivateStudent(s.id);
      expect(service.getStudent(s.id).status).toBe('inactive');
      service.activateStudent(s.id);
      expect(service.getStudent(s.id).status).toBe('active');
    });

    it('throws if not found', () => {
      expect(() => service.getStudent('bad')).toThrow('University student not found');
    });
  });
});
