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
 * The server must load and validate every referenced record and enforce
 * conversation membership, space/resource authorization, blocking,
 * contact permissions, age eligibility, consent and moderation independently.
 * These transport contracts are not a substitute for PostgreSQL RLS or
 * server-side authorization.
 */
