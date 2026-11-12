# Operations MFA disable/reset — dual-control implementation contract

**Status: implementation contract only. No disable/reset endpoint, database procedure, UI, or production capability is established by this document.** This contract defines the security boundary that the next code slice must implement.

## Purpose

Provide a controlled way to disable or reset an Operations authenticator when an operator changes device or loses access, without creating a single-operator bypass around MFA.

## Non-negotiable invariants

1. A request and its approval must be performed by two distinct, currently active operator accounts.
2. The requester cannot approve, reject, cancel, or otherwise complete their own request.
3. Both actors must have an active, unexpired Operations grant for the exact action and must complete fresh password reauthentication and fresh TOTP step-up in their own validated persisted sessions.
4. The database derives both actor identities and sessions from the existing cryptographically verified account+session context. Never accept actor, session, role, permission, MFA state, or approval identity from request JSON, headers, cookies, or freely settable GUCs.
5. Approval is bound to one immutable request, one target account, one action, one requester, one expiry, and one policy version. Any material change requires a new request.
6. Approval is single-use and atomic. Concurrent approvals, duplicate requests, replayed assertions, expired requests, revoked sessions, revoked grants, locked credentials, and changed target state must fail closed.
7. The requester's and approver's grants, MFA state, active account status, and exact live sessions are rechecked inside the final database transaction. UI checks are never authoritative.
8. The operation invalidates all target-account step-up records and all recovery-code digests. Disable removes the active authenticator and recovery codes. Reset places the target into a recovery-required state and does not grant Operations access or create a replacement credential.
9. A target account cannot approve its own reset, even if it has a second operator role or multiple sessions. If the target is also an operator, that account is excluded as approver.
10. No seed, TOTP, recovery code, password, session cookie, signing key, or assertion is stored in the request record or audit payload.
11. Every transition is append-only audited with verified actor and session identities, target, action, request ID, reason code, policy version, outcome, and timestamp. Do not log secrets or raw request bodies.
12. No break-glass shortcut is added. A separately governed owner/support recovery process, if required, must be designed and independently reviewed rather than weakening this protocol.

## Request lifecycle

States: pending, approved, rejected, cancelled, expired, completed.

- **Request:** requester selects disable or reset, supplies a bounded reason code and optional short explanation, reauthenticates password, and completes fresh MFA step-up. The database creates a pending request with a short configurable expiry (initial policy proposal: 30 minutes), immutable target/action/requester/session references and policy version.
- **Approve:** a different eligible operator loads the pending request, reauthenticates password, completes fresh MFA step-up in their own exact session, and approves the exact request ID. The database locks the request row, checks pending state and expiry, enforces requester != approver and target != approver, rechecks both actors' live sessions/grants/MFA, then atomically consumes approval and performs the requested credential invalidation.
- **Reject:** a different eligible operator may reject with a bounded reason code. Rejection is terminal and does not mutate the target's credential.
- **Cancel:** only the requester may cancel a still-pending request, using a fresh authenticated session and MFA step-up. A target or another operator cannot silently rewrite it.
- **Expiry:** expired requests cannot be approved. A cleanup process may mark them expired, but authorization must reject by timestamp even before cleanup runs.
- **Completion:** the target must re-enroll through the existing password-reauthenticated enrollment flow. No reset path may issue a seed or recovery codes to the requester or approver.

## Database design requirements

Add a protected request table owned by the NOLOGIN Operations owner role. Application roles receive no direct table privileges.

Suggested fields:
- opaque request UUID primary key;
- target account UUID;
- action check (disable or reset);
- state check;
- requester account UUID and verified session UUID;
- approver account UUID and verified session UUID, nullable until decision;
- bounded reason code and sanitized explanation;
- policy version;
- created, expires, decided, and completed timestamps;
- terminal outcome metadata.

Add narrow SECURITY DEFINER procedures with fixed safe search paths:
- create a request from verified requester context and a consumed, purpose-bound reauthentication + MFA assertion;
- list only pending requests visible to an appropriately authorised approver (return minimised fields);
- approve/reject a request from verified approver context and consumed, purpose-bound assertions;
- cancel a request from verified requester context;
- expire old pending requests.

The approval procedure must perform all checks and credential invalidation in one transaction. It must use row locking and uniqueness/constraint protection to prevent two approvers from completing one request. The requester/approver distinctness rule must be enforced in PostgreSQL, not only in the route.

The procedure must invalidate every step-up for the target and all recovery-code digests. For disable, remove/deactivate the authenticator. For reset, leave the account in a recovery-required state with no active MFA and no Operations access until fresh enrollment and confirmation complete. Never return encrypted or decrypted seed material through these procedures.

Do not add a procedure that accepts arbitrary requester or approver UUIDs. Both identities must come from the verified database session-context accessor. Do not grant the app role table DML or direct access to private signing keys.

## Server routes

Implement same-origin, no-store authenticated routes only after the database contract is tested:
- create disable/reset request;
- list pending requests for eligible approvers;
- approve or reject a request;
- cancel the requester's pending request.

Every route must validate the HTTP-only session through the existing SessionService, derive account/session IDs only from that result, create the signed database context, enforce request schemas and rate limits, and rely on PostgreSQL as final authority. Require fresh password reauthentication and a distinct signed MFA assertion purpose for each consequential action. Never accept a client-supplied MFA step or actor ID.

## UI requirements

- Show the target account, requested action, reason, requester, creation time, expiry and current state.
- Make the requester/approver distinction explicit. Hide or disable self-approval in the UI, but still reject it in the database.
- Require an explicit confirmation step before approve/reject/cancel.
- Show the final result and next steps without revealing secrets.
- Keep the interface accessible and usable on mobile.
- The UI must not imply that reset is complete until the server confirms the committed database transition.

## Required tests

PostgreSQL integration tests:
- requester cannot approve their own request, including with a second session;
- target account cannot approve its own reset;
- two distinct eligible operators can complete a valid request;
- non-operator, expired grant, revoked grant, suspended account, revoked/expired session, missing step-up, expired step-up, locked MFA and stale request all fail;
- caller-supplied actor UUID, target UUID substitution, forged GUC, forged headers/cookies and forged request-body claims do not alter verified identities;
- one request cannot be approved twice, including two concurrent approvers;
- approval/rejection/cancellation/expiry races have exactly one terminal outcome;
- credential disable/reset, all-session step-up invalidation, recovery-code invalidation and audit append commit atomically;
- application roles cannot read or mutate request/audit/MFA tables or invoke private verifier functions;
- denied and unauthenticated attempts are auditable without inventing an actor identity.

Server tests:
- same-origin and HTTP-only session enforcement;
- password reauthentication and purpose-bound assertion handling;
- rate limiting and generic error behavior;
- no secret values in logs, responses, audit payloads or persisted request records.

Browser E2E:
- requester submits a request;
- requester cannot approve it;
- a second operator can approve or reject;
- expired request is rejected;
- target is forced through fresh enrollment and cannot access Operations until complete;
- mobile and keyboard-accessible review flow.

## Rollout and verification gates

- Add a new forward-only migration; do not rewrite historical migrations.
- Test from an empty PostgreSQL database and from the previous migration head.
- Test rollback/restore procedure in a disposable production-like database before any production migration.
- Run all three exact-head GitHub workflows and record their IDs and commit SHA.
- Obtain independent security review of the SQL ownership/grants, actor provenance, row locking, concurrency and recovery lifecycle.
- Keep PR #15 draft/open/unmerged and do not deploy until the existing Issue #16 security blocker and all required reviews are resolved.
- No production secret, operator grant, MFA enablement or delivery capability may be claimed without operational evidence.

## Completion definition

This contract is complete only when the migration, procedures, routes, UI, audit events, PostgreSQL negative/concurrency tests, server tests, browser E2E, documentation, exact-head CI and independent review all exist and pass. Until then, dual-control disable/reset is **NOT IMPLEMENTED** and Operations MFA is **NOT PRODUCTION-READY**.


## Implementation checkpoint — database foundation (2026-11-11)

Migration `0031_operations_mfa_dual_control.sql` and PostgreSQL test `0031_operations_mfa_dual_control.test.sql` have now been added to the PR branch. The database slice includes protected request storage, a 30-minute pending lifetime, request and approve/reject procedures, single-use password-reauth assertion consumption, exact-session MFA step-up checks, scoped request/approval grants, requester and target self-approval denial, request row locking, requester-session/grant/MFA revalidation, and atomic target credential/recovery/step-up invalidation with audit events.

Foundation CI has been wired to apply and test migration 0031. **Exact-head CI has not yet been confirmed.** API routes, review UI, cancellation, expiry processing, notifications, race/concurrency stress tests and independent security review are still outstanding. This is a database foundation, not a complete or production-enabled feature.


## Implementation checkpoint — request cancellation and expiry

Migration `0032_operations_mfa_request_lifecycle.sql` adds:
- cancellation by the original requester only, bound to the same verified account and exact persisted session, with a current MFA step-up and scoped request permission;
- row locking and a pending/unexpired-state check so a cancellation cannot overwrite an approval, rejection or expiry;
- append-only cancellation audit attributed to the verified requester and session;
- a bounded, idempotent expiry function using `FOR UPDATE SKIP LOCKED`, restricted to the NOLOGIN Operations owner; the application role cannot execute it;
- system-attributed expiry audit events with NULL actor/session rather than inventing a human actor.

PostgreSQL test `0032_operations_mfa_request_lifecycle.test.sql` covers cancellation, expiry denial, app-role execution denial, owner execution and audit attribution. Foundation CI now applies migration 0032 and runs its test. **Exact-head CI is pending.** The expiry worker is not scheduled, and no routes, pending-request read API, UI, notifications or concurrency stress tests have been implemented. No production enablement is authorised.


## API implementation checkpoint — create, decide and cancel

Added three same-origin, no-store Operations MFA endpoints:
- `POST /api/internal/operations/mfa/requests`: validates the HTTP-only session, verifies the current account password, creates a 60-second purpose-bound password-reauth assertion, and invokes the database request procedure using a signed session transaction.
- `POST /api/internal/operations/mfa/requests/[requestId]/decision`: performs fresh password verification and delegates approval/rejection to the database procedure, which enforces exact-session MFA step-up, scoped approval permission, distinct identities, expiry and atomic decision.
- `POST /api/internal/operations/mfa/requests/[requestId]/cancel`: validates the current HTTP-only session and delegates same-requester, same-original-session, MFA-step-up and pending-state checks to PostgreSQL.

A static route-boundary test asserts same-origin validation, server-derived session context, no caller-supplied actor/session/role, and no-store response headers.

The API is an initial action slice, not a complete workflow: there is no pending-request list/read endpoint, Operations UI, integration/E2E coverage or verified dedicated rate-limit policy yet. Exact-head CI is pending. No production enablement.


## Request read API implementation checkpoint

Migration `0033_operations_mfa_request_read_api.sql` adds a protected, bounded read model for pending requests and individual request details. It requires a server-validated account/session and current `operations.mfa.security.approve` grant with MFA step-up. The application role receives execute-only access; it does not receive table access. Results exclude persisted session IDs, credentials, recovery data and assertions.

The authenticated GET endpoint is `/api/internal/operations/mfa/requests`. It supports a pending list (page size 1–100 with stable cursor) and `requestId` detail retrieval. It uses the HTTP-only session cookie, signed database context and no-store responses. A supplied foreign Origin is rejected; an Origin header is not mandatory for a safe GET because browsers may omit it.

PostgreSQL permission/data-minimisation tests and static route-boundary tests have been added and wired into Foundation CI. Exact-head CI is pending. The UI, dedicated rate limits, live API integration tests and browser E2E are not implemented yet.


## Request list/read and Operations review UI checkpoint

Migration `0033_operations_mfa_request_read_api.sql` adds a bounded, permission-gated request list/detail function with a minimal return projection. Migration `0034_operations_mfa_requester_read_scope.sql` permits:
- operators with `operations.mfa.security.approve` and current session MFA step-up to read the pending approval queue and request details;
- operators with `operations.mfa.security.request` and current session MFA step-up to read only requests they personally submitted;
- no direct application-role access to the underlying request table.

The GET endpoint returns the validated viewer account ID for UI action separation, but not persisted session identifiers or credentials. The Operations UI supports request submission, independent review/approval/rejection, and cancellation of one's own request. A requester is not offered approval controls for their own request; PostgreSQL still enforces the rule independently.

Added PostgreSQL requester-scope tests and static route/UI boundary tests. Exact-head CI for migration 0034 and the UI changes is pending. Dedicated rate limiting, route integration tests, full browser E2E, accessibility review, expiry scheduling, verified notifications, key management and independent review remain outstanding. No production enablement.


## Latest request-console verification and E2E correction (2026-11-11)

The branch now contains the protected request read model (migrations 0033/0034), authenticated bounded GET list/detail endpoint, requester-only read visibility, and Operations request/review UI. Do not treat earlier paragraphs saying these are absent as current state.

At head 78cf131c4b98d3c35aaa6cef7d2f9202c404f195, Foundation and Oracle Arc API workflows passed and PostgreSQL migration validation passed. Web/Database failed in the Playwright MFA E2E because a generic Current password locator matched the enrollment form and the dual-control request form. Profile E2E passed; typecheck, contracts, server security tests and lint passed; build was skipped after the E2E failure. The enrollment fields now have the distinct accessible name Authenticator setup password, and the E2E selectors use it. Fix commits: 21b6a549609d923f39c69dd05010f494d615a78d and 2e304b2c2d09b4ee98630aee48300e10c49f0bf3. Exact-head rerun is pending. No production enablement.


## Request queue/read API and review interface checkpoint

Migrations 0033 and 0034 add a bounded permission-gated request read model. Approvers with current exact-session MFA step-up can read the pending queue and request details; request-permission holders can read only their own requests. The projection excludes persisted session IDs, credentials, MFA seeds and recovery digests. An authenticated, no-store GET endpoint validates pagination and cursor inputs and executes through a server-signed session transaction.

The Operations MFA page now includes request submission, a pending queue, independent review/approve/reject controls and requester-only cancellation. A new Playwright test covers queue review, approval, cancellation and request creation and is wired into Web CI.

**Verification caveat:** the latest observed Web E2E run failed in the existing MFA lifecycle script at an exact intercepted-request count assertion (10 observed versus 6 expected). The profile browser workflows passed, and Foundation integrity/PostgreSQL jobs passed. The MFA E2E harness currently intercepts queue GET requests as if they were POST actions; correct that distinction and rerun all exact-head CI before marking the browser experience verified. No production enablement.


## API abuse protection checkpoint

Migration 0035 adds an Operations-owned per-account action limiter with fixed server-side limits: 5 request creations per 15 minutes, 10 decisions per 15 minutes, 10 cancellations per 15 minutes and 60 list/detail reads per minute. The database checks current exact-session MFA step-up and the permission associated with each action. The application role cannot read or modify the limiter table directly.

The authenticated create, decision, cancel and read routes invoke the limiter before password verification or request-list reads. PostgreSQL tests cover action-specific permission boundaries, fixed limits and direct-table denial. Exact-head CI is pending. This does not replace network/edge abuse controls, monitoring or security review.
