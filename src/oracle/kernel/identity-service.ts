/**
 * Oracle Kernel — Identity Service
 */

import type { IIdentityService, IOracleUser, IHealthStatus } from './types.js';

function generateId(): string {
  return `usr_${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class IdentityService implements IIdentityService {
  private readonly _users = new Map<string, IOracleUser>();

  async createUser(
    email: string,
    firstName: string,
    lastName: string,
    role = 'user',
  ): Promise<IOracleUser> {
    const existing = Array.from(this._users.values()).find((u) => u.email === email);
    if (existing) throw new Error(`IdentityService: user with email "${email}" already exists`);

    const user: IOracleUser = {
      id: generateId(),
      email,
      firstName,
      lastName,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this._users.set(user.id, user);
    return user;
  }

  async getUser(id: string): Promise<IOracleUser | undefined> {
    return this._users.get(id);
  }

  async updateUser(id: string, data: Partial<IOracleUser>): Promise<IOracleUser> {
    const user = this._users.get(id);
    if (!user) throw new Error(`IdentityService: user "${id}" not found`);
    const updated: IOracleUser = { ...user, ...data, id, updatedAt: new Date() };
    this._users.set(id, updated);
    return updated;
  }

  async listUsers(): Promise<IOracleUser[]> {
    return Array.from(this._users.values());
  }

  async activateUser(id: string): Promise<void> {
    await this.updateUser(id, { isActive: true });
  }

  async deactivateUser(id: string): Promise<void> {
    await this.updateUser(id, { isActive: false });
  }

  getHealth(): IHealthStatus {
    return { status: 'healthy', timestamp: new Date() };
  }
}
