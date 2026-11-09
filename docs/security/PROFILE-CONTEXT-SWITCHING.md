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
4. A narrowly scoped SECURITY DEFINER procedure writes the active profile ID and a fresh context version to the verified account session.
5. The session lookup returns this server-persisted context; every subsequent action is still independently authorised against its resource and grants.
6. Switching, returning to personal, or changing device does not copy or inherit permissions.

## Ownership and delegation

- Personal and creator profiles have an explicit owner account.
- Page/community ownership is separate from administrator/moderator/editor membership.
- A delegated page administrator is represented by an active membership scoped to the exact profile, with the canonical profile owner and grantor bound in the database. They do not become the owner and cannot access the owner's personal profile, private messages, credentials, or unrelated profiles.
- Page access is invited by an exact UNIBUD personal-profile handle; the browser never submits or displays the invitee account ID.
- Invitations remain pending for seven days. The recipient sees them in their authenticated invitation inbox and must accept before a delegated membership becomes active.
- Exact-handle invitations can reach a private profile, but the inviter receives only a generic member label rather than the private display name. Broad identity discovery is separate from this exact-handle action.
- Declining an invitation creates no membership. An invitation cannot be accepted by an account other than its intended recipient.
- Removing or suspending a grant must invalidate access at the next server authorisation check and revoke relevant profile contexts.
- The browser's active-profile ID is a request hint only, never proof of ownership.

## Privacy

Profile visibility and search discoverability are separate controls. A private profile must not become searchable because another profile is public. Private education identities (student, tutor, institution) are outside these public profile families and are governed by the separate education identity boundary.

## Implementation status

Shared contracts, a PostgreSQL profile repository, owner-only profile creation and revocation, handle-based invitation procedures, recipient acceptance, owner/delegate RLS visibility, authenticated profile list/create/switch/invitation routes, and per-session active-profile persistence are implemented. PostgreSQL 16 tests cover owner, delegate, unrelated account, self-grant denial, revocation, session switching, exact-handle invitations, private-profile masking, and recipient acceptance. Service workflow tests cover profile creation followed by switching and reject cross-account/revoked access. The app role cannot directly insert/update profiles, memberships, or sessions to self-grant access. Production credentials, live deployment and operational verification remain pending.
