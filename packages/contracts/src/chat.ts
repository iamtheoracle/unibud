import type { AccountId, ApplicationId, ProfileId, ResourceId } from "./identity.ts";
import type { SessionId } from "./session.ts";

/**
 * Shared messaging boundary identifiers only. This contract does not define
 * universal chat features or authorize access to any conversation.
 * Riff and SouLync retain independent product policy and lifecycle controls.
 */
export interface ConversationScope {
  applicationId: ApplicationId;
  spaceKey: string;
  resourceType: string;
  resourceId: ResourceId;
}

export interface TrustedMessageActor {
  /** Loaded from a verified persisted session, never accepted from request JSON. */
  accountId: AccountId;
  /** Active profile resolved server-side for this request. */
  profileId: ProfileId;
  sessionId: SessionId;
}

export interface ConversationParticipantReference {
  /** Opaque internal reference for persistence only; never display as identity. */
  accountId: AccountId;
  /** Optional profile context is separately authorized for the conversation. */
  profileId?: ProfileId;
}

export interface ConversationBoundary {
  id: ResourceId;
  scope: ConversationScope;
  createdAt: string;
}

export interface MessageBoundary {
  id: ResourceId;
  conversationId: ResourceId;
  scope: ConversationScope;
  authorAccountId: AccountId;
  authorProfileId: ProfileId;
  createdAt: string;
}

/**
 * Facts are constructed by a trusted server adapter after loading persisted
 * account, session, profile, conversation and space-policy records. Never
 * accept this object from a client or treat this pure evaluator as auth proof.
 */
export interface ChatAuthorizationFacts {
  verifiedSession: boolean;
  activeAccount: boolean;
  activeProfileAuthorized: boolean;
  conversationParticipant: boolean;
  /** Includes the exact space's contact, membership and resource rules. */
  spacePolicyAllowed: boolean;
  /** False if either participant blocks the other. */
  blockPolicyAllowed: boolean;
  moderationAllowed: boolean;
  /** SouLync-specific: verified adult eligibility, not self-declared age. */
  adultEligibilityVerified?: boolean;
  /** SouLync-specific: affirmative, current consent for this interaction. */
  independentConsentGranted?: boolean;
  /** Riff-specific: the Riff lifecycle adapter permits this action. */
  riffLifecycleAllowed?: boolean;
}

export type ChatAuthorizationReason =
  | "session_unverified"
  | "account_inactive"
  | "profile_not_authorized"
  | "not_a_conversation_participant"
  | "space_policy_denied"
  | "blocked"
  | "moderation_denied"
  | "adult_eligibility_unverified"
  | "independent_consent_missing"
  | "riff_lifecycle_denied";

export type ChatAuthorizationDecision =
  | { allowed: true }
  | { allowed: false; reason: ChatAuthorizationReason };

/**
 * Fail-closed common gate for read/send operations. Space-specific adapters
 * must still derive facts from trusted storage and enforce additional rules.
 */
export function evaluateChatAccess(
  spaceKey: string,
  facts: ChatAuthorizationFacts
): ChatAuthorizationDecision {
  if (!facts.verifiedSession) return { allowed: false, reason: "session_unverified" };
  if (!facts.activeAccount) return { allowed: false, reason: "account_inactive" };
  if (!facts.activeProfileAuthorized) return { allowed: false, reason: "profile_not_authorized" };
  if (!facts.conversationParticipant) return { allowed: false, reason: "not_a_conversation_participant" };
  if (!facts.spacePolicyAllowed) return { allowed: false, reason: "space_policy_denied" };
  if (!facts.blockPolicyAllowed) return { allowed: false, reason: "blocked" };
  if (!facts.moderationAllowed) return { allowed: false, reason: "moderation_denied" };

  if (spaceKey === "soullync") {
    if (facts.adultEligibilityVerified !== true) {
      return { allowed: false, reason: "adult_eligibility_unverified" };
    }
    if (facts.independentConsentGranted !== true) {
      return { allowed: false, reason: "independent_consent_missing" };
    }
  }

  if (spaceKey === "riff" && facts.riffLifecycleAllowed !== true) {
    return { allowed: false, reason: "riff_lifecycle_denied" };
  }

  return { allowed: true };
}

/**
 * The server must load and validate every referenced record and enforce
 * conversation membership, space/resource authorization, blocking,
 * contact permissions, age eligibility, consent and moderation independently.
 * These transport contracts are not a substitute for PostgreSQL RLS or
 * server-side authorization.
 */
