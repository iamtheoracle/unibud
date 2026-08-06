import type { ILearningOrganization, LearningOrgType } from '../../types/learning-org';

export class LearningOrganizationModel implements ILearningOrganization {
  id: string;
  name: string;
  type: LearningOrgType;
  description?: string;
  educators: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<ILearningOrganization, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.description = data.description;
    this.educators = data.educators ?? [];
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): ILearningOrganization {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      educators: this.educators,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
