/**
 * Domain: Shared Infrastructure — Types
 */

// ─── Permission ───────────────────────────────────────────────────────────────

export type PermissionScope = 'global' | 'organization' | 'class';

export interface IPermission {
  id: string;
  name: string;
  description?: string;
  scope: PermissionScope;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IPermissionGrant {
  userId: string;
  permissionId: string;
  contextType?: string;
  contextId?: string;
  grantedAt: Date;
}

export interface DefinePermissionInput {
  name: string;
  description?: string;
  scope: PermissionScope;
  metadata?: Record<string, unknown>;
}

export interface GrantPermissionInput {
  userId: string;
  permissionName: string;
  contextType?: string;
  contextId?: string;
}

// ─── Invitation ───────────────────────────────────────────────────────────────

export type InvitationType = 'student' | 'educator';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'revoked';

export interface IInvitation {
  id: string;
  email: string;
  token: string;
  type: InvitationType;
  organizationId?: string;
  programId?: string;
  status: InvitationStatus;
  data?: Record<string, unknown>;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface SendInvitationInput {
  email: string;
  type: InvitationType;
  organizationId?: string;
  programId?: string;
  data?: Record<string, unknown>;
  expiresInDays?: number;
}
