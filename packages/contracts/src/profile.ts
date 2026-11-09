import type {
  AccountId,
  ProfileId,
  ProfileKind,
  ProfileSummary,
  GrantRole
} from "./identity.ts";

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
  /** The account for which this trusted access record was loaded. */
  profile: ProfileSummary;
  accountId: AccountId;
  relationship: "owner" | "delegated";
  role: GrantRole;
  membershipStatus: "active" | "pending" | "suspended" | "revoked";
  /** Must be derived from an active, server-verified ownership or delegation record. */
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
 * For delegated access, the record must represent a separately verified,
 * active grant for this exact account and profile. A client-supplied role,
 * profile ID, or boolean is never sufficient evidence.
 * This does not authorise actions inside the selected profile.
 */
export function evaluateProfileSwitch(
  access: ProfileAccessRecord | undefined,
  accountId: AccountId,
  targetProfileId: ProfileId
): ProfileSwitchDecision {
  if (!access) return { allowed: false, reason: "profile_not_found" };
  if (access.accountId !== accountId) {
    return { allowed: false, reason: "wrong_account" };
  }
  if (access.profile.id !== targetProfileId) {
    return { allowed: false, reason: "profile_not_found" };
  }

  const isOwner = access.profile.ownerAccountId === accountId;
  if (access.relationship === "owner" && !isOwner) {
    return { allowed: false, reason: "wrong_account" };
  }
  if (access.relationship === "delegated" && isOwner) {
    // An owner must use the owner relationship, not a delegated shortcut.
    return { allowed: false, reason: "wrong_account" };
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
