import type { IUniversityStudent } from '../../types/university';
import { UniversityStudentModel } from '../../models/university/university-student.model';
import { generateId } from '../../utils';

export class UniversityStudentService {
  private store = new Map<string, UniversityStudentModel>();

  enrollStudent(
    universityId: string,
    userId: string,
    departmentId: string,
    courseId: string,
    matriculationNumber?: string,
    level?: IUniversityStudent['level'],
    metadata?: Record<string, unknown>,
  ): IUniversityStudent {
    const id = generateId('ustud');
    const student = new UniversityStudentModel({
      id,
      userId,
      universityId,
      departmentId,
      courseId,
      matriculationNumber,
      level,
      status: 'active',
      metadata,
    });
    this.store.set(id, student);
    return student.toJSON();
  }

  getStudent(id: string): IUniversityStudent {
    const student = this.store.get(id);
    if (!student) throw new Error(`University student not found: ${id}`);
    return student.toJSON();
  }

  updateStudent(id: string, data: Partial<Pick<IUniversityStudent, 'matriculationNumber' | 'level' | 'metadata'>>): IUniversityStudent {
    const student = this.store.get(id);
    if (!student) throw new Error(`University student not found: ${id}`);
    if (data.matriculationNumber !== undefined) student.matriculationNumber = data.matriculationNumber;
    if (data.level !== undefined) student.level = data.level;
    if (data.metadata !== undefined) student.metadata = data.metadata;
    student.updatedAt = new Date();
    return student.toJSON();
  }

  listStudents(universityId?: string, departmentId?: string, courseId?: string): IUniversityStudent[] {
    return Array.from(this.store.values())
      .filter(s =>
        (!universityId || s.universityId === universityId) &&
        (!departmentId || s.departmentId === departmentId) &&
        (!courseId || s.courseId === courseId)
      )
      .map(s => s.toJSON());
  }

  activateStudent(id: string): void {
    const student = this.store.get(id);
    if (!student) throw new Error(`University student not found: ${id}`);
    student.status = 'active';
    student.updatedAt = new Date();
  }

  deactivateStudent(id: string): void {
    const student = this.store.get(id);
    if (!student) throw new Error(`University student not found: ${id}`);
    student.status = 'inactive';
    student.updatedAt = new Date();
  }
}
