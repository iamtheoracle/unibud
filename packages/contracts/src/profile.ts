import type {
  AccountId,
  ProfileId,
  ProfileKind,
  ProfileSummary
} from "./identity";

export interface ProfileContext {
  accountId: AccountId;
  activeProfileId: ProfileId;
  activeProfileKind: ProfileKind;
}

export interface ProfileSwitchOption {
  profile: Pick<ProfileSummary, "id" | "kind" | "handle" | "displayName">;
  /** UI hints only. The server must re-evaluate every action. */
  availableActions: readonly string[];
}

export interface ProfileSwitchRequest {
  targetProfileId: ProfileId;
}

export interface ProfileSwitchResult {
  activeProfile: ProfileContext;
  /** Short-lived server-issued context/session version; never a permission grant. */
  contextVersion: string;
}

export interface ProfileAccessRecord {
  profile: ProfileSummary;
  accountId: AccountId;
  relationship: "owner" | "delegated";
  membershipStatus: "active" | "pending" | "suspended" | "revoked";
  canSwitchToProfile: boolean;
}

export type ProfileSwitchDecision =
  | { allowed: true; context: ProfileContext }
  | {
      allowed: false;
      reason:
        | "profile_not_found"
        | "wrong_account"
        | "membership_inactive"
        | "profile_inactive"
        | "switch_not_granted";
    };

/**
 * Decide whether a signed-in account may enter a profile context.
 * The access record must be loaded by the server from trusted storage.
 * This does not authorise actions inside the selected profile.
 */
export function evaluateProfileSwitch(
  access: ProfileAccessRecord | undefined,
  accountId: AccountId,
  targetProfileId: ProfileId
): ProfileSwitchDecision {
  if (!access) return { allowed: false, reason: "profile_not_found" };
  if (access.accountId !== accountId || access.profile.ownerAccountId !== accountId) {
    // Delegated administrators are represented by a separate grant in the
    // future service and must not be treated as the profile owner here.
    if (access.accountId !== accountId || access.relationship !== "delegated") {
      return { allowed: false, reason: "wrong_account" };
    }
  }
  if (access.profile.id !== targetProfileId) {
    return { allowed: false, reason: "profile_not_found" };
  }
  if (access.membershipStatus !== "active") {
    return { allowed: false, reason: "membership_inactive" };
  }
  if (access.profile.status !== "active") {
    return { allowed: false, reason: "profile_inactive" };
  }
  if (!access.canSwitchToProfile) {
    return { allowed: false, reason: "switch_not_granted" };
  }

  return {
    allowed: true,
    context: {
      accountId,
      activeProfileId: access.profile.id,
      activeProfileKind: access.profile.kind
    }
  };
}
