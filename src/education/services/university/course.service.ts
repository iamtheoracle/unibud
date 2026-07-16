import { CourseModel } from '../../models/university/course.model';
import { DepartmentModel } from '../../models/university/department.model';
import type { ICourse } from '../../types/university';

export class CourseService {
  async createCourse(departmentId: string, code: string, name: string, description?: string): Promise<ICourse> {
    const department = await DepartmentModel.findById(departmentId);
    if (!department) {
      throw new Error(`Department ${departmentId} not found`);
    }

    const existing = await CourseModel.findByCode(departmentId, code);
    if (existing) {
      throw new Error(`Course with code ${code} already exists in department ${departmentId}`);
    }

    return CourseModel.create({ departmentId, code, name, description });
  }

  async getCourse(id: string): Promise<ICourse> {
    const course = await CourseModel.findById(id);
    if (!course) {
      throw new Error(`Course ${id} not found`);
    }

    return course;
  }

  async updateCourse(id: string, data: Partial<Omit<ICourse, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ICourse> {
    return CourseModel.update(id, data);
  }

  async listCourses(departmentId?: string): Promise<ICourse[]> {
    return CourseModel.findAll(departmentId);
  }

  async deleteCourse(id: string): Promise<void> {
    await CourseModel.delete(id);
  }
}

export const courseService = new CourseService();
