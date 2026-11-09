# Shared Contracts

Only stable, versioned contracts shared across service boundaries belong here. Do not use this package as a way to share private domain logic or database models.

## Current contracts

- `src/identity.ts`: account, verified authentication identity, profile, resource grant, and deny-by-default grant evaluation.
- `src/profile.ts`: explicit profile context and profile-switch request/result contracts.

These contracts do not authenticate users, persist grants, create sessions, or replace server-side policy enforcement. The exact identity provider, verification provider, session store, and backend runtime remain undecided.
