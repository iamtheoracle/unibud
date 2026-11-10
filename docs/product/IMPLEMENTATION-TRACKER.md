# UNIBUD / My Realm Network implementation tracker

Last verified: 2026-11-10
Repository: `iamtheoracle/unibud`
Tracking rule: a requirement remains **NOT STARTED**, **IN PROGRESS**, **BLOCKED**, or **NOT VERIFIED** until its backend, authorization, user experience, tests, documentation and operational evidence are all present. A screen, schema, mock, CI run or plan alone does not establish production capability.

## Status definitions

- **VERIFIED** — implementation and acceptance evidence exist at the stated commit/environment.
- **IN PROGRESS** — implementation has started but one or more acceptance requirements remain.
- **NOT STARTED** — no implementation evidence has been established in the reviewed scope.
- **BLOCKED** — work depends on an unresolved external, legal, provider, product or security decision.
- **NOT VERIFIED** — code exists, but the required test, deployment or operational evidence has not been established.
- **PRESERVED** — approved product requirement recorded for its planned stage; not a claim of implementation.

## Current delivery checkpoint

### PR #15 — Session-derived Operations authorization

- State: OPEN, DRAFT, NOT MERGED.
- Branch: `foundation/session-derived-operations-rbac-v2`.
- Latest inspected head: `74a8d21cadd1b02675978b22ab8a9c9e2ad163f1`.
- Exact-head GitHub Actions at `74a8d21cadd1b02675978b22ab8a9c9e2ad163f1`: **PASS** for Foundation checks (run `42886319998`), Oracle Arc API (run `42886319999`), and UNIBUD Web and Database (run `42886320098`).
- Review submissions and inline review threads: none returned by the latest inspection.
- Merge/deploy/production migration: not performed.
- Scope: session-derived actor for verification-delivery metadata diagnostics; global Operations grant table; allow-listed permissions, expiry and revocation; narrow database functions; append-only audit; PostgreSQL 16 CI migration/test; runbook and capability documentation.
- Important boundary: this only secures the one metadata diagnostic route. It does not establish a complete Operations console, provider health check, or provider delivery.

### Operations security work still outstanding

| Requirement | Status | Acceptance evidence still required |
|---|---|---|
| MFA / step-up authentication for privileged actions | NOT STARTED | Phishing-resistant or approved MFA enrollment, challenge, recovery, session binding, step-up expiry, replay protection, rate limits, tests |
| Operator provisioning and revocation workflow | IN PROGRESS (DBA-only runbook exists) | Dual-control approval, verified identity, least privilege, expiry, revocation, audit, tests; no self-grant |
| Operations grant-management UI | NOT STARTED | Accessible UI, server-side authorization, approval lifecycle, negative tests |
| Audit search, filtering and export | NOT STARTED | Read-only permission, privacy minimization, tamper evidence, pagination, export tests |
| Security alerts and monitoring | NOT STARTED | Defined signals, alert routing, deduplication, response runbook and tested delivery |
| Provider identity and read-only health contract | BLOCKED | Identify actual verification delivery provider and obtain documented non-mutating health contract |
| Independent production-like PostgreSQL review | NOT VERIFIED | Separate authorised review of role ownership, grants, RLS interaction, migration rollback/restore and operational impact |
| Production rollout | BLOCKED | PR approval/merge, change approval, secrets/configuration review, migration plan, rollback and monitored deployment |

## Identity, account security and profiles

| Capability | Status | Notes / acceptance evidence |
|---|---|---|
| PostgreSQL-owned persistence and migration baseline | IN PROGRESS | Migration history exists; continue validating every migration against PostgreSQL, not only static tests |
| Trusted database access and account isolation | IN PROGRESS | Continue negative cross-account tests across every new entity and route |
| Database roles and RLS without user-forgeable account context | IN PROGRESS | Maintain server-derived identity and test direct SQL/runtime role boundaries |
| Credential and verification services | IN PROGRESS | Verification delivery provider remains unresolved; never claim messages were delivered without provider evidence |
| Registration, login, recovery and secure sessions | IN PROGRESS | Keep abuse protection, recovery enumeration resistance, session rotation/revocation and device/session management in acceptance criteria |
| Profile creation, delegated access and switching | IN PROGRESS | Personal, Creator and Page/Community remain distinct profile types; delegation must use UNIBUD identity, scoped permissions and revocation |
| Profile archive, restore and recovery | IN PROGRESS | Preserve ownership checks, audit history and safeguards against losing access to remaining profiles |
| Onboarding and readiness experience | IN PROGRESS | Must be authenticated, backed by real data, accessible and end-to-end tested |
| Tutor profile | PRESERVED / NOT PUBLIC | Separate from Student; private until its planned implementation and release gate |
| Institution profile | PRESERVED / NOT PUBLIC | Separate from Student and Tutor; institutions may manage eligible students and tutors only through scoped, auditable delegation |
| Profile creation/switching and identity-based invitations E2E | NOT VERIFIED | Retain dedicated end-to-end coverage for creation, switching, discovery and invitation acceptance |

## UNIBUD product modules

These are retained product requirements. Do not remove, merge, silently rename or mark complete merely because another module is being implemented.

| Module / capability | Status | Required next evidence |
|---|---|---|
| Connect | PRESERVED | Complete social/discovery, search, friends, communities, services, events and module-specific privacy/access controls |
| Bud | PRESERVED | Separate AI application interface; social companion tools and teen-safety controls |
| Board | PRESERVED | Academic-only experience; campus discovery, tutors/institutions, classes, study groups, assignments, exams, academic content and access controls |
| Quad | PRESERVED | UNIBUD discovery; no Guild concept |
| Square | PRESERVED | Preserve approved product scope; full implementation and acceptance matrix required |
| Flow | PRESERVED | Student-focused finance app; no marketplace inside Flow |
| The Quarter | PRESERVED | Separate commerce/marketplace, merchant, catalogue, order, fulfilment, refunds and dispute domains |
| SouLync | PRESERVED | Separate dating product; release-age and safety gates required |
| Wayward | PRESERVED | Non-wagering games/prizes in UNIBUD; adult gambling excluded from teen/student release |
| Riff | PRESERVED | Connect sub-experience; preserve identity, conversation-format and lifecycle choices |
| Lync | PRESERVED | Visible streak/goal/reason-to-connect experience |
| The Concierge | PRESERVED | Independent AI application interface; consequential actions require preview and explicit confirmation |
| The Fixer | PRESERVED | Independent AI application interface for problem-solving and task execution; approval, audit and rollback where possible |
| Operations | IN PROGRESS | Global operator identity, MFA, scoped grants, audit, alerting and separation from user profiles |
| Oracle Arc | PRESERVED / SEPARATE CORE | Separate My Realm Network AI core; governed routing, evaluation, traceable decisions, app-scoped memory and controlled multimodal processing |

## Flow — banking, credit, savings, FX and investments

No live banking, lending, card issuance, FX execution, brokerage, custody or settlement is established by this tracker. Each item below requires product, legal, partner, ledger, security, UI, test and operational evidence.

| Capability | Status | Required acceptance evidence |
|---|---|---|
| Account model and double-entry ledger | NOT STARTED in this expanded scope | PostgreSQL schema, immutable journal, balanced postings, account isolation, idempotency and reconciliation tests |
| Balances, statements and transaction history | NOT STARTED in this expanded scope | Ledger-derived balances, pagination, exports, receipts and correction/reversal lifecycle |
| Internal transfers and payment lifecycle | NOT STARTED in this expanded scope | Initiation/approval/settlement evidence, fees, limits, reversals, disputes and end-to-end tests |
| Savings pots, goals and flexible savings | PRESERVED | Own-funds separation, rates/fees/withdrawal terms, statements and tests |
| Flex money / salary advance / overdraft | PRESERVED / BLOCKED | Product classification, responsible underwriting, pricing, licensed partner and local legal approval |
| Virtual debit cards | PRESERVED / BLOCKED | Issuer/processor contract, card lifecycle APIs, security controls and verified issuance |
| Physical debit cards | PRESERVED / BLOCKED | Issuer/BIN sponsor, fulfilment, activation, PIN, replacement, delivery and cardholder support |
| Credit cards | PRESERVED / BLOCKED | Licensed issuer, underwriting, APR/fees, statements, minimum payment, due dates, repayment allocation and disputes |
| Loans | PRESERVED / BLOCKED | Regulated lender, affordability, disclosures, credit checks, servicing, collections safeguards and repayment evidence |
| Buy now, pay later / buy on credit | PRESERVED / BLOCKED | Credit decision, total-cost disclosure, instalments, refunds, hardship, affordability and repayment ledger |
| FX wallets and currency conversion | PRESERVED / BLOCKED | Currency support, executable quotes, spread/fees, approved provider/corridors, sanctions checks and reconciliation |
| Remittances | PRESERVED / BLOCKED | Licensed provider, delivery status, refund/recall, fees, compliance and settlement evidence |
| Investment research and watchlists | PRESERVED | Sourced/timestamped market data, clear informational-only status where no execution exists |
| Investment accounts and trading | PRESERVED / BLOCKED | Broker/custodian, suitability, funded account, order lifecycle, confirmations, custody and regulatory approval |
| Fraud, disputes, chargebacks and reconciliation | NOT STARTED in expanded Flow scope | Dedicated operational queues, evidence, SLAs, alerts, immutable audit and recovery tests |

**Flex-money terminology must remain explicit:** access to a user's own savings is not a loan; overdraft, salary advance, loan and BNPL are distinct credit products. Debit, credit, stored value and investment assets must never be combined into a misleading single balance.

## The Quarter — marketplace

| Capability | Status |
|---|---|
| Buyer/seller identities, storefronts, catalogue and inventory | PRESERVED |
| Search, filters, pricing, tax/fees and availability | PRESERVED |
| Checkout, orders, fulfilment/delivery and receipts | PRESERVED |
| Cancellations, returns, refunds and disputes | PRESERVED |
| Buyer-vendor messaging, reviews, moderation and seller verification | PRESERVED |
| Credit checkout integration | BLOCKED pending approved Flow/credit partner and legal controls |

The Quarter remains separate from Flow's core ledger. Concierge may place orders/pay only with scoped authorization and explicit confirmation of item, recipient, amount and terms.

## Bud, The Concierge and The Fixer — AI application interfaces

All three are independent AI application interfaces, not just chat boxes. They share a governed foundation but must retain separate product roles, app-scoped memory, tool permissions, safety policies and audit boundaries.

| Capability | Status |
|---|---|
| Streaming chat, conversation history/search, edit/resend, regenerate, stop and feedback | PRESERVED |
| Citations, source inspection, web research and freshness labels | PRESERVED |
| Image/document understanding and secure file upload/scanning/retention/deletion | PRESERVED |
| Voice input/output and transcription with consent | PRESERVED |
| Tool execution, least-privilege grants, revocation and confirmation | PRESERVED |
| App-scoped memory, user correction, retention and deletion | PRESERVED |
| Model routing/selection, usage metering, quotas, spend controls and fallback | PRESERVED |
| Prompt-injection resistance, untrusted-content isolation and high-impact safety | PRESERVED |
| Export/deletion, privacy controls, device/session management and support | PRESERVED |
| Bud-specific UNIBUD social and teen-safety experience | PRESERVED |
| Concierge-specific booking/order/payment preview and confirmation | PRESERVED |
| Fixer-specific troubleshooting/task execution, approval and rollback | PRESERVED |
| Oracle Arc local-first runtime and real model/tool execution | NOT VERIFIED until deployed and exercised with evidence |

## Wayward and gambling boundary

- UNIBUD / teen and student release: non-wagering games, competitions and transparent prize/education reward experiences only.
- Real-money gambling, betting, wagering wallets, casino games, cash-out jackpots and gambling promotion: EXCLUDED from UNIBUD.
- Any future adult gambling product: separate 18+ product, separate legal entity/product review as appropriate, independent age assurance, jurisdiction/licensing, KYC/AML, segregated funds, approved rails, responsible-gambling safeguards and independent compliance verification. Do not build or activate real-money wagering in this UNIBUD scope.

## Website and platform-wide completion

| Capability | Status |
|---|---|
| Responsive, accessible design and keyboard/screen-reader support | IN PROGRESS across modules |
| Authentication, authorization, privacy and consent | IN PROGRESS |
| Search, filtering, notifications and preferences | PRESERVED; module-level acceptance tests required |
| Help, support, feedback, reporting and legal disclosures | PRESERVED; implementation evidence required |
| API validation, CSRF/XSS/SSRF protection, rate limits and secret management | IN PROGRESS |
| Encryption, backups, restore, disaster recovery and incident response | NOT VERIFIED |
| Monitoring, alerting, audit and service status | IN PROGRESS |
| Performance budgets, SEO/metadata, sitemap/robots and analytics consent | NOT VERIFIED per public surface |
| Admin/operator isolation from customer experiences | IN PROGRESS |
| Release gates, rollback, migration review and production runbooks | IN PROGRESS |

## External dependencies and decisions

These remain unresolved until verified against actual contracts, official documentation and applicable local regulation:

1. Verification email/SMS provider identity and documented read-only health contract.
2. Production authentication/MFA delivery and recovery providers, if external services are required.
3. Regulated banking/deposit partner and permitted account/custody model.
4. Debit/credit issuer, BIN sponsor, processor, network and card fulfilment.
5. Licensed lender / credit partner for loans, overdraft, salary advance and BNPL.
6. FX/remittance provider, approved currencies and corridors.
7. Broker, custodian, exchange and market-data sources for investment services.
8. AI inference/model providers, voice/multimodal services, and secure file/object storage.
9. Jurisdiction-specific legal, privacy, child-safety and financial regulatory review.
10. Hosting, monitoring, email, notification, backup and incident-response operations.

Do not invent a provider, claim an API is connected because its name appears in configuration, or store secrets in frontend code or Git history.

## Next implementation sequence

1. **Close PR #15 safely:** retain draft/open state until the owner reviews the diff, confirms exact-head CI and approves merge. CI passing is not merge approval.
2. **Operations MFA/step-up:** design server-side challenge lifecycle, phishing-resistant options where available, secure recovery, replay prevention, rate limiting, session binding and negative tests.
3. **Operator governance:** dual-control provisioning/revocation, accessible UI, immutable audit search/export, monitoring and tested alerts. Never allow self-grant.
4. **Flow financial foundation:** design and test the double-entry ledger, account ownership, account isolation, idempotency, posting/settlement states, reversals and reconciliation before building credit/card UX.
5. **Regulated provider and compliance architecture:** validate Nigeria-first legal/partner requirements before activating real financial products.
6. **The Quarter commerce foundation:** separate merchant/order/fulfilment/refund domain and connect approved payments only after Flow/partner controls exist.
7. **AI application interfaces:** implement Bud, Concierge and Fixer separately over the governed Oracle Arc runtime.
8. **Complete remaining UNIBUD modules and public platform foundations** without removing approved requirements.

## Definition of done — mandatory for every implementation

- Database migration applies cleanly to PostgreSQL and has a rollback/recovery plan.
- Server-side identity and authorization are enforced; account/profile boundaries are tested.
- Negative tests prove cross-account, cross-profile and unauthorized-role denial.
- APIs validate inputs, rate-limit abuse, avoid leaking secrets and expose correct error states.
- UI is responsive, accessible and covers loading, empty, failure, retry and offline states.
- End-to-end tests cover the real user journey and consequential-action confirmation.
- Audit, monitoring, alerts, support and operational runbooks exist where relevant.
- Capability register, dependency inventory and this tracker are updated in the same implementation.
- Exact-head CI passes; reviewers inspect the diff; merge/deploy is explicitly approved.
- No production or regulated capability is claimed live without actual provider, legal, settlement and operational evidence.

## Update protocol

At every development stage:
1. Re-read this tracker and the capability register before selecting work.
2. Select the highest-priority unfinished dependency; do not skip blockers.
3. Update only statuses supported by code and test evidence.
4. Record branch, PR, commit SHA, CI run IDs, review state, migration status and deployment state.
5. Add newly discovered requirements without deleting previously approved ones.
6. Keep blocked external dependencies visible with the exact decision/evidence needed to unblock them.
7. Report what changed, what passed, what failed, what remains and the next implementation.


## Newly discovered security blocker — Issue #16

<badge>HIGH PRIORITY — BLOCKS PR #15 MERGE</badge>

- Issue: [#16 — Bind Operations authorization and audit actor to non-forgeable database identity](https://github.com/iamtheoracle/unibud/issues/16).
- Finding: the route derives the account UUID from a validated session, but migration 0020 exposes SECURITY DEFINER functions to `unibud_app` that accept arbitrary actor UUID parameters. A caller running as the app database role can supply a different known account UUID directly to the permission function and can forge the actor UUID in audit records.
- Consequence: route-level correctness does not satisfy the database-level non-forgeable identity requirement. This must be fixed before PR #15 is merged or deployed.
- Required: inspect the existing identity/session database trust architecture; implement cryptographically verifiable actor propagation or another equivalently non-forgeable design; remove unsafe function signatures/grants; derive audit actor from verified context; add PostgreSQL negative tests for impersonation and audit forgery; rerun all exact-head CI.
- Do not use a plain caller-settable PostgreSQL GUC/session variable as proof of identity.
- PR #15 remains OPEN, DRAFT and NOT MERGED. No production deployment or migration is authorised.

