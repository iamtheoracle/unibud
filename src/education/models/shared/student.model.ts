import { base44 } from '@/api/base44Client';
import type { IStudent, IStudentContext } from '../../types/shared';

function mapToStudent(raw: Record<string, unknown>): IStudent {
  return {
    id: String(raw.id || ''),
    userId: String(raw.user_id || ''),
    firstName: String(raw.first_name || ''),
    lastName: String(raw.last_name || ''),
    email: String(raw.email || ''),
    status: (raw.status as IStudent['status']) || 'active',
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    createdAt: new Date(String(raw.created_date || Date.now())),
    updatedAt: new Date(String(raw.updated_date || Date.now())),
  };
}

function mapToStudentContext(raw: Record<string, unknown>): IStudentContext {
  return {
    id: String(raw.id || ''),
    studentId: String(raw.student_id || ''),
    contextType: (raw.context_type as IStudentContext['contextType']) || 'university',
    contextId: String(raw.context_id || ''),
    enrollmentNumber: raw.enrollment_number ? String(raw.enrollment_number) : undefined,
    status: (raw.status as IStudentContext['status']) || 'active',
    enrolledAt: new Date(String(raw.enrolled_at || Date.now())),
  };
}

export const StudentModel = {
  async findById(id: string): Promise<IStudent | null> {
    try {
      const results = await base44.entities.Student.filter({ id });
      return results?.length ? mapToStudent(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findByEmail(email: string): Promise<IStudent | null> {
    try {
      const results = await base44.entities.Student.filter({ email });
      return results?.length ? mapToStudent(results[0] as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  },

  async findAll(): Promise<IStudent[]> {
    try {
      const results = await base44.entities.Student.list();
      return (results || []).map((raw: Record<string, unknown>) => mapToStudent(raw));
    } catch {
      return [];
    }
  },

  async create(data: Omit<IStudent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IStudent> {
    const raw = await base44.entities.Student.create({
      user_id: data.userId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      status: data.status,
      metadata: data.metadata,
    });
    return mapToStudent(raw as Record<string, unknown>);
  },

  async update(id: string, data: Partial<Omit<IStudent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IStudent> {
    const updates: Record<string, unknown> = {};
    if (data.userId !== undefined) updates.user_id = data.userId;
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName !== undefined) updates.last_name = data.lastName;
    if (data.email !== undefined) updates.email = data.email;
    if (data.status !== undefined) updates.status = data.status;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    const raw = await base44.entities.Student.update(id, updates);
    return mapToStudent(raw as Record<string, unknown>);
  },

  async findContexts(studentId: string): Promise<IStudentContext[]> {
    try {
      const results = await base44.entities.StudentContext.filter({ student_id: studentId });
      return (results || []).map((raw: Record<string, unknown>) => mapToStudentContext(raw));
    } catch {
      return [];
    }
  },

  async createContext(data: Omit<IStudentContext, 'id'>): Promise<IStudentContext> {
    const raw = await base44.entities.StudentContext.create({
      student_id: data.studentId,
      context_type: data.contextType,
      context_id: data.contextId,
      enrollment_number: data.enrollmentNumber,
      status: data.status,
      enrolled_at: data.enrolledAt.toISOString(),
    });
    return mapToStudentContext(raw as Record<string, unknown>);
  },
};
