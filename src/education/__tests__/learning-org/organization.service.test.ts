import { describe, it, expect, beforeEach } from 'vitest';
import { LearningOrganizationService } from '../../services/learning-org/organization.service';
import { LearningOrgStudentService } from '../../services/learning-org/org-student.service';

describe('Learning Organization Ecosystem Services', () => {
  describe('LearningOrganizationService', () => {
    let service: LearningOrganizationService;

    beforeEach(() => { service = new LearningOrganizationService(); });

    it('creates an exam centre', () => {
      const org = service.createOrganization('Skyline Exam Centre', 'examCentre', 'Top exam centre');
      expect(org.id).toBeTruthy();
      expect(org.type).toBe('examCentre');
      expect(org.educators).toEqual([]);
    });

    it('creates a tutorial centre', () => {
      const org = service.createOrganization('Bright Tutors', 'tutorialCentre');
      expect(org.type).toBe('tutorialCentre');
    });

    it('creates an academy', () => {
      const org = service.createOrganization('Apex Academy', 'academy');
      expect(org.type).toBe('academy');
    });

    it('creates a training centre', () => {
      const org = service.createOrganization('TechTrain', 'trainingCentre');
      expect(org.type).toBe('trainingCentre');
    });

    it('gets an organization', () => {
      const org = service.createOrganization('MyOrg', 'academy');
      const found = service.getOrganization(org.id);
      expect(found.id).toBe(org.id);
    });

    it('throws on get if not found', () => {
      expect(() => service.getOrganization('bad')).toThrow('Learning organization not found');
    });

    it('updates organization', () => {
      const org = service.createOrganization('Old', 'academy');
      const updated = service.updateOrganization(org.id, { name: 'New', description: 'Updated' });
      expect(updated.name).toBe('New');
      expect(updated.description).toBe('Updated');
    });

    it('lists organizations with optional type filter', () => {
      service.createOrganization('E1', 'examCentre');
      service.createOrganization('E2', 'examCentre');
      service.createOrganization('T1', 'tutorialCentre');
      expect(service.listOrganizations()).toHaveLength(3);
      expect(service.listOrganizations('examCentre')).toHaveLength(2);
      expect(service.listOrganizations('tutorialCentre')).toHaveLength(1);
    });

    it('deletes organization', () => {
      const org = service.createOrganization('X', 'academy');
      service.deleteOrganization(org.id);
      expect(service.listOrganizations()).toHaveLength(0);
    });

    it('throws delete if not found', () => {
      expect(() => service.deleteOrganization('bad')).toThrow('Learning organization not found');
    });

    it('adds educator to organization', () => {
      const org = service.createOrganization('MyAcad', 'academy');
      service.addEducator(org.id, 'edu1');
      service.addEducator(org.id, 'edu1'); // idempotent
      expect(service.getOrganization(org.id).educators).toHaveLength(1);
    });

    it('throws addEducator if org not found', () => {
      expect(() => service.addEducator('bad', 'edu1')).toThrow('Learning organization not found');
    });
  });

  describe('LearningOrgStudentService', () => {
    let service: LearningOrgStudentService;

    beforeEach(() => { service = new LearningOrgStudentService(); });

    it('enrolls a learning org student', () => {
      const s = service.enrollStudent('org1', 'user1', 'prog1', 'ENR-001');
      expect(s.id).toBeTruthy();
      expect(s.organizationId).toBe('org1');
      expect(s.programId).toBe('prog1');
      expect(s.enrollmentNumber).toBe('ENR-001');
      expect(s.status).toBe('active');
    });

    it('gets a student', () => {
      const s = service.enrollStudent('org1', 'u1', 'p1');
      const found = service.getStudent(s.id);
      expect(found.id).toBe(s.id);
    });

    it('throws on get if not found', () => {
      expect(() => service.getStudent('bad')).toThrow('Learning org student not found');
    });

    it('updates student enrollment number', () => {
      const s = service.enrollStudent('org1', 'u1', 'p1');
      const updated = service.updateStudent(s.id, { enrollmentNumber: 'ENR-999' });
      expect(updated.enrollmentNumber).toBe('ENR-999');
    });

    it('lists students by organization and program', () => {
      service.enrollStudent('org1', 'u1', 'p1');
      service.enrollStudent('org1', 'u2', 'p2');
      service.enrollStudent('org2', 'u3', 'p1');
      expect(service.listStudents('org1')).toHaveLength(2);
      expect(service.listStudents(undefined, 'p1')).toHaveLength(2);
      expect(service.listStudents('org2', 'p1')).toHaveLength(1);
    });

    it('activates and deactivates student', () => {
      const s = service.enrollStudent('org1', 'u1', 'p1');
      service.deactivateStudent(s.id);
      expect(service.getStudent(s.id).status).toBe('inactive');
      service.activateStudent(s.id);
      expect(service.getStudent(s.id).status).toBe('active');
    });

    it('throws on activate if not found', () => {
      expect(() => service.activateStudent('bad')).toThrow('Learning org student not found');
    });
  });
});
