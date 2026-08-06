import { describe, it, expect, beforeEach } from 'vitest';
import { EnrollmentService } from '../services/enrollment.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  beforeEach(() => {
    service = new EnrollmentService(logger);
  });

  it('enrolls a student in a class', () => {
    const e = service.enrollInClass('stu-1', 'cls-1');
    expect(e.id).toBeTruthy();
    expect(e.studentId).toBe('stu-1');
    expect(e.classId).toBe('cls-1');
    expect(e.status).toBe('pending');
  });

  it('gets an enrollment by id', () => {
    const created = service.enrollInClass('stu-1', 'cls-1');
    expect(service.getEnrollment(created.id)).toEqual(created);
  });

  it('throws when getting unknown enrollment', () => {
    expect(() => service.getEnrollment('unknown')).toThrow('Enrollment not found');
  });

  it('prevents duplicate active enrollments', () => {
    service.enrollInClass('stu-1', 'cls-1');
    expect(() => service.enrollInClass('stu-1', 'cls-1')).toThrow('already enrolled');
  });

  it('allows re-enrollment after withdrawal', () => {
    service.enrollInClass('stu-1', 'cls-1');
    service.withdrawFromClass('stu-1', 'cls-1');
    expect(() => service.enrollInClass('stu-1', 'cls-1')).not.toThrow();
  });

  it('lists enrollments with filters', () => {
    service.enrollInClass('stu-1', 'cls-1');
    service.enrollInClass('stu-1', 'cls-2');
    service.enrollInClass('stu-2', 'cls-1');

    expect(service.listEnrollments('stu-1')).toHaveLength(2);
    expect(service.listEnrollments(undefined, 'cls-1')).toHaveLength(2);
    expect(service.listEnrollments('stu-2', 'cls-1')).toHaveLength(1);
  });

  it('approves an enrollment', () => {
    const e = service.enrollInClass('stu-1', 'cls-1');
    service.approveEnrollment(e.id);
    expect(service.getEnrollment(e.id).status).toBe('approved');
    expect(service.getEnrollment(e.id).approvedAt).toBeTruthy();
  });

  it('rejects an enrollment', () => {
    const e = service.enrollInClass('stu-1', 'cls-2');
    service.rejectEnrollment(e.id);
    expect(service.getEnrollment(e.id).status).toBe('rejected');
  });

  it('throws when approving non-pending enrollment', () => {
    const e = service.enrollInClass('stu-1', 'cls-1');
    service.approveEnrollment(e.id);
    expect(() => service.approveEnrollment(e.id)).toThrow('not pending');
  });

  it('withdraws from a class', () => {
    service.enrollInClass('stu-1', 'cls-1');
    service.withdrawFromClass('stu-1', 'cls-1');
    const enrollments = service.listEnrollments('stu-1');
    expect(enrollments[0].status).toBe('withdrawn');
    expect(enrollments[0].withdrawnAt).toBeTruthy();
  });

  it('throws when withdrawing non-existent enrollment', () => {
    expect(() => service.withdrawFromClass('stu-99', 'cls-99')).toThrow('No active enrollment');
  });
});
