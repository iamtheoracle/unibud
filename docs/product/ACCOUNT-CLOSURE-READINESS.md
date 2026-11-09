# Account closure readiness experience

## Purpose

The account closure readiness surface explains the account-owned records and relationships that must be resolved before a closure request can be considered. It is a review and preparation experience, not a deletion interface.

## Authenticated data flow

- The browser requests `GET /api/account/closure-readiness` with the existing secure session cookie.
- The route validates the session and derives the account ID exclusively from the validated session. It never accepts an account ID from query parameters or request JSON.
- The route obtains the authoritative database closure preflight, accessible owned profiles, archived owned profiles, incoming transfer requests, delegated relationships and outgoing transfer requests through the profile service.
- The response is marked `Cache-Control: no-store`; it contains only the current account's permitted profile and relationship context.
- Missing or invalid sessions receive 401. Authenticated but unauthorized profile operations receive 403. Unexpected failures use the shared route error handler.
- The UI presents loading, error/retry, empty, blocked and policy-gated states. It uses semantic headings, labelled sections, definition lists, list items, status/alert regions and keyboard-operable links.

## Blocker inventory

The page displays:
- Active and restricted owned profiles.
- Archived owned profiles, which remain owned and block closure.
- Active and suspended delegated relationships.
- Incoming ownership-transfer requests.
- Outgoing ownership-transfer requests for transferable Creator and Page/Community profiles.

Each item links to profile management for review. The database preflight remains authoritative; a UI list is never treated as permission to close an account.

## Permanent closure gate

Permanent closure is deliberately unavailable, even when the profile/delegation preflight reports no blockers. Before enabling closure, UNIBUD must define, approve and test:
1. Legal and operational retention periods, including financial, safety, moderation and audit records.
2. User notice, consent and jurisdiction-specific disclosure requirements.
3. Content ownership, export, deletion and treatment of shared/community content.
4. Dependencies such as transactions, bookings, contracts, subscriptions, school records, provider accounts and disputes.
5. Identity re-verification, cooling-off/recovery window, cancellation and support escalation.
6. Deletion orchestration, backup expiry, third-party processor deletion evidence and incident recovery.

The current surface does not delete, export, transfer, suspend or close any account data. It does not imply production readiness or legal approval.

## Verification

The pure readiness builder is covered for:
- Policy gating even when no profile/delegation blockers remain.
- Active and archived profile blockers.
- Active and suspended delegated relationships.
- Incoming and outgoing transfer review items.

The authenticated route passed repository CI at code commit `b2204d568635db570924572c5f4c8b501abdff46`: PostgreSQL 16 migration/RLS, Oracle Arc API, typecheck, contract tests, server security tests, lint, profile browser E2E and production build. Production database and deployment verification are separate release gates.
