import type { IUniversity } from '../../types/university';
import { UniversityModel } from '../../models/university/university.model';
import { generateId } from '../../utils';

export class UniversityService {
  private store = new Map<string, UniversityModel>();

  createUniversity(name: string, code: string, description?: string, metadata?: Record<string, unknown>): IUniversity {
    const id = generateId('uni');
    const university = new UniversityModel({ id, name, code, description, faculties: [], metadata });
    this.store.set(id, university);
    return university.toJSON();
  }

  getUniversity(id: string): IUniversity {
    const university = this.store.get(id);
    if (!university) throw new Error(`University not found: ${id}`);
    return university.toJSON();
  }

  updateUniversity(id: string, data: Partial<Pick<IUniversity, 'name' | 'code' | 'description' | 'metadata'>>): IUniversity {
    const university = this.store.get(id);
    if (!university) throw new Error(`University not found: ${id}`);
    if (data.name !== undefined) university.name = data.name;
    if (data.code !== undefined) university.code = data.code;
    if (data.description !== undefined) university.description = data.description;
    if (data.metadata !== undefined) university.metadata = data.metadata;
    university.updatedAt = new Date();
    return university.toJSON();
  }

  listUniversities(): IUniversity[] {
    return Array.from(this.store.values()).map(u => u.toJSON());
  }

  deleteUniversity(id: string): void {
    if (!this.store.has(id)) throw new Error(`University not found: ${id}`);
    this.store.delete(id);
  }

  addFaculty(universityId: string, facultyId: string): void {
    const university = this.store.get(universityId);
    if (!university) throw new Error(`University not found: ${universityId}`);
    if (!university.faculties.includes(facultyId)) {
      university.faculties.push(facultyId);
      university.updatedAt = new Date();
    }
  }
}
