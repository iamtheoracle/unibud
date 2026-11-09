# Account dependency and retention inventory

## Purpose and safety boundary

This is a schema-grounded inventory for account-closure planning. It does not delete, export, transfer, anonymise, retain for a legally asserted period, or close any account. It is not legal advice or a retention schedule. Permanent closure remains unavailable.

## Evidence boundary

The inventory was built from the active account-closure branch's PostgreSQL migrations 0001–0017. A domain is marked **registered but unclassified** only when its persisted tables are present in those migrations. A product capability without a corresponding persisted domain schema is marked **not implemented**; it is never described as empty or clear.

The inventory version is `schema-inventory-1`. Its source migrations include the identity foundation, profile access, invitations, lifecycle safeguards and ownership transfer.

## Registered but unclassified dependencies

| Domain | Verified tables | Account relationship | Current disposition |
|---|---|---|---|
| Identity and sign-in | `accounts`, `authentication_identities`, `password_credentials`, `verification_challenges` | Canonical account and `account_id` | Retention/recovery policy unapproved |
| Sessions | `account_sessions` | `account_id`, active profile reference | Revocation/evidence policy unapproved |
| Profiles | `profiles`, `profile_memberships` | Owner and member account references | Shared content/ownership/deletion policy unapproved |
| Delegation and grants | `profile_memberships`, `resource_grants`, `profile_invitations` | Member, subject, owner and resource scope | Account-closure disposition unapproved |
| Profile lifecycle | `profile_lifecycle_notifications`, `profile_ownership_transfers`, `security_audit_events` | Participant, actor and resource references | Audit/lifecycle retention unapproved |

These tables establish that records exist in the schema; this inventory does not claim to have counted every row or fetched personal record contents. Account-specific counts remain supplied only by the authenticated readiness services already in place.

## Planned domains without persisted schemas in migrations 0001–0017

- Messaging and conversations, including attachments and contextual service chats.
- Media, uploads, derivatives, storage objects and processor copies.
- Payments, bookings, orders, contracts, provider records, refunds and disputes.
- Education records, institution authority, student and tutor data.
- Subscriptions, entitlements, support cases and operational records.

These domains are **unregistered blockers**, not zero-count domains. They must be added when their actual schemas and services are implemented.

## Required disposition fields before any policy can be approved

For every persisted record family and external dependency, the future policy review must establish:
1. Canonical owner and account relationship, including shared participants and delegated access.
2. Whether the record blocks closure, can be transferred, exported, anonymised or deleted, and who may authorise that action.
3. Legal and operational retention basis, jurisdiction, start event, duration and expiry trigger. No duration is inferred here.
4. Foreign-key, event, audit, object-storage and third-party processor dependencies.
5. User notice, export format, deletion evidence, backup expiry and recovery/cancellation handling.
6. Access controls after closure and auditable operator/support procedures.

## Fail-closed rule

The inventory policy is `not_approved` and `canClose=false`. Every registered domain remains unclassified until its disposition is approved. Every unimplemented domain blocks closure because its data and dependencies cannot yet be evaluated. A missing registry entry, missing policy, failed inventory query or unknown external dependency must never be interpreted as clearance.

## Next evidence required

- Add account-scoped row/dependency counts through authenticated, RLS-protected database procedures as each domain schema becomes available.
- Add domain-specific foreign-key and external-storage dependency discovery.
- Approve retention and legal notice policy with qualified review; do not encode guessed durations.
- Add export/deletion orchestration, dry-run reports, idempotency, audit evidence, backup expiry and recovery tests.
- Keep the database closure guard authoritative and permanent closure disabled until all gates pass.


## Live authenticated discovery engine (migration 0018)

- The authenticated `GET /api/account/closure-readiness` route now validates the session first, then calls `AccountDependencyRepository` using the validated account ID only.
- The repository creates a short-lived HMAC-signed account context and invokes `public.account_dependency_discovery(UUID)` inside one transaction. The function rejects a requested account that differs from the signed context.
- PostgreSQL returns aggregate counts only for registered account/profile records: account, identities, sessions, owned profiles by status, ownership/delegation memberships, grants, invitations, lifecycle notifications, ownership transfers and audit events as actor.
- It returns foreign-key topology from PostgreSQL catalog metadata for the registered table set. This describes schema relationships, not another account's row contents.
- Shared ownership is represented by delegated relationships, profile-owner/member links, grants, invitations and incoming/outgoing transfers. Counts are separated by direction to avoid treating a shared relationship as a single-owner record.
- The UI shows counts, relationship topology, policy gaps and the inventory generation time. The API response is non-cacheable through the existing `Cache-Control: no-store` header.
- Database integration test `0018_account_dependency_discovery.test.sql` verifies counts, FK discovery, missing-policy fail-closed behavior and cross-account denial. Web repository tests verify signed transaction setup, commit/rollback and release handling.

### Important limits

- Counts cover only the explicitly registered tables in migration 0018, including password credential and verification-challenge record counts (never credential hashes, challenge digests or challenge payloads). They do not establish completeness for future product spaces, object storage, event streams, payment processors, email/SMS providers, analytics, backups or manually held support records.
- Foreign-key metadata cannot reveal dependencies stored only in JSON, text, external services or untracked object stores.
- The current `missingPolicyDomains` list is deliberately fail-closed; no retention duration, legal basis, export/deletion action or external processor clearance is inferred.
- Permanent account closure remains disabled. The discovery RPC is read-only and exposes no record contents.
