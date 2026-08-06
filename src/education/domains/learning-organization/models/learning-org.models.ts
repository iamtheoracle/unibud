/**
 * Domain: Learning Organization — Models
 */

import { base44 } from '@/api/base44Client';

export const LearningOrganizationModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduLearningOrganization.create(data);
  },
  async get(id: string) {
    return base44.entities.EduLearningOrganization.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduLearningOrganization.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduLearningOrganization.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduLearningOrganization.delete(id);
  },
};

export const LearningProgramModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduLearningProgram.create(data);
  },
  async get(id: string) {
    return base44.entities.EduLearningProgram.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduLearningProgram.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduLearningProgram.filter(filters ?? {});
  },
  async delete(id: string) {
    return base44.entities.EduLearningProgram.delete(id);
  },
};
