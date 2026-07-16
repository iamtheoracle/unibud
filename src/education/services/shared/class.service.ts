import { EducatorModel } from '../../models/shared/educator.model';
import { ClassModel } from '../../models/shared/class.model';
import { ProgramModel } from '../../models/shared/program.model';
import { SubjectModel } from '../../models/shared/subject.model';
import type { IClass } from '../../types/shared';

export class ClassService {
  async createClass(
    programId: string,
    subjectId: string,
    educatorId: string,
    name: string,
    schedule?: Record<string, unknown>
  ): Promise<IClass> {
    const [program, subject, educator] = await Promise.all([
      ProgramModel.findById(programId),
      SubjectModel.findById(subjectId),
      EducatorModel.findById(educatorId),
    ]);

    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }
    if (!subject) {
      throw new Error(`Subject ${subjectId} not found`);
    }
    if (!educator) {
      throw new Error(`Educator ${educatorId} not found`);
    }

    return ClassModel.create({
      programId,
      subjectId,
      educatorId,
      name,
      schedule,
      students: [],
    });
  }

  async getClass(id: string): Promise<IClass> {
    const educationClass = await ClassModel.findById(id);
    if (!educationClass) {
      throw new Error(`Class ${id} not found`);
    }

    return educationClass;
  }

  async updateClass(id: string, data: Partial<Omit<IClass, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IClass> {
    return ClassModel.update(id, data);
  }

  async listClasses(programId?: string, educatorId?: string, organizationId?: string): Promise<IClass[]> {
    return ClassModel.findAll({ programId, educatorId, organizationId });
  }

  async deleteClass(id: string): Promise<void> {
    await ClassModel.delete(id);
  }

  async addStudent(classId: string, studentId: string): Promise<void> {
    const educationClass = await this.getClass(classId);
    if (!educationClass.students.includes(studentId)) {
      await ClassModel.update(classId, { students: [...educationClass.students, studentId] });
    }
  }

  async removeStudent(classId: string, studentId: string): Promise<void> {
    const educationClass = await this.getClass(classId);
    await ClassModel.update(classId, { students: educationClass.students.filter((id) => id !== studentId) });
  }
}

export const classService = new ClassService();
