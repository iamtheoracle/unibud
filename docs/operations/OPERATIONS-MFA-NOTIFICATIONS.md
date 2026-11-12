# Operations MFA security notifications

## Scope

Migration 0039 adds an account-scoped in-app notification inbox sourced from the append-only Operations MFA audit stream. Notification creation happens in the same PostgreSQL transaction as the audit event. A failed notification insert therefore rolls back the originating event transaction instead of silently losing the notice.

The inbox currently covers:
- successful authenticator enrollment;
- authenticator lockout;
- recovery-code use and recovery-code regeneration;
- dual-control security change requested, approved, rejected, cancelled or expired;
- authenticator disablement through the approved dual-control process.

High-volume ordinary challenge successes and failures are deliberately not turned into inbox items. This avoids creating noisy notifications and does not change the underlying audit record.

## Account isolation

- A recipient is derived by the database trigger from the immutable MFA event and, for expired requests, the persisted security request.
- A request event is delivered in-app to the requester and target. Decision events are delivered to the independent approver/actor and the target. Expiry is delivered to the target and original requester.
- The notification table has forced RLS and a current-account policy. Application roles have no direct table privileges.
- Read and mark-read functions accept no account ID. They derive account and session from the verified signed database session context.
- Mark-read can affect only the current account's notification. Repeated marking is idempotent.
- The read endpoint requires a validated persisted account session and same-origin protection for writes. Notification reads have a dedicated account-level rate limit and do not require MFA step-up; this is intentional so a locked-out user can still see security notices. No privileged Operations action is granted by reading the inbox.

## External delivery boundary

This implementation is **in-app only**. It does not send email, SMS, push notifications or webhook requests. It does not claim that a notification was delivered to an external address or device. The existing verification-delivery gateway contract is a separate integration and does not establish a supported security-notification delivery provider.

External delivery remains a separate future integration. Before it can be enabled, UNIBUD must select and verify a provider, define a signed/idempotent notification contract, establish destination ownership and consent, prevent sensitive event details from entering messages, record provider receipts, retry safely, and add delivery monitoring and failure alerts. A configured endpoint alone is not proof of delivery.

## Verification

- `database/tests/0039_operations_mfa_security_notifications.test.sql` checks event-triggered notice creation, requester/target/approver recipient mapping, cross-account read isolation, mark-read ownership, absence of direct table grants, and availability of account notices before MFA step-up.
- `apps/web/test/operations-mfa-notifications.test.ts` checks the API's validated session and signed-context boundary, no-store responses, and UI integration.
- Foundation CI applies migration 0039 and runs the PostgreSQL test. Web CI runs TypeScript and application contract tests.

## Retention and operations

Notifications are durable and currently have no automatic deletion schedule. Retention, user-visible deletion controls and a bounded cleanup policy must be designed alongside the broader security-audit retention policy; do not delete notification rows merely to reduce table size. The audit event remains the authoritative security record.
