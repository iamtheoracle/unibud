# Flow PostgreSQL Domain and Transaction-Security Foundation

**Status:** Migration and synthetic PostgreSQL tests added on the Flow foundation branch. Not deployed. No live MoneyLead connection, customer balance, payment execution or settlement is established by this work.

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
- Recipient references and MoneyLead identifiers are stored as ciphertext plus keyed lookup digests; the application encryption/key management is a separate deployment requirement.
- Payment payload columns are immutable after intent creation. Lifecycle transitions are constrained to the allowed forward path; reversals are new external settlement mirror events.
- Authorization challenges are single-use, expiry-bound, session-bound and tied to the exact `details_digest` of the intent.
- PIN storage accepts only an Argon2id PHC hash. PIN verification, enrollment and recovery are not yet wired; never store plaintext PINs.
- Biometric storage contains WebAuthn public keys and counters only. Face ID/Touch ID biometric templates are never collected or stored by UNIBUD.
- Journal postings are append-only and deferred constraint-trigger validation requires at least two postings with equal debit and credit totals per journal entry/currency.
- App runtime access is read-only and column-limited. PIN hashes, biometric public keys, authorization challenges, recovery digests and rate-limit records are not directly readable or writable by `unibud_app`.
- The `unibud_flow_ingest` role is NOLOGIN and has no table privileges. It is reserved for a future verified gateway; a dedicated integration login, secrets, signed event verification and scoped account resolution are required before any ingestion privilege is granted.

## Deliberate deferrals

1. Transaction PIN service (Argon2id verification, recovery, lockout and rate limiting): next stage.
2. WebAuthn registration/assertion verification and signature-counter handling: next stage. The device performs biometric verification; server receives cryptographic assertions, not biometrics.
3. Transaction-bound challenge creation/consumption procedures: next stage. The schema binds challenge rows to the payment intent digest and exact session, but no API can approve or post a payment yet.
4. Payment intent creation, idempotent API and state-transition procedures: next stage.
5. Internal transfers: blocked until MoneyLead provides a verified scoped integration and its authoritative posting contract. Flow must not simulate a bank transfer locally.
6. External providers, issuers, settlement adapters and live operations: blocked on verified legal arrangements, provider capabilities, credentials, reconciliation evidence and founder approval.

Concierge, Oracle Arc, plugins and other agents have no database write or approval grant. They may only prepare instructions for the same authenticated Flow confirmation path once that service is implemented.
