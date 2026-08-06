/**
 * Education Module — Student Service
 */

import type { IStudent, IStudentService } from '../types/index.js';
import type { ILogger } from '../../oracle/kernel/types.js';
import { generateId } from '../utils.js';

export class StudentService implements IStudentService {
  private readonly store: Map<string, IStudent> = new Map();
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child('StudentService');
  }

  enrollStudent(
    orgId: string,
    userId: string,
    programId: string,
    metadata?: Record<string, unknown>,
  ): IStudent {
    const now = new Date();
    const student: IStudent = {
      id: generateId(),
      userId,
      organizationId: orgId,
      programId,
      status: 'active',
      metadata,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(student.id, student);
    this.logger.info('student.enrolled', { id: student.id, userId, orgId, programId });
    return student;
  }

  getStudent(id: string): IStudent {
    const student = this.store.get(id);
    if (!student) throw new Error(`Student not found: ${id}`);
    return student;
  }

  updateStudent(
    id: string,
    data: Partial<Omit<IStudent, 'id' | 'createdAt'>>,
  ): IStudent {
    const student = this.getStudent(id);
    const updated: IStudent = { ...student, ...data, id, createdAt: student.createdAt, updatedAt: new Date() };
    this.store.set(id, updated);
    this.logger.info('student.updated', { id });
    return updated;
  }

  listStudents(orgId?: string, programId?: string): IStudent[] {
    return [...this.store.values()].filter(
      (s) =>
        (orgId === undefined || s.organizationId === orgId) &&
        (programId === undefined || s.programId === programId),
    );
  }

  activateStudent(id: string): void {
    const student = this.getStudent(id);
    student.status = 'active';
    student.updatedAt = new Date();
    this.store.set(id, student);
    this.logger.info('student.activated', { id });
  }

  deactivateStudent(id: string): void {
    const student = this.getStudent(id);
    student.status = 'inactive';
    student.updatedAt = new Date();
    this.store.set(id, student);
    this.logger.info('student.deactivated', { id });
  }
}
