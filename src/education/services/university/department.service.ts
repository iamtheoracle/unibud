import type { IDepartment } from '../../types/university';
import { DepartmentModel } from '../../models/university/department.model';
import { generateId } from '../../utils';

export class DepartmentService {
  private store = new Map<string, DepartmentModel>();

  createDepartment(facultyId: string, name: string, code: string, description?: string, metadata?: Record<string, unknown>): IDepartment {
    const id = generateId('dept');
    const department = new DepartmentModel({ id, facultyId, name, code, description, courses: [], metadata });
    this.store.set(id, department);
    return department.toJSON();
  }

  getDepartment(id: string): IDepartment {
    const department = this.store.get(id);
    if (!department) throw new Error(`Department not found: ${id}`);
    return department.toJSON();
  }

  updateDepartment(id: string, data: Partial<Pick<IDepartment, 'name' | 'code' | 'description' | 'metadata'>>): IDepartment {
    const department = this.store.get(id);
    if (!department) throw new Error(`Department not found: ${id}`);
    if (data.name !== undefined) department.name = data.name;
    if (data.code !== undefined) department.code = data.code;
    if (data.description !== undefined) department.description = data.description;
    if (data.metadata !== undefined) department.metadata = data.metadata;
    department.updatedAt = new Date();
    return department.toJSON();
  }

  listDepartments(facultyId?: string): IDepartment[] {
    return Array.from(this.store.values())
      .filter(d => !facultyId || d.facultyId === facultyId)
      .map(d => d.toJSON());
  }

  deleteDepartment(id: string): void {
    if (!this.store.has(id)) throw new Error(`Department not found: ${id}`);
    this.store.delete(id);
  }

  addCourse(departmentId: string, courseId: string): void {
    const department = this.store.get(departmentId);
    if (!department) throw new Error(`Department not found: ${departmentId}`);
    if (!department.courses.includes(courseId)) {
      department.courses.push(courseId);
      department.updatedAt = new Date();
    }
  }
}
