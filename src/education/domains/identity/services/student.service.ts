/**
 * Domain: Identity — StudentService
 *
 * Manages student identity and context assignment.
 */

import { StudentModel, StudentContextModel } from '../models/student.model';
import type {
  IStudent,
  IStudentContext,
  RegisterStudentInput,
  UpdateStudentInput,
  AddStudentContextInput,
} from '../types/student.types';

export const StudentService = {
  // ─── Identity Management ──────────────────────────────────────────────────

  async registerStudent(input: RegisterStudentInput): Promise<IStudent> {
    const record = await StudentModel.create({
      user_id: input.userId ?? '',
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      status: 'active',
      metadata: input.metadata ?? {},
    });
    return mapStudent(record);
  },

  async getStudent(id: string): Promise<IStudent> {
    const record = await StudentModel.get(id);
    return mapStudent(record);
  },

  async updateStudent(id: string, data: UpdateStudentInput): Promise<IStudent> {
    const updates: Record<string, unknown> = {};
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName !== undefined) updates.last_name = data.lastName;
    if (data.email !== undefined) updates.email = data.email;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await StudentModel.update(id, updates);
    return mapStudent(record);
  },

  async listStudents(): Promise<IStudent[]> {
    const records = await StudentModel.list();
    return records.map(mapStudent);
  },

  // ─── Status Management ────────────────────────────────────────────────────

  async activateStudent(id: string): Promise<void> {
    await StudentModel.update(id, { status: 'active' });
  },

  async deactivateStudent(id: string): Promise<void> {
    await StudentModel.update(id, { status: 'inactive' });
  },

  // ─── Context Management ───────────────────────────────────────────────────

  async getStudentContexts(studentId: string): Promise<IStudentContext[]> {
    const records = await StudentContextModel.listByStudent(studentId);
    return records.map(mapStudentContext);
  },

  async addStudentContext(
    studentId: string,
    input: AddStudentContextInput,
  ): Promise<IStudentContext> {
    const record = await StudentContextModel.create({
      student_id: studentId,
      context_type: input.contextType,
      context_id: input.contextId,
      enrollment_number: input.enrollmentNumber,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    });
    return mapStudentContext(record);
  },

  async removeStudentContext(contextId: string): Promise<void> {
    await StudentContextModel.delete(contextId);
  },
};

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapStudent(r: Record<string, unknown>): IStudent {
  return {
    id: r.id as string,
    userId: (r.user_id as string) ?? '',
    firstName: r.first_name as string,
    lastName: r.last_name as string,
    email: r.email as string,
    status: (r.status as IStudent['status']) ?? 'active',
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}

function mapStudentContext(r: Record<string, unknown>): IStudentContext {
  return {
    id: r.id as string,
    studentId: r.student_id as string,
    contextType: r.context_type as IStudentContext['contextType'],
    contextId: r.context_id as string,
    enrollmentNumber: r.enrollment_number as string | undefined,
    status: (r.status as IStudentContext['status']) ?? 'active',
    enrolledAt: new Date(r.enrolled_at as string),
  };
}
