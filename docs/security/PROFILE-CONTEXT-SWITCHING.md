# Profile Context and Switching

## Purpose

A UNIBUD account is the authenticated person or organisation controller. A profile is the identity context in which the person is acting. Switching profiles changes context only; it never changes the signed-in account and never grants new permissions by itself.

## Supported public profile families

- Personal profile: the individual's own profile.
- Creator profile: a separate publishing identity owned by an account.
- Page/community profile: an organisation, institution, business, brand, or community presence with separately delegated administration.

An account can own a personal profile, multiple creator profiles, and manage multiple page/community profiles. Each profile has its own identifier, owner, visibility, lifecycle, and grants.

## Switching rules

1. The client requests a target profile ID; it does not submit a role or permission list.
2. The server loads the profile and membership/grant from trusted storage.
3. The server verifies the signed-in account, profile state, active relationship, and explicit switch permission.
4. The server issues a new short-lived profile context/session version.
5. Every subsequent action is independently authorised against its resource and grants.
6. Switching, returning to personal, or changing device does not copy or inherit permissions.

## Ownership and delegation

- Personal and creator profiles have an explicit owner account.
- Page/community ownership is separate from administrator/moderator/editor membership.
- A delegated page administrator must be represented by a separate active resource grant. They do not become the owner and cannot access the owner's personal profile, private messages, credentials, or unrelated profiles.
- Removing or suspending a grant must invalidate access at the next server authorisation check and revoke relevant profile contexts.
- The browser's active-profile ID is a request hint only, never proof of ownership.

## Privacy

Profile visibility and search discoverability are separate controls. A private profile must not become searchable because another profile is public. Private education identities (student, tutor, institution) are outside these public profile families and are governed by the separate education identity boundary.

## Implementation status

Shared contracts include a pure profile-switch decision helper. This is not yet a live session endpoint or database-backed access service. Production implementation requires first-party authentication, trusted persistence, session rotation/revocation, audit events, rate limits, and security tests for cross-account and cross-profile access.
