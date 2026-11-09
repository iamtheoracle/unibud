import type { AccountId, ProfileId, ProfileKind } from "./identity";

/** Profile context is explicit; it is never inferred from the signed-in account. */
export interface ProfileContext {
  accountId: AccountId;
  activeProfileId: ProfileId;
  activeProfileKind: ProfileKind;
}

export interface ProfileSwitchOption {
  profile: {
    id: ProfileId;
    kind: ProfileKind;
    handle: string;
    displayName: string;
  };
  /** Capabilities granted for this profile; UI hints only, server rechecks. */
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
