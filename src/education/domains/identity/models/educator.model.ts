/**
 * Domain: Identity — Educator Model
 *
 * Data access layer — wraps the EduEducator Base44 entity.
 */

import { base44 } from '@/api/base44Client';

export const EducatorModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduEducator.create(data);
  },
  async get(id: string) {
    return base44.entities.EduEducator.get(id);
  },
  async update(id: string, data: Record<string, unknown>) {
    return base44.entities.EduEducator.update(id, data);
  },
  async list(filters?: Record<string, unknown>) {
    return base44.entities.EduEducator.filter(filters ?? {});
  },
};

export const EducatorContextModel = {
  async create(data: Record<string, unknown>) {
    return base44.entities.EduEducatorContext.create(data);
  },
  async get(id: string) {
    return base44.entities.EduEducatorContext.get(id);
  },
  async delete(id: string) {
    return base44.entities.EduEducatorContext.delete(id);
  },
  async listByEducator(educatorId: string) {
    return base44.entities.EduEducatorContext.filter({ educator_id: educatorId });
  },
};
