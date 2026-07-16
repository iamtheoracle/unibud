import { ClassModel } from '../../models/shared/class.model';
import { EnrollmentModel } from '../../models/shared/enrollment.model';
import { StudentModel } from '../../models/shared/student.model';
import type { IEnrollment } from '../../types/shared';

export class EnrollmentService {
  async enrollInClass(studentId: string, classId: string): Promise<IEnrollment> {
    const [student, educationClass, existing] = await Promise.all([
      StudentModel.findById(studentId),
      ClassModel.findById(classId),
      EnrollmentModel.findByStudentAndClass(studentId, classId),
    ]);

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }
    if (!educationClass) {
      throw new Error(`Class ${classId} not found`);
    }
    if (existing && existing.status !== 'withdrawn') {
      throw new Error(`Student ${studentId} is already enrolled in class ${classId}`);
    }

    return EnrollmentModel.create({
      studentId,
      classId,
      status: 'pending',
      enrolledAt: new Date(),
    });
  }

  async getEnrollment(id: string): Promise<IEnrollment> {
    const enrollment = await EnrollmentModel.findById(id);
    if (!enrollment) {
      throw new Error(`Enrollment ${id} not found`);
    }

    return enrollment;
  }

  async listEnrollments(studentId?: string, classId?: string): Promise<IEnrollment[]> {
    return EnrollmentModel.findAll({ studentId, classId });
  }

  async withdrawFromClass(studentId: string, classId: string): Promise<void> {
    const enrollment = await EnrollmentModel.findByStudentAndClass(studentId, classId);
    if (!enrollment) {
      throw new Error(`Enrollment for student ${studentId} in class ${classId} not found`);
    }

    await EnrollmentModel.update(enrollment.id, { status: 'withdrawn' });
  }

  async approveEnrollment(enrollmentId: string): Promise<void> {
    await this.getEnrollment(enrollmentId);
    await EnrollmentModel.update(enrollmentId, { status: 'approved' });
  }
}

export const enrollmentService = new EnrollmentService();
