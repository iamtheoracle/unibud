/**
 * Stable identity and authorisation contracts shared between UNIBUD services.
 * These are transport/domain contracts, not persistence models or proof of auth.
 */

export type AccountId = string & { readonly __brand: "AccountId" };
export type ProfileId = string & { readonly __brand: "ProfileId" };
export type ResourceId = string & { readonly __brand: "ResourceId" };
export type GrantId = string & { readonly __brand: "GrantId" };
export type ApplicationId = string & { readonly __brand: "ApplicationId" };

export type AccountStatus =
  | "pending_verification"
  | "active"
  | "restricted"
  | "suspended"
  | "closed";

export interface AccountSummary {
  id: AccountId;
  status: AccountStatus;
  createdAt: string;
}

export type AuthenticationMethod = "email" | "phone" | "passkey" | "password";

export interface VerifiedAuthenticationIdentity {
  id: string;
  accountId: AccountId;
  method: AuthenticationMethod;
  verifiedAt: string;
  /** Masked display hint only; never a raw credential or verification secret. */
  displayHint: string;
  isPrimary: boolean;
}

export type ProfileKind = "personal" | "creator" | "page_community";

export interface ProfileSummary {
  id: ProfileId;
  ownerAccountId: AccountId;
  kind: ProfileKind;
  handle: string;
  displayName: string;
  visibility: "private" | "limited" | "public";
  status: "active" | "restricted" | "archived";
}

export type GrantRole =
  | "owner"
  | "admin"
  | "moderator"
  | "editor"
  | "member"
  | "seller"
  | "provider"
  | "professional"
  | "student"
  | "staff"
  | "operator"
  | "viewer";

export type GrantAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "manage_members"
  | "manage_billing"
  | "manage_integrations"
  | "dispatch"
  | "approve"
  | "export";

export interface ResourceGrant {
  id: GrantId;
  subjectAccountId: AccountId;
  applicationId: ApplicationId;
  resourceType: string;
  resourceId: ResourceId;
  role: GrantRole;
  actions: readonly GrantAction[];
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  /** Who or what issued this grant; retained for audit. */
  issuer: string;
}

export interface AuthorisationRequest {
  subjectAccountId: AccountId;
  applicationId: ApplicationId;
  resourceType: string;
  resourceId: ResourceId;
  action: GrantAction;
  now: string;
}

export type AuthorisationDecision =
  | { allowed: true; grantId: GrantId; role: GrantRole }
  | {
      allowed: false;
      reason:
        | "no_matching_grant"
        | "grant_revoked"
        | "grant_not_yet_valid"
        | "grant_expired"
        | "action_not_granted";
    };

/**
 * Evaluate one explicit grant. Callers must evaluate all applicable policy
 * constraints too (account status, resource state, staff approval, etc.).
 * No grant means deny; role names alone never imply permissions.
 */
export function evaluateResourceGrant(
  grant: ResourceGrant | undefined,
  request: AuthorisationRequest
): AuthorisationDecision {
  if (!grant) return { allowed: false, reason: "no_matching_grant" };

  if (
    grant.subjectAccountId !== request.subjectAccountId ||
    grant.applicationId !== request.applicationId ||
    grant.resourceType !== request.resourceType ||
    grant.resourceId !== request.resourceId
  ) {
    return { allowed: false, reason: "no_matching_grant" };
  }

  const now = Date.parse(request.now);
  const issuedAt = Date.parse(grant.issuedAt);
  if (!Number.isFinite(now) || !Number.isFinite(issuedAt)) {
    return { allowed: false, reason: "no_matching_grant" };
  }

  if (grant.revokedAt) {
    return { allowed: false, reason: "grant_revoked" };
  }
  if (now < issuedAt) {
    return { allowed: false, reason: "grant_not_yet_valid" };
  }
  if (grant.expiresAt) {
    const expiresAt = Date.parse(grant.expiresAt);
    if (!Number.isFinite(expiresAt) || now >= expiresAt) {
      return { allowed: false, reason: "grant_expired" };
    }
  }
  if (!grant.actions.includes(request.action)) {
    return { allowed: false, reason: "action_not_granted" };
  }

  return { allowed: true, grantId: grant.id, role: grant.role };
}
