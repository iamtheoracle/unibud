import { StudentModel } from '../../models/shared/student.model';
import type { IStudent, IStudentContext } from '../../types/shared';

export class StudentService {
  async registerStudent(
    email: string,
    firstName: string,
    lastName: string,
    metadata?: Record<string, unknown>
  ): Promise<IStudent> {
    const existing = await StudentModel.findByEmail(email);
    if (existing) {
      throw new Error(`Student with email ${email} already exists`);
    }

    return StudentModel.create({
      userId: '',
      email,
      firstName,
      lastName,
      status: 'active',
      metadata,
    });
  }

  async getStudent(id: string): Promise<IStudent> {
    const student = await StudentModel.findById(id);
    if (!student) {
      throw new Error(`Student ${id} not found`);
    }

    return student;
  }

  async updateStudent(id: string, data: Partial<Omit<IStudent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IStudent> {
    return StudentModel.update(id, data);
  }

  async listStudents(): Promise<IStudent[]> {
    return StudentModel.findAll();
  }

  async activateStudent(id: string): Promise<void> {
    await StudentModel.update(id, { status: 'active' });
  }

  async deactivateStudent(id: string): Promise<void> {
    await StudentModel.update(id, { status: 'inactive' });
  }

  async getStudentContexts(studentId: string): Promise<IStudentContext[]> {
    return StudentModel.findContexts(studentId);
  }
}

export const studentService = new StudentService();
