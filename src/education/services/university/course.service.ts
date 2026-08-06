import type { ICourse } from '../../types/university';
import { CourseModel } from '../../models/university/course.model';
import { generateId } from '../../utils';

export class CourseService {
  private store = new Map<string, CourseModel>();

  createCourse(
    departmentId: string,
    code: string,
    name: string,
    description?: string,
    credits?: number,
    metadata?: Record<string, unknown>,
  ): ICourse {
    const id = generateId('crs');
    const course = new CourseModel({ id, departmentId, code, name, description, credits, metadata });
    this.store.set(id, course);
    return course.toJSON();
  }

  getCourse(id: string): ICourse {
    const course = this.store.get(id);
    if (!course) throw new Error(`Course not found: ${id}`);
    return course.toJSON();
  }

  updateCourse(id: string, data: Partial<Pick<ICourse, 'code' | 'name' | 'description' | 'credits' | 'metadata'>>): ICourse {
    const course = this.store.get(id);
    if (!course) throw new Error(`Course not found: ${id}`);
    if (data.code !== undefined) course.code = data.code;
    if (data.name !== undefined) course.name = data.name;
    if (data.description !== undefined) course.description = data.description;
    if (data.credits !== undefined) course.credits = data.credits;
    if (data.metadata !== undefined) course.metadata = data.metadata;
    course.updatedAt = new Date();
    return course.toJSON();
  }

  listCourses(departmentId?: string): ICourse[] {
    return Array.from(this.store.values())
      .filter(c => !departmentId || c.departmentId === departmentId)
      .map(c => c.toJSON());
  }

  deleteCourse(id: string): void {
    if (!this.store.has(id)) throw new Error(`Course not found: ${id}`);
    this.store.delete(id);
  }
}
