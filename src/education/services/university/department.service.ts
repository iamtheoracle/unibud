import { DepartmentModel } from '../../models/university/department.model';
import { FacultyModel } from '../../models/university/faculty.model';
import type { IDepartment } from '../../types/university';

export class DepartmentService {
  async createDepartment(facultyId: string, name: string, code: string, description?: string): Promise<IDepartment> {
    const faculty = await FacultyModel.findById(facultyId);
    if (!faculty) {
      throw new Error(`Faculty ${facultyId} not found`);
    }

    const existing = await DepartmentModel.findByCode(facultyId, code);
    if (existing) {
      throw new Error(`Department with code ${code} already exists in faculty ${facultyId}`);
    }

    return DepartmentModel.create({ facultyId, name, code, description });
  }

  async getDepartment(id: string): Promise<IDepartment> {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw new Error(`Department ${id} not found`);
    }

    return department;
  }

  async updateDepartment(id: string, data: Partial<Omit<IDepartment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IDepartment> {
    return DepartmentModel.update(id, data);
  }

  async listDepartments(facultyId?: string): Promise<IDepartment[]> {
    return DepartmentModel.findAll(facultyId);
  }

  async deleteDepartment(id: string): Promise<void> {
    await DepartmentModel.delete(id);
  }
}

export const departmentService = new DepartmentService();
