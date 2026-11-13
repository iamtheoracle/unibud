# MoneyLead and UNIBUD Flow — mandatory banking integration contract

Status: Core release requirement, not a post-launch enhancement. This contract does not claim a live MoneyLead connection, licensed status, provider credentials, payment rail or settlement.

## Ownership
- MoneyLead is the independent institution and authoritative owner of onboarding applications, KYC, eligibility decisions, account issuance, customer accounts, available balances, incoming/outgoing payments, branch-office receipts, ledger posting, settlement, returns, reversals and reconciliation.
- UNIBUD Flow is the customer-facing instruction, transaction-review and transaction-authorization surface. Flow is not a second bank ledger and cannot issue account numbers, change balances, post transactions or mark transfers settled.
- UNIBUD identity/profile records are not MoneyLead KYC records. Flow receives only the minimum account mapping and customer-visible statuses required for its experience.

## Public application and private KYC
1. A public visitor may create an email login and submit a minimal account-opening enquiry/application. Email verification proves inbox control only; it is not identity verification, KYC, eligibility or account approval.
2. Public signup must not expose identity-document capture, liveness capture, KYC provider calls, KYC status mutation, operator queues or private KYC records.
3. After intake, show: “Your application has been received. A MoneyLead staff member will contact you.” Do not promise approval or account issuance.
4. Only an authenticated, authorized operator may assign an application and issue a private, one-time, expiring KYC invitation.
5. The invitation is sent to the applicant's verified email. It contains a high-entropy opaque token; store only a keyed digest. Bind it to application, intended email/customer, KYC provider/session and expiry. Enforce one-time use. Never expose it in public search, logs, analytics or referrers.
6. The link returns the applicant to a MoneyLead-owned private KYC journey. It must not expose KYC through an unauthenticated public form. After provider handoff/verification, return the applicant to their application status page.
7. KYC results come from the verified provider plus authorized human review. Staff cannot fabricate provider verification. Overrides and rejection require reasoned audit trails and applicable dual control.
8. Account issuance is a separate transition after KYC, eligibility, sanctions/AML and program approval. Account identifiers come from the authorized institution/issuer, never local random generation.

## Mandatory banking capabilities

### Account issuance
Application intake → staff assignment → private KYC invitation → provider KYC evidence → compliance review → approval → issuer account-opening request → verified account identifiers → customer notification → account active. Require idempotent opening, provider references, immutable status history, masked details, ambiguous-outcome reconciliation, duplicate-customer detection and closure/restriction lifecycle. No account is active until issuer evidence is verified and reconciled.

### Incoming payments
Support incoming transfer/ACH/wire/internal credits and staff-recorded branch payments. Branch entry is restricted to assigned branch staff and permitted payment types. Capture branch, authenticated staff identity, customer/account reference, amount/currency, receipt/reference, source, timestamp and evidence metadata. Require maker-checker where policy says so. A staff entry is a receipt/instruction, not automatically a posted credit. Posting and availability require cash-control/ledger procedures, duplicate checks and evidence. Lifecycle distinguishes expected, received, under review, awaiting settlement, settled/posted, returned, reversed and rejected. Do not expose funds as available before authoritative posting.

### Outgoing payments
Customer instruction → server-side account/limit/risk checks → immutable fee/recipient/amount preview → transaction-specific PIN or device-bound WebAuthn user verification → one-time authorization → idempotent dispatch → provider status → settlement/reconciliation. Branch-assisted outgoing payments require customer authorization evidence, staff permissions and independent checker approval for configured thresholds/high-risk actions. Unknown/timeout outcomes are reconciled by idempotency key before retry. No blind retries.

### Settlement and reconciliation
Settlement is a first-class mandatory domain: authenticated rail/provider evidence, settlement batches, clearing references, value dates, fees, exceptions, returns, reversals, suspense, double-entry postings and daily reconciliation. Postings are balanced and immutable; corrections use compensating entries. Exceptions create operator alerts and remain open until evidence-backed resolution. Distinguish accepted, processing, awaiting settlement, settled, available, returned and reversed.

## Security and operations
Use PostgreSQL transactions, unique idempotency constraints, transactional outbox/inbox, authenticated signed webhooks, replay protection, key rotation, encryption, least-privilege DB roles, RLS, server-side authorization and append-only audit. Staff roles and branch scope are server-derived. Branch staff cannot approve their own maker entries where maker-checker applies. AI/Concierge/plugins may prepare, never authorize or post. Email delivery is evidence-backed; a generated message ID or local mock is not successful delivery. Full lifecycle, concurrency, replay, role matrix, negative authorization, reconciliation, backup/restore and incident tests are release gates.

## Flow integration contract
MoneyLead must expose a versioned authenticated service contract for account mapping/lifecycle, authorized outgoing instruction submission/idempotency lookup, and authenticated financial event delivery. Signed, replay-protected, uniquely identified events cover account issuance, incoming credits, outgoing status, settlement, return and reversal. Flow stores events in a durable inbox, verifies signatures and deduplicates before mirroring minimal customer-visible state. Flow cannot infer balance or settlement from redirects, browser state, staff UI, AI output or unverified webhooks. No adapter is enabled until API schemas, service identity, signature/key lifecycle, provider contract and test evidence are verified.

## Current audit findings and blockers
- Accessible MoneyLead repository: The-Oracle-Arc/moneyleads, default branch main, commit 9d142107eaa72df12971b919a147846553b30ebd (2026-10-16).
- Its README describes U.S. checking and says production banking access is gated on program, compliance, underwriting and partner approvals. The code uses Column and USD/ABA assumptions. No banking licence or regulatory authorization evidence was found in repository metadata or reviewed code. Do not represent it as licensed until the legal entity, jurisdiction, licence/authorization and permitted activities are verified.
- Existing customer onboarding directly exposes KYC steps, document capture and liveness in the signup journey. This conflicts with the required operator-issued private invitation model.
- MoneyLead uses Vite + TanStack Start/Router, not Next.js. The requested Next.js design system is a framework migration, not a small styling change.
- The code includes a Column integration, KYC queue, staff roles, account/transfer/reconciliation screens and webhook handling, but this audit has not proven production credentials, provider approval, actual account issuance, live incoming/outgoing rails, branch payment controls or settlement.
- A branch-write attempt against MoneyLead was rejected by the connected GitHub integration with HTTP 403 Resource not accessible by integration. No MoneyLead file was changed. Independent MoneyLead implementation cannot honestly be reported as committed until write access is restored.
- UNIBUD Flow already has PostgreSQL payment-intent creation, PIN/WebAuthn transaction authorization and a fail-closed outgoing gateway. The gateway has no account issuance, incoming-event, branch-payment mirror or settlement-event integration; no real MoneyLead gateway is active.

## Release acceptance
MoneyLead and Flow are not release-complete until account issuance, incoming payments, outgoing payments, branch-office payment recording, settlement and reconciliation pass end-to-end tests against authorized live institution/rail contracts. Sandbox tests are not live production evidence. No capability in this list may be silently deferred beyond launch.
