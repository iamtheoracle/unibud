import { EducatorModel } from '../../models/shared/educator.model';
import type { IEducator, IEducatorContext } from '../../types/shared';

export class EducatorService {
  async registerEducator(
    email: string,
    firstName: string,
    lastName: string,
    bio?: string,
    qualifications?: string[]
  ): Promise<IEducator> {
    const existing = await EducatorModel.findByEmail(email);
    if (existing) {
      throw new Error(`Educator with email ${email} already exists`);
    }

    return EducatorModel.create({
      userId: '',
      email,
      firstName,
      lastName,
      bio,
      qualifications,
      status: 'active',
    });
  }

  async getEducator(id: string): Promise<IEducator> {
    const educator = await EducatorModel.findById(id);
    if (!educator) {
      throw new Error(`Educator ${id} not found`);
    }

    return educator;
  }

  async updateEducator(id: string, data: Partial<Omit<IEducator, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IEducator> {
    return EducatorModel.update(id, data);
  }

  async listEducators(): Promise<IEducator[]> {
    return EducatorModel.findAll();
  }

  async assignToContext(
    educatorId: string,
    contextType: IEducatorContext['contextType'],
    contextId: string
  ): Promise<void> {
    await this.getEducator(educatorId);
    const existing = await EducatorModel.findContexts(educatorId);
    const alreadyAssigned = existing.some((context) => context.contextType === contextType && context.contextId === contextId);
    if (!alreadyAssigned) {
      await EducatorModel.createContext({
        educatorId,
        contextType,
        contextId,
        assignedAt: new Date(),
      });
    }
  }

  async removeFromContext(
    educatorId: string,
    contextType: IEducatorContext['contextType'],
    contextId: string
  ): Promise<void> {
    const existing = await EducatorModel.findContexts(educatorId);
    const context = existing.find((item) => item.contextType === contextType && item.contextId === contextId);
    if (context) {
      await EducatorModel.deleteContext(context.id);
    }
  }

  async getEducatorContexts(educatorId: string): Promise<IEducatorContext[]> {
    return EducatorModel.findContexts(educatorId);
  }
}

export const educatorService = new EducatorService();
