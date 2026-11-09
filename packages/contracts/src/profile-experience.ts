import type { ProfileKind } from "./identity.ts";

/**
 * Product presentation contract for the three intentionally distinct profile
 * families. These descriptors shape navigation and copy only; they are never
 * an authorisation source. Every action must be re-authorised by the server.
 */
export type ProfileExperienceSection =
  | "identity"
  | "connections"
  | "posts"
  | "highlights"
  | "privacy"
  | "publishing"
  | "featured_work"
  | "audience"
  | "links"
  | "insights"
  | "eligible_monetisation"
  | "announcements"
  | "members"
  | "events"
  | "rules"
  | "administrators"
  | "moderation";

export interface ProfileExperienceDescriptor {
  kind: ProfileKind;
  title: string;
  identityLabel: string;
  purpose: string;
  primarySections: readonly ProfileExperienceSection[];
  managementSections: readonly ProfileExperienceSection[];
}

const experiences: Record<ProfileKind, ProfileExperienceDescriptor> = {
  personal: {
    kind: "personal",
    title: "Personal profile",
    identityLabel: "Your personal identity",
    purpose: "Represent yourself, manage your connections, and control what others can see.",
    primarySections: ["identity", "connections", "posts", "highlights"],
    managementSections: ["privacy"]
  },
  creator: {
    kind: "creator",
    title: "Creator profile",
    identityLabel: "Your creator identity",
    purpose: "Present your creative work, publish content, and understand your audience.",
    primarySections: ["identity", "publishing", "featured_work", "audience", "links"],
    managementSections: ["insights", "eligible_monetisation", "privacy"]
  },
  page_community: {
    kind: "page_community",
    title: "Page / community profile",
    identityLabel: "Your organisation or community identity",
    purpose: "Represent a group or organisation and coordinate its members, information, and activities.",
    primarySections: ["identity", "posts", "announcements", "members", "events", "rules"],
    managementSections: ["administrators", "moderation", "privacy"]
  }
};

/** Return immutable family-specific presentation metadata, never permissions. */
export function getProfileExperience(kind: ProfileKind): ProfileExperienceDescriptor {
  return experiences[kind];
}
