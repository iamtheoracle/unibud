import { describe, it, expect, beforeEach } from 'vitest';
import { EnrollmentService } from '../../services/shared/enrollment.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  beforeEach(() => {
    service = new EnrollmentService();
  });

  it('enrolls a student in a class', () => {
    const enr = service.enrollInClass('stu1', 'cls1');
    expect(enr.id).toBeTruthy();
    expect(enr.studentId).toBe('stu1');
    expect(enr.classId).toBe('cls1');
    expect(enr.status).toBe('pending');
  });

  it('throws on duplicate active enrollment', () => {
    service.enrollInClass('stu1', 'cls1');
    expect(() => service.enrollInClass('stu1', 'cls1')).toThrow('already enrolled');
  });

  it('allows re-enroll after withdrawal', () => {
    service.enrollInClass('stu1', 'cls1');
    service.withdrawFromClass('stu1', 'cls1');
    const enr2 = service.enrollInClass('stu1', 'cls1');
    expect(enr2.status).toBe('pending');
  });

  it('retrieves an enrollment', () => {
    const enr = service.enrollInClass('stu2', 'cls2');
    const found = service.getEnrollment(enr.id);
    expect(found.id).toBe(enr.id);
  });

  it('throws on get if not found', () => {
    expect(() => service.getEnrollment('bad')).toThrow('Enrollment not found');
  });

  it('approves an enrollment', () => {
    const enr = service.enrollInClass('stu3', 'cls3');
    service.approveEnrollment(enr.id);
    const found = service.getEnrollment(enr.id);
    expect(found.status).toBe('approved');
  });

  it('throws on approving withdrawn enrollment', () => {
    const enr = service.enrollInClass('stu4', 'cls4');
    service.withdrawFromClass('stu4', 'cls4');
    expect(() => service.approveEnrollment(enr.id)).toThrow('Cannot approve');
  });

  it('withdraws from class', () => {
    service.enrollInClass('stu5', 'cls5');
    service.withdrawFromClass('stu5', 'cls5');
    const list = service.listEnrollments('stu5');
    expect(list[0].status).toBe('withdrawn');
  });

  it('throws withdrawal if no active enrollment', () => {
    expect(() => service.withdrawFromClass('stu6', 'cls6')).toThrow('No active enrollment');
  });

  it('lists enrollments by student', () => {
    service.enrollInClass('stuA', 'c1');
    service.enrollInClass('stuA', 'c2');
    service.enrollInClass('stuB', 'c1');
    expect(service.listEnrollments('stuA')).toHaveLength(2);
    expect(service.listEnrollments(undefined, 'c1')).toHaveLength(2);
  });
});
