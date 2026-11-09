# Identity and Profile Service Contracts

## Scope

This package defines stable TypeScript contracts shared by UNIBUD services. It does not implement authentication, persistence, session issuance, or database access.

## Identity concepts

- Account: platform-level identity and status.
- Authentication identity: verified login/recovery method bound to an account. The contract exposes a masked display hint, never a password, OTP, passkey secret, or raw contact value.
- Profile: a distinct personal, creator, or page/community identity.
- Resource grant: an explicit, application-scoped, resource-scoped authorisation record with actions, issuer, issue time, expiry, and revocation.
- Profile context: explicit currently selected profile. Switching profile context does not elevate permissions.

## Deny-by-default grant evaluation

`evaluateResourceGrant` checks the exact subject, application, resource type, resource ID, requested action, revocation, issue time, and expiry. Missing or mismatched grants deny.

This helper is a small policy primitive, not a complete authorisation system. Every real request must additionally validate account status, current session, resource state, application registration, role policy, staff approval where applicable, and data-boundary constraints. The server must load grants from a trusted store; never trust grants supplied by the browser.

Role labels do not imply permissions. A page admin cannot access the owner's personal account. A staff role does not automatically grant access to consumer data. Agent and service identities require their own narrowly scoped grants.

## Registration and sign-in

No social sign-in provider is required. The product requirement is first-party email/phone registration and sign-in. The exact verification provider, credential approach, session store, and backend runtime remain undecided and require an architecture decision before production implementation.

## Profile families

- Personal: individual identity and personal content.
- Creator: publishing identity and creator capabilities.
- Page/community: organisation, institution, brand, business, or community identity and delegated management.

A single account may own multiple profile families. The active profile is an explicit context and never a second login. Specialised school, seller, provider, professional, and staff roles remain grants/capabilities attached to the relevant resource or workforce identity rather than silently changing the primary profile type.

## Required security tests before production

- Account A cannot use Account B's grant.
- A grant for one app cannot authorise another app.
- A grant for one resource cannot authorise a different resource.
- Revoked, expired, future-dated, and action-mismatched grants deny.
- Page admin cannot access the page owner's private account or unrelated profiles.
- Profile switching cannot elevate permissions.
- Staff and service identities cannot inherit consumer permissions.
- Browser-supplied role or grant data is ignored by the server.
