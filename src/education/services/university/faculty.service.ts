import type { IFaculty } from '../../types/university';
import { FacultyModel } from '../../models/university/faculty.model';
import { generateId } from '../../utils';

export class FacultyService {
  private store = new Map<string, FacultyModel>();

  createFaculty(universityId: string, name: string, code: string, description?: string, metadata?: Record<string, unknown>): IFaculty {
    const id = generateId('fac');
    const faculty = new FacultyModel({ id, universityId, name, code, description, departments: [], metadata });
    this.store.set(id, faculty);
    return faculty.toJSON();
  }

  getFaculty(id: string): IFaculty {
    const faculty = this.store.get(id);
    if (!faculty) throw new Error(`Faculty not found: ${id}`);
    return faculty.toJSON();
  }

  updateFaculty(id: string, data: Partial<Pick<IFaculty, 'name' | 'code' | 'description' | 'metadata'>>): IFaculty {
    const faculty = this.store.get(id);
    if (!faculty) throw new Error(`Faculty not found: ${id}`);
    if (data.name !== undefined) faculty.name = data.name;
    if (data.code !== undefined) faculty.code = data.code;
    if (data.description !== undefined) faculty.description = data.description;
    if (data.metadata !== undefined) faculty.metadata = data.metadata;
    faculty.updatedAt = new Date();
    return faculty.toJSON();
  }

  listFaculties(universityId?: string): IFaculty[] {
    return Array.from(this.store.values())
      .filter(f => !universityId || f.universityId === universityId)
      .map(f => f.toJSON());
  }

  deleteFaculty(id: string): void {
    if (!this.store.has(id)) throw new Error(`Faculty not found: ${id}`);
    this.store.delete(id);
  }

  addDepartment(facultyId: string, departmentId: string): void {
    const faculty = this.store.get(facultyId);
    if (!faculty) throw new Error(`Faculty not found: ${facultyId}`);
    if (!faculty.departments.includes(departmentId)) {
      faculty.departments.push(departmentId);
      faculty.updatedAt = new Date();
    }
  }
}
