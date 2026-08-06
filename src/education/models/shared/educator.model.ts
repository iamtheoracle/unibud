import type { IEducator } from '../../types/shared';

export class EducatorModel implements IEducator {
  id: string;
  email: string;
  name: string;
  bio?: string;
  organizationIds: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IEducator, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.bio = data.bio;
    this.organizationIds = data.organizationIds ?? [];
    this.metadata = data.metadata;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IEducator {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      bio: this.bio,
      organizationIds: this.organizationIds,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
