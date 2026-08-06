/**
 * Domain: Academic — ClassService
 */

import { ClassModel } from '../models/academic.models';
import type {
  IClass,
  CreateClassInput,
  UpdateClassInput,
  ListClassesFilter,
} from '../types/class.types';

export const ClassService = {
  async createClass(input: CreateClassInput): Promise<IClass> {
    const record = await ClassModel.create({
      program_id: input.programId,
      subject_id: input.subjectId,
      educator_id: input.educatorId,
      organization_id: input.organizationId,
      name: input.name,
      code: input.code,
      schedule: input.schedule,
      capacity: input.capacity,
      students: [],
      metadata: input.metadata ?? {},
    });
    return mapClass(record);
  },

  async getClass(id: string): Promise<IClass> {
    const record = await ClassModel.get(id);
    return mapClass(record);
  },

  async updateClass(id: string, data: UpdateClassInput): Promise<IClass> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.schedule !== undefined) updates.schedule = data.schedule;
    if (data.capacity !== undefined) updates.capacity = data.capacity;
    if (data.metadata !== undefined) updates.metadata = data.metadata;
    const record = await ClassModel.update(id, updates);
    return mapClass(record);
  },

  async listClasses(filter?: ListClassesFilter): Promise<IClass[]> {
    const filters: Record<string, unknown> = {};
    if (filter?.programId) filters.program_id = filter.programId;
    if (filter?.educatorId) filters.educator_id = filter.educatorId;
    if (filter?.organizationId) filters.organization_id = filter.organizationId;
    const records = await ClassModel.list(filters);
    return records.map(mapClass);
  },

  async deleteClass(id: string): Promise<void> {
    await ClassModel.delete(id);
  },

  async addStudent(classId: string, studentId: string): Promise<void> {
    const cls = await ClassModel.get(classId);
    const students: string[] = Array.isArray(cls.students) ? cls.students : [];
    if (!students.includes(studentId)) {
      await ClassModel.update(classId, { students: [...students, studentId] });
    }
  },

  async removeStudent(classId: string, studentId: string): Promise<void> {
    const cls = await ClassModel.get(classId);
    const students: string[] = Array.isArray(cls.students) ? cls.students : [];
    await ClassModel.update(classId, {
      students: students.filter((s) => s !== studentId),
    });
  },
};

function mapClass(r: Record<string, unknown>): IClass {
  return {
    id: r.id as string,
    programId: r.program_id as string,
    subjectId: r.subject_id as string,
    educatorId: r.educator_id as string,
    organizationId: r.organization_id as string | undefined,
    name: r.name as string,
    code: r.code as string | undefined,
    schedule: r.schedule,
    capacity: r.capacity as number | undefined,
    students: (r.students as string[]) ?? [],
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}
