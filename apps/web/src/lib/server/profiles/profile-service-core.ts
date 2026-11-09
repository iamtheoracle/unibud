import { randomUUID } from "node:crypto";
import {
  evaluateProfileSwitch,
  type ProfileAccessRecord,
  type ProfileSwitchResult
} from "../../../../../../packages/contracts/src/profile.ts.ts";

export interface ProfileCreateInput {
  kind: "personal" | "creator" | "page_community";
  handle: string;
  displayName: string;
  visibility?: "private" | "limited" | "public";
}

export interface DelegatedProfileGrantInput {
  profileId: string;
  delegateAccountId: string;
  role: "admin" | "moderator" | "editor" | "member" | "seller" | "provider" | "professional" | "student" | "staff" | "operator" | "viewer";
  canSwitchToProfile: boolean;
}

export interface ProfileRepository {
  createOwnedProfile(ownerAccountId: string, input: ProfileCreateInput): Promise<ProfileAccessRecord>;
  grantDelegatedAccess(ownerAccountId: string, input: DelegatedProfileGrantInput): Promise<ProfileAccessRecord>;
  revokeDelegatedAccess(ownerAccountId: string, profileId: string, delegateAccountId: string): Promise<boolean>;
  listAccessibleProfiles(accountId: string): Promise<ProfileAccessRecord[]>;
  findProfileAccess(accountId: string, profileId: string): Promise<ProfileAccessRecord | undefined>;
}

export class ProfileAccessDeniedError extends Error {
  constructor(message = "Profile access denied.") { super(message); this.name = "ProfileAccessDeniedError"; }
}

function normalizeHandle(handle: string): string {
  const normalized=handle.trim().toLowerCase();
  if(!/^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/.test(normalized)) {
    throw new Error("Handle must be 3–30 characters and use letters, numbers, dots, underscores or hyphens.");
  }
  return normalized;
}

export class ProfileService {
  private readonly repository: ProfileRepository;

  constructor(repository: ProfileRepository) { this.repository=repository; }

  async createOwnedProfile(accountId: string, input: ProfileCreateInput): Promise<ProfileAccessRecord> {
    if(!accountId) throw new Error("Authenticated account is required.");
    const handle=normalizeHandle(input.handle);
    const displayName=input.displayName.trim();
    if(!displayName || displayName.length>80) throw new Error("Display name must be 1–80 characters.");
    return this.repository.createOwnedProfile(accountId,{
      ...input,handle,displayName,visibility:input.visibility??"private"
    });
  }

  async grantDelegatedAccess(
    authenticatedOwnerAccountId: string,
    input: DelegatedProfileGrantInput
  ): Promise<ProfileAccessRecord> {
    if(!authenticatedOwnerAccountId || !input.delegateAccountId ||
       authenticatedOwnerAccountId===input.delegateAccountId) {
      throw new ProfileAccessDeniedError("A distinct owner and delegate account are required.");
    }
    const profile=await this.repository.findProfileAccess(authenticatedOwnerAccountId,input.profileId);
    if(!profile || profile.profile.ownerAccountId!==authenticatedOwnerAccountId ||
       profile.relationship!=="owner" || profile.membershipStatus!=="active") {
      throw new ProfileAccessDeniedError("Only the active profile owner may delegate access.");
    }
    return this.repository.grantDelegatedAccess(authenticatedOwnerAccountId,input);
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

  async switchProfile(authenticatedAccountId: string, targetProfileId: string): Promise<ProfileSwitchResult> {
    const access=await this.repository.findProfileAccess(authenticatedAccountId,targetProfileId);
    const decision=evaluateProfileSwitch(access,authenticatedAccountId as ProfileAccessRecord["accountId"],targetProfileId as ProfileAccessRecord["profile"]["id"]);
    if(!decision.allowed) throw new ProfileAccessDeniedError(decision.reason);
    return {activeProfile:decision.context,contextVersion:randomUUID()};
  }
}
