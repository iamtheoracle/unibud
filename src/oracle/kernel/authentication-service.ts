/**
 * Oracle Kernel — Authentication Service
 */

import type { IAuthenticationService, IAuthSession, IOracleUser, IHealthStatus } from './types.js';
import type { IdentityService } from './identity-service.js';

function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
}

export class AuthenticationService implements IAuthenticationService {
  private readonly _sessions = new Map<string, IAuthSession>();
  private readonly _passwords = new Map<string, string>(); // userId → password (plain for dev only)

  constructor(private readonly _identityService: IdentityService) {}

  /** Register a password for a user (used in tests / dev). */
  setPassword(userId: string, password: string): void {
    this._passwords.set(userId, password);
  }

  async login(email: string, password: string): Promise<IAuthSession> {
    const users = await this._identityService.listUsers();
    const user = users.find((u) => u.email === email);
    if (!user || !user.isActive) {
      throw new Error('AuthenticationService: invalid credentials');
    }
    const stored = this._passwords.get(user.id);
    if (stored && stored !== password) {
      throw new Error('AuthenticationService: invalid credentials');
    }
    const session: IAuthSession = {
      token: generateToken(),
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 h
    };
    this._sessions.set(session.token, session);
    return session;
  }

  async logout(token: string): Promise<void> {
    this._sessions.delete(token);
  }

  async validateToken(token: string): Promise<IOracleUser | undefined> {
    const session = this._sessions.get(token);
    if (!session || session.expiresAt < new Date()) {
      this._sessions.delete(token);
      return undefined;
    }
    return this._identityService.getUser(session.userId);
  }

  getHealth(): IHealthStatus {
    return { status: 'healthy', timestamp: new Date() };
  }
}
