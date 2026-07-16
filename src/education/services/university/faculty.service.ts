import { FacultyModel } from '../../models/university/faculty.model';
import { UniversityModel } from '../../models/university/university.model';
import type { IFaculty } from '../../types/university';

export class FacultyService {
  async createFaculty(universityId: string, name: string, code: string, description?: string): Promise<IFaculty> {
    const university = await UniversityModel.findById(universityId);
    if (!university) {
      throw new Error(`University ${universityId} not found`);
    }

    const existing = await FacultyModel.findByCode(universityId, code);
    if (existing) {
      throw new Error(`Faculty with code ${code} already exists in university ${universityId}`);
    }

    const faculty = await FacultyModel.create({ universityId, name, code, description });
    if (!university.faculties.includes(faculty.id)) {
      await UniversityModel.update(universityId, { faculties: [...university.faculties, faculty.id] });
    }
    return faculty;
  }

  async getFaculty(id: string): Promise<IFaculty> {
    const faculty = await FacultyModel.findById(id);
    if (!faculty) {
      throw new Error(`Faculty ${id} not found`);
    }

    return faculty;
  }

  async updateFaculty(id: string, data: Partial<Omit<IFaculty, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IFaculty> {
    return FacultyModel.update(id, data);
  }

  async listFaculties(universityId?: string): Promise<IFaculty[]> {
    return FacultyModel.findAll(universityId);
  }

  async deleteFaculty(id: string): Promise<void> {
    const faculty = await this.getFaculty(id);
    await FacultyModel.delete(id);
    const university = await UniversityModel.findById(faculty.universityId);
    if (university) {
      await UniversityModel.update(university.id, { faculties: university.faculties.filter((facultyId) => facultyId !== id) });
    }
  }
}

export const facultyService = new FacultyService();
