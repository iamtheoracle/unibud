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


## External dependency registry foundation (migration 0019)

- Migration 0019 adds a global catalogue of integration surfaces evidenced in tracked configuration/documentation and an account-scoped registry for opaque external references.
- The initial catalogue contains only the verification-delivery gateway and the separately bounded Oracle Arc service because those interfaces are declared in the repository. Their verification state is deliberately `unknown`; no provider identity, live configuration, API access, or deletion capability is inferred.
- Account references store only a 32-byte keyed HMAC-SHA256 digest plus a key-version label. Raw provider identifiers, access tokens, credentials, message bodies, file contents and processor payloads are prohibited.
- The account reference table has forced row-level security tied to the signed transaction account context. The app role receives no direct table write permission. The read-only discovery function returns aggregate counts, domain counts and a non-secret integration catalogue.
- The authenticated `GET /api/account/closure-readiness` route now includes `externalDependencyDiscovery` and derives its account scope from the validated session. The repository uses the same short-lived signed account transaction pattern as migration 0018.
- SQL tests cover aggregate counts, opaque-digest non-disclosure, unknown disposition, unverified provider state, fail-closed policy and cross-account denial. Web repository tests cover signed context, commit/rollback and client release. The Foundation workflow is updated to apply migrations 0018 and 0019 and execute both SQL tests. The earlier Foundation workflow stopped at 0017, so its prior green run did not verify migration 0018.
- **Not implemented yet:** provider-specific lookup adapters, object-storage inventory, event-bus/webhook scans, payment or identity processor API calls, export/deletion execution, provider receipts, backup expiry checks, and a UI presentation for this new registry response. No live provider is queried by this migration.
- Registry capability flags default to false. A provider may be marked verified only with explicit evidence and a verification timestamp. Permanent closure remains disabled; no retention durations or legal conclusions are encoded.


## External dependency readiness experience and provider contracts

- The account closure readiness page now displays registered integrations with distinct **verified**, **unknown**, **unavailable** and **unclassified** states. Missing policy domains are shown separately as policy gaps; they are not conflated with integration state.
- The page shows aggregate external-reference counts for unverified, unknown-disposition, stale, unavailable and shared relationships. No opaque reference digest or raw provider identifier is displayed.
- Migration 0019's discovery result includes a shared-reference count for `participant` and `shared_participant` relationships. SQL coverage now includes stale and unavailable references and a shared participant.
- `external-dependency-provider.ts` defines read-only lookup and verification contracts. It accepts only account-scoped opaque digests, rejects provider results containing unrequested digests, rejects stale/invalid verification evidence, and converts missing adapters or provider failures into explicit unavailable/unknown outcomes.
- The adapter contract intentionally has **no export or delete method**. The readiness projection hard-codes export, deletion and account closure to false, regardless of provider lookup success.
- Automated tests cover missing adapters, stale lookup evidence, stale verification evidence, failed provider lookups, unexpected provider references, shared relationships, state classification and the permanent export/deletion/closure prohibition.
- **Not implemented:** no concrete provider adapter is registered, no provider is contacted by this change, and the current integration registry remains unknown until separately verified. This is contract and visibility groundwork, not live provider discovery.

## Concrete runtime integration inventory

- The authenticated account-readiness API now returns a separate `concreteIntegrationInventory` projection. It inspects only whether known server-side setting names are present; it never returns their values, database hosts, URLs, tokens, model identifiers or credentials.
- The current executable integration boundaries evidenced by code are two distinct PostgreSQL pools (authentication RPC and tenant-scoped application data), the private email/SMS verification-delivery HTTP gateway, and the server-to-server Oracle Arc status connection.
- Each entry is classified as `configured_unverified`, `partially_configured` or `not_configured`. These are configuration-presence states only; none proves reachability, provider identity, successful inference, or provider-side data discovery.
- The verification gateway's underlying email/SMS vendors remain unresolved. Oracle Arc has a separate authenticated status diagnostic, but this inventory does not call it. PostgreSQL pool health is not probed.
- The repository integration register also names candidate services such as object storage, payments, maps/geocoding and hosted inference. No executable adapters for object storage, payment processing, maps/geocoding, analytics, push delivery or backup services were found in the audited integration paths. They remain implementation gaps—not zero dependencies.
- Tests verify all-or-none/partial configuration handling, whitespace handling, separation of the two database roles, and that no environment values are returned.
- This stage performs no provider network calls, does not mutate the integration registry, does not create external references, and does not add export/deletion methods. Unknown external dependencies continue to block closure.

## Authenticated provider evidence — current stage

- Oracle Arc exposes an authenticated status contract at `GET /v1/integration/status`. UNIBUD's internal operator-only diagnostic now hardens the call against redirects, invalid content types, malformed/oversized JSON, incorrect service identity and untrusted upstream error bodies. It reports inference as ready only when Oracle Arc itself reports both a configured model and ready inference.
- The Oracle Arc diagnostic has not been run against a deployed service in this CI task. Mocked tests prove client behaviour; they are not evidence of live connectivity.
- The verification-delivery gateway exposes only a POST delivery contract in this repository. No read-only health endpoint or vendor identity is defined. A separate operator-only metadata diagnostic therefore reports configuration completeness while keeping provider identity and connectivity unknown; it sends no test email/SMS, recipient, challenge or verification code.
- A real verification-gateway connectivity check requires a documented, authenticated, side-effect-free health contract and confirmed downstream vendor identity. Do not probe the delivery POST route as a health check.
- Account-level external references remain undiscovered until a provider-specific, account-scoped adapter can safely resolve approved opaque reference digests. Unknown remains a blocker.


## Integration diagnostic security evidence

- Oracle Arc authenticated status checks are server-side and require configured deployment credentials; mocked CI responses do not prove deployed reachability.
- Verification gateway metadata diagnostics never make a delivery request. Provider identity remains unknown and connectivity remains `not_tested` until a documented read-only provider health contract exists.
- The temporary operator bearer gate's 32-byte minimum is not a substitute for authenticated staff/operator identities, scoped roles, revocation, audit history or step-up authentication.
- Verification gateway URL configuration must not contain embedded credentials, query strings or fragments. Production uses HTTPS; development HTTP is allowed only for loopback hosts.
- None of this evidence changes account closure, export, deletion or retention policy. Those remain unavailable and fail closed.
