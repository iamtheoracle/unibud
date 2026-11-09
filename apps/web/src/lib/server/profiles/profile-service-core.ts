import { randomUUID } from "node:crypto";
import {
  evaluateProfileSwitch,
  type ProfileAccessRecord,
  type ProfileSwitchResult
} from "../../../../../../packages/contracts/src/profile.ts";

export interface ProfileCreateInput {
  kind: "personal" | "creator" | "page_community";
  handle: string;
  displayName: string;
  visibility?: "private" | "limited" | "public";
}

export interface ProfileUpdateInput {
  profileId: string;
  displayName: string;
  handle: string;
  visibility: "private" | "limited" | "public";
}

export type ProfilePermission =
  | "profile.read" | "profile.update_identity"
  | "content.create" | "content.update" | "content.publish" | "content.delete" | "content.moderate"
  | "members.view" | "marketplace.manage_listing" | "service.manage_availability"
  | "education.manage_assigned_records" | "operations.view_assigned_work";

export interface ProfileInvitationInput {
  profileId: string;
  inviteeHandle: string;
  role: "admin" | "moderator" | "editor" | "member" | "seller" | "provider" | "viewer";
  canSwitchToProfile: boolean;
}

export interface ProfileInvitationRecord {
  id: string;
  profileId: string;
  profileName: string;
  profileHandle: string;
  ownerDisplayName: string;
  ownerHandle: string;
  role: ProfileInvitationInput["role"];
  canSwitchToProfile: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface ProfileRepository {
  updateOwnedProfile(ownerAccountId: string, input: ProfileUpdateInput): Promise<ProfileAccessRecord>;
  authorizeAction(accountId: string, profileId: string, permission: ProfilePermission): Promise<boolean>;
  createOwnedProfile(ownerAccountId: string, input: ProfileCreateInput): Promise<ProfileAccessRecord>;
  revokeDelegatedAccess(ownerAccountId: string, profileId: string, delegateAccountId: string): Promise<boolean>;
  listAccessibleProfiles(accountId: string): Promise<ProfileAccessRecord[]>;
  listDelegatedAccess(ownerAccountId: string, profileId: string): Promise<ProfileAccessRecord[]>;
  findProfileAccess(accountId: string, profileId: string): Promise<ProfileAccessRecord | undefined>;
  inviteDelegateByHandle(ownerAccountId: string, input: ProfileInvitationInput): Promise<{ id: string; inviteeHandle: string; inviteeDisplayName: string }>;
  listIncomingInvitations(inviteeAccountId: string): Promise<ProfileInvitationRecord[]>;
  respondToInvitation(inviteeAccountId: string, invitationId: string, accept: boolean): Promise<boolean>;
  setActiveProfileContext(accountId: string, sessionId: string, profileId: string, contextVersion: string): Promise<boolean>;
}

export class ProfileAccessDeniedError extends Error {
  constructor(message = "Profile access denied.") { super(message); this.name = "ProfileAccessDeniedError"; }
}

function normalizeHandle(handle: string): string {
  const normalized=handle.trim().toLowerCase();
  if(!/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/.test(normalized)) {
    throw new Error("Handle must be 3–30 characters and use letters, numbers, dots, underscores or hyphens.");
  }
  return normalized;
}

export class ProfileService {
  private readonly repository: ProfileRepository;

  constructor(repository: ProfileRepository) { this.repository=repository; }

  async updateOwnedProfile(accountId: string, input: ProfileUpdateInput): Promise<ProfileAccessRecord> {
    if (!accountId) throw new Error("Authenticated account is required.");
    const handle = normalizeHandle(input.handle);
    const displayName = input.displayName.trim();
    if (!displayName || displayName.length > 80) throw new Error("Display name must be 1–80 characters.");
    if (!["private", "limited", "public"].includes(input.visibility)) throw new Error("Invalid profile visibility.");
    const access = await this.repository.findProfileAccess(accountId, input.profileId);
    if (!access || access.relationship !== "owner" || access.membershipStatus !== "active" ||
        access.profile.ownerAccountId !== accountId || access.profile.status !== "active" ||
        !["creator", "page_community"].includes(access.profile.kind)) {
      throw new ProfileAccessDeniedError("Only the owner may edit an active creator or page profile.");
    }
    return this.repository.updateOwnedProfile(accountId, { ...input, handle, displayName });
  }

  async authorizeAction(accountId: string, profileId: string, permission: ProfilePermission): Promise<boolean> {
    if (!accountId || !profileId) return false;
    return this.repository.authorizeAction(accountId, profileId, permission);
  }

  /** Use at every server-side profile action boundary; UI visibility is never authorization. */
  async requireAction(accountId: string, profileId: string, permission: ProfilePermission): Promise<void> {
    if (!(await this.authorizeAction(accountId, profileId, permission))) {
      throw new ProfileAccessDeniedError("You do not have permission to perform this action on this profile.");
    }
  }

  async createOwnedProfile(accountId: string, input: ProfileCreateInput): Promise<ProfileAccessRecord> {
    if(!accountId) throw new Error("Authenticated account is required.");
    const handle=normalizeHandle(input.handle);
    const displayName=input.displayName.trim();
    if(!displayName || displayName.length>80) throw new Error("Display name must be 1–80 characters.");
    return this.repository.createOwnedProfile(accountId,{
      ...input,handle,displayName,visibility:input.visibility??"private"
    });
  }

  async revokeDelegatedAccess(
    authenticatedOwnerAccountId: string,
    profileId: string,
    delegateAccountId: string
  ): Promise<boolean> {
    const profile=await this.repository.findProfileAccess(authenticatedOwnerAccountId,profileId);
    if(!profile || profile.profile.ownerAccountId!==authenticatedOwnerAccountId ||
       profile.relationship!=="owner" || profile.membershipStatus!=="active") {
      throw new ProfileAccessDeniedError("Only the active profile owner may revoke delegation.");
    }
    return this.repository.revokeDelegatedAccess(authenticatedOwnerAccountId,profileId,delegateAccountId);
  }

  async listAccessibleProfiles(authenticatedAccountId: string): Promise<ProfileAccessRecord[]> {
    return this.repository.listAccessibleProfiles(authenticatedAccountId);
  }

  async listDelegatedAccess(authenticatedOwnerAccountId: string, profileId: string): Promise<ProfileAccessRecord[]> {
    const profile=await this.repository.findProfileAccess(authenticatedOwnerAccountId,profileId);
    if(!profile || profile.profile.ownerAccountId!==authenticatedOwnerAccountId ||
       profile.relationship!=="owner" || profile.membershipStatus!=="active") {
      throw new ProfileAccessDeniedError("Only the active profile owner may view delegated access.");
    }
    return this.repository.listDelegatedAccess(authenticatedOwnerAccountId,profileId);
  }

  async inviteDelegateByHandle(ownerAccountId: string, input: ProfileInvitationInput) {
    const publicRoles: readonly string[] = ["admin", "moderator", "editor", "member", "seller", "provider", "viewer"];
    if (!publicRoles.includes(input.role) || typeof input.canSwitchToProfile !== "boolean") {
      throw new Error("Choose a supported public page role and switching preference.");
    }
    const profile = await this.repository.findProfileAccess(ownerAccountId, input.profileId);
    if (!profile || profile.profile.ownerAccountId !== ownerAccountId ||
        profile.profile.kind !== "page_community" || profile.relationship !== "owner" ||
        profile.membershipStatus !== "active") {
      throw new ProfileAccessDeniedError("Only the active page owner may invite a delegate.");
    }
    const inviteeHandle = input.inviteeHandle.trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/.test(inviteeHandle)) {
      throw new Error("Enter a valid UNIBUD username or handle.");
    }
    return this.repository.inviteDelegateByHandle(ownerAccountId, { ...input, inviteeHandle });
  }

  async listIncomingInvitations(inviteeAccountId: string) {
    return this.repository.listIncomingInvitations(inviteeAccountId);
  }

  async respondToInvitation(inviteeAccountId: string, invitationId: string, accept: boolean) {
    if (!inviteeAccountId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invitationId)) throw new ProfileAccessDeniedError();
    return this.repository.respondToInvitation(inviteeAccountId, invitationId, accept);
  }

  async switchProfile(authenticatedAccountId: string, sessionId: string, targetProfileId: string): Promise<ProfileSwitchResult> {
    const access=await this.repository.findProfileAccess(authenticatedAccountId,targetProfileId);
    const decision=evaluateProfileSwitch(access,authenticatedAccountId as ProfileAccessRecord["accountId"],targetProfileId as ProfileAccessRecord["profile"]["id"]);
    if(!decision.allowed) throw new ProfileAccessDeniedError(decision.reason);
    const contextVersion=randomUUID();
    const persisted=await this.repository.setActiveProfileContext(authenticatedAccountId,sessionId,targetProfileId,contextVersion);
    if(!persisted) throw new ProfileAccessDeniedError("The authenticated session could not enter this profile context.");
    return {activeProfile:decision.context,contextVersion};
  }
}
