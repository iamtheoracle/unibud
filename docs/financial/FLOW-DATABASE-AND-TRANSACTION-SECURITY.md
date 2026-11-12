# Flow PostgreSQL Domain and Transaction-Security Foundation

**Status:** Migrations 0048–0050, synthetic PostgreSQL tests, a session-bound payment-intent database procedure and an authenticated payment-intent HTTP endpoint are implemented on the Flow foundation branch. Exact-head CI is pending for the expanded branch. Not merged or deployed. No live MoneyLead connection, customer balance, payment execution or settlement is established by this work.

## Ownership boundary

- Flow remains the UNIBUD customer-facing financial experience and card identity.
- MoneyLead remains an independent institution and the intended authoritative source for banking accounts, balances, ledger posting and settlement.
- `flow_customer_accounts` maps a verified UNIBUD account to encrypted/digest-indexed MoneyLead customer and account references. It does not create a second bank account.
- `flow_payment_intents` stores immutable payment instructions and lifecycle state. An intent is not a payment, debit, credit or settlement.
- `flow_journal_entries` and `flow_journal_postings` are a balanced, append-only mirror of externally verified MoneyLead settlement events. They are not a spendable-balance ledger. No balance is derived from them for authorization or display.
- The MoneyLead repository was not accessible during this implementation pass (repository lookup returned 404), so no integration endpoint, provider contract, credential or settlement capability is assumed.

## Database controls

- Account ownership is enforced by composite foreign keys and signed-session RLS.
- Idempotency is scoped to a Flow account and stores only a SHA-256 digest of the caller-provided high-entropy key.
- Recipient references and MoneyLead identifiers are stored as ciphertext plus keyed lookup digests. AES-256-GCM and account/Flow-account-scoped HMAC protection are implemented; production key provisioning and rotation remain deployment requirements.
- Payment payload columns are immutable after intent creation. Lifecycle transitions include settlement, refund, reversal, failure and cancellation; refunds/reversals are represented as separate MoneyLead mirror events.
- Migration 0049 adds `flow_create_payment_intent`, a SECURITY DEFINER procedure owned by the NOLOGIN Flow owner. It requires both signed account and exact persisted-session context, verifies Flow-account ownership, stores a database-computed transaction digest, audits creation/replay/mismatch and uses a unique constraint plus `ON CONFLICT DO NOTHING` to make concurrent duplicate submissions idempotent. It creates an instruction only; it does not debit, reserve, submit or settle funds.
- Authorization challenges are single-use, expiry-bound, session-bound and tied to the exact `details_digest` of the intent. Migration 0050 adds composite foreign keys that make cross-account session binding and altered intent-digest binding impossible at the database constraint layer.
- PIN storage accepts only an Argon2id PHC hash. PIN verification, enrollment and recovery are not yet wired; never store plaintext PINs.
- Biometric storage contains WebAuthn public keys and counters only. Face ID/Touch ID biometric templates are never collected or stored by UNIBUD.
- Journal postings are append-only and deferred constraint-trigger validation requires at least two postings with equal debit and credit totals per journal entry/currency.
- Direct app-table access is read-only and column-limited; the app role can invoke only the narrow session-bound intent-creation procedure. PIN hashes, biometric public keys, authorization challenges, recovery digests and rate-limit records are not directly readable or writable by `unibud_app`.
- The payment-intent HTTP route validates the active persisted session, derives account/session identity server-side, encrypts recipient references, requires a 32-byte high-entropy idempotency key and returns an instruction state only. It does not process a payment. The route is not yet wired to PIN/WebAuthn confirmation, and intent-creation rate limiting is not yet enforced.
- The `unibud_flow_ingest` role is NOLOGIN and has no table privileges. It is reserved for a future verified gateway; a dedicated integration login, secrets, signed event verification and scoped account resolution are required before any ingestion privilege is granted.

## Deliberate deferrals

1. Transaction PIN service (Argon2id verification, enrollment, recovery, lockout and database-backed rate limiting): next stage. PIN hash storage exists; no PIN can currently authorize a transaction.
2. WebAuthn registration/assertion verification and signature-counter handling: next stage. The device performs biometric verification; server receives cryptographic assertions, not biometrics.
3. Transaction-bound challenge creation/consumption procedures: next stage. Challenge storage binds an exact intent digest and persisted session, but no API can approve or post a payment yet.
4. Payment-intent lifecycle transition procedures and transaction status APIs: next stage. Intent creation is implemented; authorization, submission, acceptance, settlement, cancellation, failure, refund and reversal transitions are not exposed as payment operations.
5. Intent-creation rate limiting and abuse controls: not yet wired. Rate-limit storage exists; enforce per-account and risk-aware limits before expanding the endpoint.
6. Internal transfers: blocked until MoneyLead provides a verified scoped integration and its authoritative posting contract. Flow must not simulate a bank transfer locally.
7. MoneyLead integration gateway: blocked on access to the MoneyLead repository and a verified service contract. The repository lookup returned 404 during this pass.
8. External providers, issuers, settlement adapters and live operations: blocked on verified legal arrangements, provider capabilities, credentials, webhook verification, reconciliation evidence and founder approval.


Concierge, Oracle Arc, plugins and other agents have no database write or approval grant. They may only prepare instructions for the same authenticated Flow confirmation path once that service is implemented.
