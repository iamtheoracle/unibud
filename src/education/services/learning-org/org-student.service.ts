import type { ILearningOrgStudent } from '../../types/learning-org';
import { LearningOrgStudentModel } from '../../models/learning-org/org-student.model';
import { generateId } from '../../utils';

export class LearningOrgStudentService {
  private store = new Map<string, LearningOrgStudentModel>();

  enrollStudent(
    organizationId: string,
    userId: string,
    programId: string,
    enrollmentNumber?: string,
    metadata?: Record<string, unknown>,
  ): ILearningOrgStudent {
    const id = generateId('lstud');
    const student = new LearningOrgStudentModel({ id, userId, organizationId, programId, enrollmentNumber, status: 'active', metadata });
    this.store.set(id, student);
    return student.toJSON();
  }

  getStudent(id: string): ILearningOrgStudent {
    const student = this.store.get(id);
    if (!student) throw new Error(`Learning org student not found: ${id}`);
    return student.toJSON();
  }

  updateStudent(id: string, data: Partial<Pick<ILearningOrgStudent, 'enrollmentNumber' | 'metadata'>>): ILearningOrgStudent {
    const student = this.store.get(id);
    if (!student) throw new Error(`Learning org student not found: ${id}`);
    if (data.enrollmentNumber !== undefined) student.enrollmentNumber = data.enrollmentNumber;
    if (data.metadata !== undefined) student.metadata = data.metadata;
    student.updatedAt = new Date();
    return student.toJSON();
  }

  listStudents(organizationId?: string, programId?: string): ILearningOrgStudent[] {
    return Array.from(this.store.values())
      .filter(s => (!organizationId || s.organizationId === organizationId) && (!programId || s.programId === programId))
      .map(s => s.toJSON());
  }

  activateStudent(id: string): void {
    const student = this.store.get(id);
    if (!student) throw new Error(`Learning org student not found: ${id}`);
    student.status = 'active';
    student.updatedAt = new Date();
  }

  deactivateStudent(id: string): void {
    const student = this.store.get(id);
    if (!student) throw new Error(`Learning org student not found: ${id}`);
    student.status = 'inactive';
    student.updatedAt = new Date();
  }
}
