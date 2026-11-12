# Flow × MoneyLead × UNIBUD — Payment Architecture Audit

**Audit date:** 2026-11-12  
**Audit branch:** `foundation/flow-payment-security-audit`  
**Audit baseline:** `foundation/session-derived-operations-rbac-v2` at `fd53be63eafd5dd67f468d4be175512a17b69322`  
**Scope:** Current UNIBUD repository plus accessible legacy UNIBUD/Vantoriss repositories. This is a code and documentation inventory, not a live provider or production-environment attestation.

## 1. Ownership contract

- Flow remains the customer-facing financial experience and card identity inside UNIBUD.
- MoneyLead remains a separate institution/platform with its own identity, infrastructure, records, staff, commercial products and independent roadmap.
- UNIBUD owns social/platform records. It does not receive unrestricted access to MoneyLead banking records.
- Flow is the only UNIBUD-facing financial domain interface. The Quarter, Wayward, Concierge, plugins and agents submit narrowly scoped payment requests; they do not write the Flow ledger.
- Concierge, Oracle Arc and plugins may prepare instructions only. Only an authenticated user may authorise a transaction-specific immutable confirmation.
- This audit does not approve a provider, licence, payment rail, live transaction, deployment or issuer representation.

## 2. Current canonical UNIBUD repository

Repository: `iamtheoracle/unibud`  
Reviewed branch: `foundation/session-derived-operations-rbac-v2`  
Reviewed commit: `fd53be63eafd5dd67f468d4be175512a17b69322`

### Evidence inventory

| Surface | Observed state | Classification |
|---|---|---|
| Flow UI/API | No Flow route, payment API, wallet/ledger schema, checkout module or provider adapter in this branch tree | Absent in canonical branch |
| Payment integrations | `docs/architecture/INTEGRATION-REGISTER.md` lists Payment provider as undecided | Declared / unresolved |
| Integration registry | Migration `0019_external_dependency_registry.sql` permits a generic `payment_processor` kind but seeds no payment provider | Registry capability only |
| Cross-space contract | `docs/architecture/CROSS-SPACE-FLOWS.md` says Flow owns financial state; other domains request payment via approved interface | Designed |
| Data architecture | `docs/architecture/DATA-ARCHITECTURE.md` assigns Flow financial records to Flow and calls for immutable entries/reconciliation evidence | Designed |
| Concierge | `docs/concierge/CONCIERGE-SPEC.md` requires consequential-action preview/confirmation and owning-domain execution | Designed; no verified payment executor |
| Plugins/connectors | No payment plugin, connector, webhook receiver or provider SDK surfaced in reviewed canonical branch tree. Generic dependency registry is not a payment connector | Absent / unverified |
| Customer transaction PIN | No Flow transaction PIN, transaction-specific challenge or customer biometric authorization implementation found in reviewed tree | Absent |
| Device-bound biometric assertion | No Flow WebAuthn/platform-authenticator transaction assertion implementation found in reviewed tree | Absent |
| Settlement/reconciliation/refunds | No Flow payment lifecycle or settlement evidence implementation found in reviewed tree | Absent |
| Customer Operations MFA | Operations MFA exists for privileged staff actions; it is not customer transaction authorization | Implemented for distinct purpose; not reusable as payment approval |

The repository's current payment provider status is **undecided**. The registry and documentation must not be read as evidence that a payment processor is connected.

## 3. Legacy UNIBUD implementation inspected — not a production authority

Repository: `iamtheoracle/unibud-live`  
Reviewed commit: `e0692ff27aef9e315a3f74eb7d994f6f6e946146`

Relevant files:
- `src/lib/flow/server.ts`
- `src/routes/_app/flow.tsx`
- `src/lib/money/server.ts`
- `migrations/0002_unibud.sql`
- `migrations/0020_flow_sport_cinema.sql`
- `src/lib/oracle/campus.ts`

Observed behaviours and risks:
1. `fundShare` directly increments `wallets.balance_kobo` and inserts a `wallet_tx` row with status `posted`; it does not evidence an external source of funds or provider settlement. The campus assistant description explicitly says it is not pulled from a bank. This must never be represented as a real deposit or reused as a live MoneyLead funding flow.
2. `payMember` resolves a peer by handle, then performs separate sender and recipient balance updates and separate transaction inserts. The inspected function does not wrap these operations in one database transaction, lock both accounts, use an idempotency key, or require transaction-specific PIN/biometric confirmation. Partial completion, races and duplicate submission are therefore not adequately prevented by this code.
3. `moveSavings` also mutates balance columns and inserts transaction history as separate statements; it is not an authoritative double-entry journal.
4. `ensureWallet` creates a wallet row on read and derives a member number from the user ID. This is not a governed banking account-opening lifecycle.
5. `money/server.ts` contains a `demo_topup` path whose description explicitly says the funds are demo-only. It must remain clearly non-real and must not be confused with a deposit.
6. The visible Flow code uses app-access middleware, but no transaction-specific authorisation, transaction digest binding, replay protection or maker-checker process was found in the inspected functions.
7. The reviewed legacy migration adds savings/member-number columns but does not establish a double-entry journal or settlement evidence model.

Classification: legacy application functionality exists, but it is **not suitable as a production banking ledger or payment implementation**. Preserve it as historical reference only; do not silently port its balance mutation model into the canonical repository.

## 4. Legacy Vantoriss financial surfaces inspected — not approved provider evidence

Repository: `iamtheoracle/vantoriss`  
Reviewed commit: `530184f1ad9d52766f359d77ded0c1cfc9bff51a`

Relevant files:
- `src/lib/providers/registry.js`
- `src/components/vantoris/herobox/CheckoutFlow.jsx`
- `src/pages/operations/Transfers.jsx`
- `base44/entities/Account.jsonc`
- `base44/entities/Transaction.jsonc`
- `base44/entities/PaymentCard.jsonc`

Findings:
- The provider registry labels financial and payments as connected because Base44 entities store account/transaction records. That is not evidence of a bank, card issuer, payment processor, settlement network or external payment rail.
- The same registry marks card issuing as disconnected.
- HeroBox checkout creates an order with `payment_pending` / `pending` state and explicitly says the order awaits payment. It does not establish payment completion; preserve that honest distinction.
- The legacy Account schema contains U.S. ABA routing-number assumptions and mutable balance fields; it is not a MoneyLead Nigerian banking contract.
- The legacy Transaction entity has mutable status and admin/operator create/update/delete permissions. It is not an immutable double-entry ledger.
- PaymentCard is a descriptive card record, not proof of card issuance, processor tokenisation or issuer control.
- The reviewed provider registry does not identify a verified payment processor or provider webhook contract.

Classification: legacy UI and entity models only; **not a verified provider integration** and not a safe source for production ledger code.

## 5. Required transaction security protocol

Every financial action, regardless of entry point, must pass the same server-owned protocol:

1. Resolve the authenticated account, active profile/delegation and permitted Flow account from server-side session state. Never trust client account, role, owner or approval identifiers.
2. Create a pending immutable payment intent with a server-generated reference and idempotency key. Validate ownership, eligibility, currency, amount precision, limits, risk controls and recipient.
3. Calculate fees server-side. Freeze recipient, amount, currency, fee breakdown, purpose, source account, destination and intent expiry.
4. Present those exact details to the user before authorisation.
5. Require transaction PIN verification or a supported device-bound cryptographic biometric assertion. Biometric matching must remain local to the device; UNIBUD/MoneyLead must not collect or store face/fingerprint templates. Provide secure PIN fallback.
6. Bind the one-time authorisation challenge to the canonical transaction digest, account, session/device, nonce, expiry and intent reference. Any material change invalidates the challenge and requires a new preview and confirmation.
7. Consume the challenge atomically and once only. Enforce replay resistance, attempt throttling, session revocation checks and idempotent processing in PostgreSQL/server logic.
8. Only then transition the intent to authorised and allow the owning Flow payment service to process it. An AI agent, plugin, webhook or client cannot authorise on behalf of the user.
9. Record append-only security and financial audit events. Store no PIN, biometric template, raw authenticator secret or provider credential in audit payloads.
10. Distinguish `initiated`, `awaiting_authorisation`, `authorised`, `processing`, `awaiting_settlement`, `settled`, `failed`, `cancelled`, `held`, `reversed`, `refund_pending` and `refunded` states with constrained transitions.
11. External settlement is completed only on verified authoritative provider/settlement evidence, authenticated callback or independently reconciled record. Browser redirects, client callbacks, AI text and request acceptance are not settlement evidence.
12. Refunds, reversals and adjustments are new controlled lifecycle records and compensating ledger entries; never rewrite posted accounting history.

## 6. Integration and data boundaries

- UNIBUD-to-MoneyLead calls must use a dedicated authenticated service-to-service integration, narrow scopes, short-lived credentials, request signing, replay protection, rate limits, correlation IDs and audited consent/authority.
- A Flow integration response should expose only the minimum required customer-facing data: scoped account display metadata, permitted balance/transaction projections and payment-intent state. Do not expose unrestricted banking records or internal compliance/staff data.
- MoneyLead remains independently usable without UNIBUD. UNIBUD remains usable without MoneyLead; Flow must present truthful unavailable/limited states if the authorised financial service is unavailable.
- No social graph, messaging, academic, dating, media or AI memory domain may index or retain banking records by default.
- The integration registry must record provider identity, capability evidence, legal basis, scopes, data classes, consent, retention, region, webhook verification, outage/fallback, incident contact and exit strategy before a provider is enabled.
- Plugins and AI tools receive a payment-intent creation capability only. They must not receive transaction-authorisation or ledger-posting privileges.

## 7. Capability status

| Capability | Built in canonical UNIBUD | Provider verified | Operational |
|---|---:|---:|---:|
| Flow UI/payment service | No | No | No |
| Transaction PIN | No | N/A | No |
| Device-bound biometric transaction assertion | No | N/A | No |
| Immutable payment intent / transaction digest | No | N/A | No |
| Double-entry Flow ledger | No | N/A | No |
| MoneyLead integration gateway | No | No | No |
| External payment processor | No | No | No |
| Card issuer/processor | No | No | No |
| Settlement/reconciliation | No | No | No |
| Refund/dispute lifecycle | No | No | No |
| Legacy wallet UI and mutations | Exists in legacy repo only | No | No; unsafe for live funds |
| Legacy order pending lifecycle | Exists in legacy Vantoriss repo | No | No; order creation only |

## 8. Implementation sequence and deferrals

1. Resolve UNIBUD Issue #16 and obtain independent security review before PR #15 can be treated as production-safe.
2. Approve Flow as a first-class domain in the canonical UNIBUD architecture without merging it into MoneyLead.
3. Define the Flow account/payment-intent/ledger PostgreSQL model, ownership, least-privilege roles, append-only journal and balance projections.
4. Implement transaction confirmation credential lifecycle: PIN enrollment/change/recovery, device registration, device-bound challenge/assertion, risk/step-up and revocation.
5. Implement the one-time transaction-digest authorisation protocol and tests for every entry point, including Concierge and plugin requests.
6. Implement internal Flow transfers as atomic balanced journal postings with idempotency, concurrency tests, limits, audit and controlled reversal.
7. Implement generic provider adapter/webhook contracts and settlement/reconciliation state machine without selecting or claiming a live provider.
8. Add external transfer, card issuing, refunds, disputes and other capabilities only with their own provider/regulatory evidence and lifecycle tests.
9. Integrate MoneyLead using the independent authenticated boundary; no shared database or direct cross-product table access.

Deferred because no provider, legal arrangement, card issuer, settlement contract or production credentials are evidenced: external rails, card issuance, external deposits/withdrawals, provider webhooks, live settlement, refunds against external providers and production activation. Next dependency is a verified provider/issuer contract and applicable regulatory/settlement approval; this does not block building provider-independent internal controls and ledger foundations.

## 9. Verification and release boundary

This audit document is based on repository source inspection. No live payment provider was contacted, no production database was queried, no financial transaction was executed, and no production deployment was performed. The legacy code findings require dedicated regression tests if any legacy application is ever revived. Canonical UNIBUD payment functionality remains absent until implemented and verified end-to-end.
