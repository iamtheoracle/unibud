import type { IPermission } from '../../types/shared';

export class PermissionModel implements IPermission {
  id: string;
  name: string;
  description?: string;
  scope: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<IPermission, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.scope = data.scope;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  toJSON(): IPermission {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      scope: this.scope,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
