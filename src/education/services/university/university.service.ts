import { UniversityModel } from '../../models/university/university.model';
import type { IUniversity } from '../../types/university';

export class UniversityService {
  async createUniversity(name: string, code: string, description?: string): Promise<IUniversity> {
    const existing = await UniversityModel.findByCode(code);
    if (existing) {
      throw new Error(`University with code ${code} already exists`);
    }

    return UniversityModel.create({
      name,
      code,
      description,
      faculties: [],
    });
  }

  async getUniversity(id: string): Promise<IUniversity> {
    const university = await UniversityModel.findById(id);
    if (!university) {
      throw new Error(`University ${id} not found`);
    }

    return university;
  }

  async updateUniversity(id: string, data: Partial<Omit<IUniversity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IUniversity> {
    return UniversityModel.update(id, data);
  }

  async listUniversities(): Promise<IUniversity[]> {
    return UniversityModel.findAll();
  }

  async deleteUniversity(id: string): Promise<void> {
    await UniversityModel.delete(id);
  }
}

export const universityService = new UniversityService();
