# UNIBUD / My Realm Network implementation tracker

Last verified: 2026-11-12
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
- Latest inspected and verified code head: `4cc1cd09d377933e02c0067b6c94761159db791f`.
- Exact-head GitHub Actions at `c16e9e8cff39dc6926c11bc6b8c3851d52ca5604`: **PASS** for Foundation checks (run `42925640430`), Oracle Arc API (run `42925640442`), and UNIBUD Web and Database (run `42925640425`). The Web workflow completed type check, contract tests, server security unit tests, lint, profile browser E2E and production build; PostgreSQL migration validation passed. Foundation applied all identity/auth migrations and passed PostgreSQL 16 RLS isolation and foundation integrity.
- Review submissions and inline review threads: none returned by the latest inspection.
- Merge/deploy/production migration: not performed.
- Scope: session-derived actor for verification-delivery metadata diagnostics; global Operations grant table; allow-listed permissions, expiry and revocation; narrow database functions; append-only audit; PostgreSQL 16 CI migration/test; runbook and capability documentation.
- Important boundary: this only secures the one metadata diagnostic route. It does not establish a complete Operations console, provider health check, or provider delivery.

### Operations security work still outstanding

| Requirement | Status | Acceptance evidence still required |
|---|---|---|
| MFA / step-up authentication for privileged actions | IN PROGRESS / NOT RELEASE-READY | TOTP enrollment, confirmation, challenge, exact-session step-up, recovery redemption/regeneration, status/resume, lockout, protected audit, UI and PostgreSQL concurrency tests exist; still require disable/reset dual control, lifecycle notifications, operational key provisioning/rotation, cleanup/retention and independent security review |
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



## Issue #16 remediation — implementation started, verification pending

- **Implemented on the existing PR branch:** migration `0021_non_forgeable_operations_actor.sql` removes the UUID-accepting Operations permission and audit functions and replaces them with narrow signatures that derive the actor through `unibud_private.current_account_id()`.
- **Trust mechanism:** the existing database HMAC verifier validates the short-lived transaction context. A caller-settable account GUC without a matching server-generated HMAC fails closed. The Operations owner receives only the schema/function privileges needed to invoke that verifier.
- **Route updated:** the verification-delivery metadata diagnostic validates the first-party session, creates the signed context from that server-derived account ID, and performs the permission check plus audit write in one signed transaction. Unauthenticated audit events are explicitly unattributed; the caller cannot supply an actor ID.
- **Tests added:** PostgreSQL migration test for valid session context, removed legacy UUID-taking APIs, forged-account GUC denial, audit actor provenance, unattributed unauthenticated events and immediate revocation. Web contract tests cover the route's signed-context usage and preserve authenticated error audit coverage. Foundation CI now applies and tests migration 0021.
- **Verified code head:** `6658dd12ad059c3025f8a30241bed2d1ed8ede0f`. **CI status for this code head: PASS.** Oracle Arc API run `42923367566`, Foundation run `42923367792`, and UNIBUD Web and Database run `42923367543` all completed successfully. The web workflow passed PostgreSQL migration validation, TypeScript, contract tests, all 94 server security unit tests, lint, profile browser E2E and production build. Foundation PostgreSQL 16 applied migrations 0001–0021 and ran the migration-0021 SQL integration test successfully. The branch head subsequently advanced to `cdd64873` for documentation-only changes. This is CI evidence, not independent security review or production rollout approval. Issue #16 remains open; PR #15 remains open/draft/unmerged.
- **Operational prerequisite:** the app signer and database verifier must be provisioned with the same environment-specific HMAC key through separate secret-manager bindings. No key is stored in the repository or migration. Existing production-like environments must be checked for this configuration before any rollout.
- **First CI finding:** Foundation run `42918114306` applied migrations 0001–0021 successfully but the SQL test suite failed because the older migration-0020 test still invoked the removed UUID-accepting function signatures. The migration-0021 PostgreSQL test had not yet been reached in that failed test step. The legacy test has now been rewritten to use signed context, test permission allow-listing, direct-table denial, audit immutability and revocation. The earlier Oracle Arc API job passed; the Web and Database workflow was still running when inspected. These results are from the earlier PR merge ref at commit `8427e37618e7c085fc305196a4a9fd30d35a995a`, not proof for the latest branch code.
- **Second CI finding:** Foundation run `42918389218` passed, including PostgreSQL 16 migrations and identity/RLS tests. Oracle Arc API run `42918389332` passed. UNIBUD Web and Database run `42918389306` passed its PostgreSQL migration validation, TypeScript type check and contract tests, but its server security unit-test step failed 1 of 94 tests. The failing test was a stale route assertion expecting `createSignedAccountContextFromEnvironment(validation.account.id)` directly; the route correctly stores the validated ID in `authenticatedAccountId` before signing. The assertion has been corrected in commit `6658dd12ad059c3025f8a30241bed2d1ed8ede0f`. A fresh exact-head run has not yet been observed.
- **Next verification:** rerun exact-head CI after commit `6658dd12`, inspect every job and log, verify the PostgreSQL 0021 negative test actually runs, then verify migration ordering and rollback/recovery and request independent security review. PR #15 remains OPEN, DRAFT and NOT MERGED.


## Next implementation — Operations MFA cryptographic foundation

- **Started on branch:** `foundation/session-derived-operations-rbac-v2`.
- **Implementation commits:** `e65b894e997df6c8fb93998d08cc8def6eb7b07c` (TOTP/recovery cryptographic core) and `c9f386f2456b0613e66dc415647090b250f3edb1` (unit tests).
- **Implemented:** RFC 6238 TOTP generation and verification (SHA-1, six digits, 30-second period, one-step clock tolerance); replay-aware verification returns the matched time step for atomic persistence checks; AES-256-GCM encryption of 160-bit TOTP seeds with account-bound associated data; authenticator provisioning URI; 10 single-display recovery-code generation and account-bound keyed digests; constant-time comparisons and strict key/format validation.
- **Tests authored:** RFC 6238 vectors, adjacent-step verification, replay rejection, encrypted seed round-trip and cross-account/tamper denial, provisioning parameters, recovery-code uniqueness/account binding, and invalid-key/input rejection.
- **Status: CRYPTOGRAPHIC CORE ONLY — NOT ACTIVE MFA.** No database enrollment/activation persistence, atomic replay-step update, one-time recovery-code consumption, operator login challenge, session step-up claim, API routes, UI, throttling/lockout or audit events have been implemented yet. No authenticator enrollment can currently be completed in the app. Do not represent operators as MFA-protected until all these layers and end-to-end tests pass.
- **Key management prerequisite:** the eventual runtime must receive two separate 32-byte keys (AES-GCM seed-encryption key and recovery-code HMAC key) from the approved secret manager. Keys must not be stored in PostgreSQL, source control, browser code, logs or generated provisioning links. Key rotation needs a versioned envelope and documented re-encryption/recovery plan.
- **Next substage:** add operator-only MFA credential and recovery-code persistence, database procedures for pending enrollment/confirmation/disable and atomic TOTP-step/recovery-code consumption, then bind verified step-up to the exact session and enforce it on every Operations endpoint. Require recent password reauthentication for enrollment/disable/recovery regeneration, deny all Operations access until enrolled and stepped up, and audit all security-state transitions.
- **Verification:** the MFA commits above are newer than the last observed all-green PR checks. Fresh exact-head CI is required before treating this cryptographic-core slice as verified.


## Latest checkpoint — 2026-11-10

- **Branch head:** `e559cbb01394fb1eee7cf76a9bb3faf92fc65d3e`.
- **Operations authorization:** the earlier code head `6658dd12` passed all three workflows: Web/Database `42923367543`, Foundation `42923367792`, Oracle Arc API `42923367566`. The full Web job including browser E2E and production build completed successfully; Foundation ran PostgreSQL 16 migrations 0001–0021 and the migration-0021 SQL tests successfully.
- **MFA cryptographic slice:** `e65b894e` adds the RFC 6238 TOTP, AES-256-GCM seed protection, provisioning URI and recovery-code primitives; `c9f386f2` adds six unit tests; `e559cbb0` adds explicit previous/current/next time-step tolerance assertions.
- **Latest CI:** fresh runs for `e559cbb0` are underway: Foundation `42924175017`, Web/Database `42924174799`, Oracle Arc API `42924174741`. PostgreSQL migration validation, TypeScript, contract tests, 94 existing security unit tests and lint had passed in the earlier run for `c9f386f2`; the latest expanded TOTP suite and full build/E2E remain pending exact-head completion.
- **MFA state:** cryptographic core only. There is no persistent enrollment, no active operator second factor, no replay-safe database update, no one-time recovery redemption, no login challenge or session step-up enforcement. MFA remains disabled/not implemented end-to-end.
- **Security/release state:** PR #15 remains OPEN and DRAFT; Issue #16 remains OPEN pending independent security review and the required key-provisioning/recovery operational review. No merge, production migration or deployment has occurred.


### MFA exact-head CI progress — `e559cbb01394fb1eee7cf76a9bb3faf92fc65d3e`

- Foundation run `42924175017`: passed.
- Oracle Arc API run `42924174741`: passed.
- Web/Database run `42924174799`: PostgreSQL migration validation passed; TypeScript, contract tests, 94 server security unit tests and lint passed. Playwright installation was in progress at last inspection; browser E2E and production build had not started.
- Therefore the new MFA crypto unit tests have passed the web type-check, test and lint stages, but **full exact-head CI is still pending**. Do not mark the MFA slice fully verified until browser E2E and production build finish successfully.


## Operations MFA persistence checkpoint — 2026-11-11

- **Implemented on this branch:** migration `0022_operations_mfa_storage.sql` creates protected per-account authenticator credential storage and a separate recovery-code digest table. The credential row supports pending/active state, enrollment expiry, confirmation timestamp, monotonic TOTP step storage, failed-attempt count and lock expiry. Recovery records store only 32-byte keyed digests and redemption timestamps.
- **Database boundary:** both tables are owned by the non-login `unibud_ops_owner` role. Direct table privileges are revoked from PUBLIC, `unibud_app`, `unibud_readonly` and `unibud_auth`. No enrollment, activation, verification or recovery RPC is exposed by this migration. No caller can yet read/write this storage through the application.
- **PostgreSQL tests added:** app-role SELECT/INSERT/UPDATE denial, owner-only fixture access, digest-length constraint and invalid pending/confirmed state rejection. Foundation workflow now applies migration 0022 and runs its SQL test after migrations/tests 0021.
- **CI correction:** for the prior crypto code head `e559cbb01394fb1eee7cf76a9bb3faf92fc65d3e`, Foundation `42924184787`, Web/Database `42924184785` and Oracle Arc API `42924184937` all completed successfully. These runs verify that exact prior code head, not the newer migration 0022 changes.
- **Current state:** persistence schema and its SQL test have been committed, but the updated Foundation workflow has not yet completed on the new branch head. Do not call this storage migration verified until the exact-head PostgreSQL workflow passes. MFA remains **not enabled**; no enrollment, login challenge, recovery redemption, session step-up or endpoint enforcement exists.
- **Next:** add narrow SECURITY DEFINER procedures that derive the account exclusively from the verified signed transaction context; add server-authenticated proofs for TOTP acceptance and exact-session step-up; implement atomic TOTP replay prevention and single-use recovery redemption; then implement enrollment/challenge routes, password reauthentication, lockout/throttling, audit, UI and end-to-end tests. Do not let a caller-supplied time-step or a caller-settable GUC stand in for a cryptographic proof.
- **Release state:** PR #15 remains open/draft/unmerged. Issue #16 remains open pending independent security review. No production migration or deployment has occurred.


### Follow-up integrity refinement — 2026-11-11

- Migration 0022 now requires an active credential to carry both a confirmation timestamp and the initially consumed TOTP step. This prevents a future activation path from creating an active credential with no replay baseline.
- The PostgreSQL test now rejects both an impossible pending/confirmed state and an active credential missing its initial consumed step, in addition to checking app-role access denial and recovery digest length.
- Latest code/test commit at this checkpoint: `7e07be7cac4685add57184d0a91657f463c7d1ea`. The Foundation workflow is wired to apply migration 0022 and execute test 0022. Exact-head workflow results have not yet been returned; do not report this migration/test as passing until those results are inspected.


### CI checkpoint for the persistence branch — 2026-11-11

- PR synchronization run at the earlier branch checkpoint: Foundation run `42925437299` completed successfully. Its PostgreSQL job applied migrations through 0022 and ran SQL tests through 0022 successfully; Foundation integrity also passed. Oracle Arc API run `42925437321` passed.
- Web/Database run `42925437404`: PostgreSQL migration validation passed; type check, contract tests, server security unit tests and lint passed. At the last inspection, profile browser E2E was still running and production build had not started.
- **Important exact-head caveat:** these run IDs were created for the earlier branch checkpoint `d762585cb1ce6304f522c0690520e05ecae5e392`. The later refinement requiring active credentials to include their initial consumed TOTP step was committed as `2cb7d003dcf37795bd130e1de0f135e7b7bae101`, with its negative test in `7e07be7cac4685add57184d0a91657f463c7d1ea`; the latest documentation checkpoint is `29fa74c11a5310ab94b0a7f71fbad6b29a09cf0b`. No workflow runs were returned for that latest head at inspection. The final refinement is therefore **not yet CI-verified**, even though the preceding version of migration/test 0022 passed Foundation PostgreSQL CI.
- PR #15 is still open and draft; GitHub currently reports `mergeable: false`. Do not merge. Issue #16 remains open.


## Verified checkpoint — 2026-11-11 (PR #15 head c16e9e8)

- **Repository/branch:** `iamtheoracle/unibud`, `foundation/session-derived-operations-rbac-v2`.
- **PR #15:** OPEN, DRAFT, NOT MERGED. GitHub reported mergeable at this inspection; this is not approval to merge. No production migration or deployment occurred.
- **Exact inspected head:** `c16e9e8cff39dc6926c11bc6b8c3851d52ca5604`.
- **Exact-head CI: all three workflows PASS.**
  - Foundation checks — run `42925640430`: PostgreSQL 16 migration and RLS isolation job passed; Foundation integrity job passed.
  - Oracle Arc API — run `42925640442`: API tests passed.
  - UNIBUD Web and Database — run `42925640425`: PostgreSQL migration validation passed; type check, contract tests, server security unit tests, lint, profile browser E2E and production build all passed.
- **Operations actor provenance:** migration 0021 replaces the unsafe actor-UUID-taking permission/audit functions with functions deriving actor identity through the existing HMAC-verified transaction context. The PostgreSQL test covers valid signed context, removal of legacy APIs, forged account GUC denial, audit actor provenance, unattributed unauthenticated events and immediate revocation. This is CI-verified at the exact head; independent security review, secret-manager configuration review and production-like migration/recovery review remain outstanding. Issue #16 remains a release blocker until those reviews are complete.
- **Operations MFA cryptographic core:** implemented and unit-tested, but this is not active MFA.
- **Operations MFA persistence:** migration 0022 and its PostgreSQL test are now included in the passing exact-head Foundation workflow. The tables are protected from direct application-role access. This verifies storage structure and role boundaries only.
- **MFA is still NOT ENABLED.** No application RPCs/procedures, enrollment or confirmation endpoints, TOTP verification challenge, atomic replay-step consumption, one-time recovery redemption, session-bound step-up claim, password reauthentication, lockout/rate limiting, UI, audit lifecycle or end-to-end MFA journey is implemented.
- **Immediate next implementation:** inspect and document the existing session schema, revocation semantics, signed transaction context, and identity runtime. Then design the complete session-bound MFA state machine and trusted server-to-database assertion contract before writing SECURITY DEFINER procedures. Never accept caller-supplied account IDs, session IDs, TOTP time steps, or plain GUC values as proof. Add PostgreSQL negative tests before exposing any procedure.
- **Other Operations work remaining:** dual-control operator grant provisioning/revocation, no-self-grant controls, accessible grant-management UI, audit search/filter/export, security alert routing and tested incident runbooks; actual verification provider identity/read-only health contract remains unknown.
- **Release status:** PR #15 remains open/draft/unmerged. No production rollout is authorised.



## Latest checkpoint — 2026-11-11 (PR #15 head `49cdefc2f1cd93c4783daabface3070c6dcd62dc`)

- PR #15 remains **OPEN, DRAFT, NOT MERGED**. GitHub reports mergeable, but this is not merge approval. No production migration or deployment occurred.
- All three workflows passed at this exact head:
  - Oracle Arc API run `42925990785`.
  - Foundation checks run `42925990948`.
  - UNIBUD Web and Database run `42925990790`.
- This exact-head run verifies the documentation checkpoint and all implementation through migrations 0021 and 0022. Foundation PostgreSQL 16 migration/RLS and Foundation integrity jobs passed; the web/database workflow completed its PostgreSQL validation, type/contract/security tests, lint, profile browser E2E and production build.
- Session architecture inspection is complete for design purposes: opaque 256-bit session credentials with SHA-256 digests; server-side account/session validation; active-account, revocation, issue-time, idle and absolute-expiry checks; atomic rotation; single-session and account-wide revocation; separate LOGIN pools for `unibud_auth` and `unibud_app`; HMAC-verified transaction-local account context.
- **New design artifact:** [Operations MFA: session-bound step-up protocol](../security/OPERATIONS-MFA-SESSION-STEP-UP.md). It specifies a versioned HMAC-authenticated account+session context, exact-session step-up, enrollment, TOTP assertion consumption, replay prevention, one-time recovery, reauthentication, lockout, procedure boundaries, negative/concurrency tests, API/UI and release gates.
- **This is design only.** No session-bound context code, migration 0023, MFA procedures, routes, UI or step-up enforcement have been implemented. MFA remains disabled/not active.
- **Next implementation:** implement the versioned signed session context and database verification/accessor first, with migration and PostgreSQL negative tests proving forged session GUCs, wrong account/session pairings, expired/revoked sessions and missing session context all fail. Only after that foundation passes CI should MFA persistence procedures and routes be added.
- Issue #16 still requires independent security review, secret-manager configuration review and production-like migration/recovery review. PR #15 must remain draft/open until security and MFA acceptance gates are satisfied.



## Session-bound MFA implementation slice — 2026-11-11

- **Code added:** `apps/web/src/lib/server/database/session-context-core.ts` creates a versioned HMAC-signed claim binding account UUID, persisted session UUID, expiry and nonce. It creates the existing signed account claim as well, so existing account isolation and the new session claim can be independently verified.
- **Transaction helper added:** `withSignedSessionTransaction` binds both claims transaction-locally in one database transaction, rolls back on failure and releases the connection.
- **Tests added:** `apps/web/test/session-context.test.ts` covers account/session/expiry/nonce binding, malformed identifiers, weak keys, transaction-local GUC transport, commit and rollback behavior.
- **Critical limitation:** these GUCs remain untrusted transport until a PostgreSQL migration adds the matching HMAC verifier/accessor. No route uses the helper yet. No session-bound database authorization exists yet. Do not enable Operations MFA.
- **Current code head:** `a1a5d15e92828c043bfc81a6e7a396f8c322ac3e`. Exact-head CI results have not yet been returned. This slice is not yet CI-verified.
- **Next:** implement the matching private PostgreSQL session-context verifier/accessor and its SQL tests. Tests must prove forged session GUCs, account/session mismatches, missing/expired signatures and revoked/expired sessions fail closed. Then run exact-head CI before integrating this context into any Operations endpoint.
- PR #15 remains OPEN/DRAFT/NOT MERGED. No production migration or deployment. Issue #16 independent review and secret-manager/recovery review remain outstanding.



## Session-bound Operations security checkpoint — 2026-11-11

- Latest implementation slice: database migration `0023_operations_session_context_verifier.sql`, PostgreSQL test `0023_operations_session_context_verifier.test.sql`, signed-session server wrapper, and the verification-delivery Operations route now passes the exact persisted session ID returned by `SessionService.validate`.
- Database verifier checks a versioned HMAC over account ID + session ID + expiry + nonce, independently validates the signed account claim, and checks that the exact session still belongs to the account, remains active and unrevoked, and has not passed idle or absolute expiry.
- Operations permission checks now require both verified account and verified live session. Audit rows now carry the verified session reference; unauthenticated events remain explicitly unattributed. The private session verifier is executable by the NOLOGIN Operations owner only, not by `unibud_app`.
- Existing Operations PostgreSQL tests were updated to establish signed session context; new negative coverage includes a forged session GUC, revoked session, account-only context, direct verifier/key access denial, and unauthenticated audit provenance.
- Current verification status: latest changes have been committed to the PR branch; exact-head CI for the final checkpoint has not yet been confirmed. Do not call this slice verified until all workflows and PostgreSQL tests pass at the same head.
- Important limitation: session context is now implemented and wired into the existing metadata diagnostic route, but MFA is still not active. No MFA enrollment/confirmation, TOTP challenge, replay-safe step-up, recovery-code redemption, step-up session claim, route-level MFA gate, or operator UI has been implemented.
- Production secret-manager configuration, independent review of the role/ownership boundary, and production-like migration/recovery review remain outstanding.


## Independent signing-key separation refinement — 2026-11-11

- Account context and session context now use distinct server-side keys: UNIBUD_DB_CONTEXT_HMAC_KEY and UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY.
- Migration 0023 creates a dedicated private session_context_signing_keys verifier table. Only the NOLOGIN Operations owner can read it; unibud_app cannot execute the verifier or read either key table.
- The server helper refuses to create a session claim unless both independent keys are present and at least 32 random bytes (hex encoded).
- PostgreSQL test fixtures use different account/session keys and verify mismatched account/session pairs and expired signed claims are rejected.
- This refinement supersedes the earlier same-key session-context implementation. Exact-head CI for this key-separated version is pending; do not treat the previous checkpoint's green results as proof for this new head.


## Operations MFA exact-session step-up implementation — 2026-11-11

- Added `operations-mfa-assertions.ts`: versioned HMAC assertions bind account, exact session, purpose, issue/expiry, nonce and matched TOTP step. A separate server secret is required; UUIDs are canonicalized for PostgreSQL.
- Added unit tests for assertion creation, cross-account/session/purpose denial, expiry/future issue time, tampering, wrong key, invalid input and environment secret requirements.
- Added migration 0024: protected assertion-signing verifier key table, one-time assertion nonce ledger and exact-session step-up table.
- Added `unibud_operator_mfa_consume_step_up`: PostgreSQL verifies the server signature, checks the current signed/live session, consumes nonce and advances the TOTP counter atomically, then creates a five-minute exact-session step-up.
- Updated Operations permission checks to require an active, unlocked MFA credential and unexpired step-up for the exact session. Until enrollment/challenge routes are completed, Operations permissions deliberately fail closed rather than falling back to session-only access.
- Added PostgreSQL 16 integration test for pre-step-up denial, valid assertion consumption, replay/TOTP-step rejection, app-role isolation and no step-up inheritance by another session.
- Added migration 0024 and its test to Foundation CI.
- **Not yet proven:** exact-head CI for this migration/test is pending. PostgreSQL concurrency testing, enrollment, challenge, reauthentication, recovery, lockout routes/UI, notifications, operational key provisioning/rotation and independent review remain outstanding. MFA is not operational end-to-end.


## MFA step-up audit and concurrency hardening — 2026-11-11

- Migration 0024 now replaces the Operations audit writer so an app caller cannot label an event "allowed" unless the database permission function confirms active grant, active/unlocked MFA and exact-session step-up. An attempted false "allowed" event is recorded as denied.
- PostgreSQL test 0024 covers forged audit outcomes before and after MFA step-up.
- Added `scripts/test-operations-mfa-concurrency.sh` and wired it into Foundation CI. It opens two independent PostgreSQL connections concurrently with the same signed assertion and requires exactly one success and one rejection.
- Legacy migrations 0020/0021/0023 tests were updated to assert that signed session context alone does not bypass the new MFA gate.
- Exact-head CI for this audit/concurrency refinement is pending. The prior PostgreSQL pass did not include this final audit/concurrency addition.


## Password-reauthenticated MFA enrollment start — 2026-11-11

- Extended the versioned MFA assertion protocol with a distinct password_reauth purpose and a null TOTP-step sentinel; it remains bound to the validated account and exact session.
- Added migration 0025: PostgreSQL consumes the signed one-time password-reauth assertion, requires an active Operations grant, stores only a structurally validated encrypted TOTP envelope as a ten-minute pending enrollment, and refuses replacement of an active credential or an unexpired pending enrollment.
- Added a narrow encrypted-secret accessor that requires the verified current account/session and active Operations grant; it returns ciphertext only for server-side decryption.
- Added createOperationsMfaCryptographyFromEnvironment using separate seed-encryption and recovery-code HMAC keys.
- Added POST /api/internal/operations/mfa/enrollment/start: same-origin request, HTTP-only session validation, current-account password reauthentication using the existing auth service/rate limiter, server-side seed generation/encryption, signed reauthentication assertion, PostgreSQL pending enrollment, and no-store provisioning URI response.
- Added unit, route-contract and PostgreSQL tests for forged/expired/replayed reauthentication, non-operator denial, protected secret reads and pending enrollment persistence.
- Added migration 0025 and its PostgreSQL test to Foundation CI. Exact-head CI for this route/migration slice is pending.
- Still incomplete: enrollment confirmation and activation, recovery-code digest persistence/display, TOTP challenge/step-up route integration, failure counters/lockout, recovery/redemption, disable/reset, UI/QR, notifications, rate limiting beyond the existing password verifier limiter, operational key provisioning/rotation, concurrency proof for enrollment nonce, E2E and independent review. A pending enrollment is not active MFA.


## Password-reauthenticated enrollment CI checkpoint — 2026-11-11

- At code checkpoint 17f1ee53a5dbcb5f61ac0c01d37860cbda035ea4, Foundation PostgreSQL 16 migrations/tests including migration 0025 and concurrent step-up replay test passed; Oracle Arc API tests passed.
- Web PostgreSQL migration validation passed. Web typecheck, contract tests, server security tests and lint passed. Browser E2E and production build remained in progress at the time of this tracker update.
- CI workflow initially invoked migration 0025 twice; the duplicate migration and test invocations were removed before this checkpoint. The corrected workflow applies each migration/test once.
- This does not activate MFA. Enrollment confirmation, TOTP activation, recovery-code storage/display, challenge route, lockout, recovery and production secret provisioning remain outstanding.


## MFA enrollment confirmation and activation implementation — 2026-11-11

- Added migration 0026 with a narrow SECURITY DEFINER confirmation procedure. PostgreSQL verifies the server-signed `enrollment_confirm` assertion against the current HMAC-verified account and exact persisted session, checks the pending/unexpired/unlocked credential and operator grant, then atomically activates the credential, records the initial accepted TOTP step, consumes the assertion nonce and stores 8–16 unique 32-byte recovery-code digests.
- Added a protected failed-attempt procedure. It increments attempts atomically and applies a 15-minute lockout at ten failures. The encrypted-secret accessor now denies both pending and active credentials during lockout. A database trigger prevents replacement enrollment from clearing an active lockout.
- Added `POST /api/internal/operations/mfa/enrollment/confirm`: same-origin + validated HTTP-only session, server-side decryption, TOTP verification, signed exact-session confirmation assertion, recovery digest generation and one-time no-store recovery-code response only after database activation commits. No plaintext recovery code is persisted.
- Added route contract tests and PostgreSQL test 0026 for valid activation, forged/replayed assertion denial, duplicate digest rejection, app-role storage isolation and lockout. Foundation CI now applies migration 0026 and runs its PostgreSQL test.
- **Verification status:** implementation commits are on the PR branch; exact-head CI for the latest commit must be checked before calling this slice verified. This route has not been proven through browser E2E. Enrollment confirmation does not itself create a session step-up; the separate TOTP challenge route is still required before Operations permissions can pass.
- **Still outstanding:** challenge/step-up route, recovery redemption/regeneration, disable/reset, MFA status and UI/QR/recovery acknowledgement, notification/audit lifecycle, concurrent enrollment/recovery tests, session lifecycle invalidation, secret-manager provisioning/rotation drills, independent review and production-like migration/recovery review. MFA is not operational end-to-end.


## Exact-session MFA TOTP challenge and step-up route — 2026-11-11

- Added `POST /api/internal/operations/mfa/challenge`. It validates same-origin and the HTTP-only session through `SessionService`, derives signed account+session context only from that validation, retrieves the encrypted secret through the protected accessor, and verifies TOTP on the server.
- Invalid TOTP attempts use the database failure counter and 15-minute lockout. A valid code produces a purpose-bound signed `step_up` assertion for the validated account, exact persisted session and matched TOTP step. PostgreSQL consumes it through migration 0024, atomically advances the monotonic TOTP counter and creates the five-minute exact-session step-up.
- Added route contract tests for same-origin/session binding, server-side TOTP verification, single-use assertion consumption and database enforcement. These are included in the existing web test glob.
- **Verification:** exact-head CI for the new challenge route/test is pending. The prior exact-head Foundation migration 0026 test passed; that result does not prove this newer route commit. The route is not yet browser-E2E verified.
- **Still outstanding:** accessible enrollment/challenge UI and QR, one-time recovery display acknowledgement, recovery-code redemption/regeneration, disable/reset, MFA status, MFA-specific audit and notifications, session lifecycle invalidation, concurrent enrollment/recovery tests, key provisioning/rotation drills, independent review and production-like migration/recovery review. MFA remains not operational end-to-end.


## One-time MFA recovery and protected lifecycle audit — 2026-11-11

- Added migration 0027: recovery redemption verifies a purpose-bound HMAC assertion against the current account and exact live session, atomically consumes one unused account-bound recovery digest, revokes every session step-up, removes the old authenticator and its entire recovery-code set, and records the recovery event. Recovery never grants an Operations step-up; the operator must reauthenticate with their password and enroll a new authenticator.
- Added a protected MFA event table and database trigger. Enrollment start/confirmation, failed/successful challenges, lockout and credential removal are recorded with verified actor/session context where available. Events contain no codes, seeds, passwords, tokens or request bodies. Application roles cannot read or mutate the audit table; a trigger rejects update/delete.
- Extended signed MFA assertions so recovery has a distinct purpose and no TOTP-step claim.
- Added `POST /api/internal/operations/mfa/recovery/redeem`: same-origin, validated session, server-side account-bound recovery digest, signed one-time assertion, no-store response and explicit next step requiring password-reauthenticated enrollment.
- Added route-contract tests and PostgreSQL test 0027 for valid/forged/replayed recovery, removal of all old step-ups and credentials, recovery audit and app-role isolation. Foundation CI now applies migration 0027 and runs its test.
- **Verification:** exact-head CI for the newest recovery/audit commit is pending. The previous exact-head run had passed typecheck/contracts/security tests/lint and Oracle Arc API tests, while browser E2E/build were still running; those results do not verify migration 0027.
- **Still outstanding:** recovery-code regeneration, disable/reset, MFA status, accessible UI/QR and one-time recovery acknowledgement, dedicated notification delivery, session lifecycle invalidation, concurrent recovery redemption tests, secret-manager provisioning/rotation and disaster-recovery drills, independent security review and production-like migration/recovery review. MFA is not production-ready or end-to-end verified.


- Added `scripts/test-operations-mfa-recovery-concurrency.sh` and wired it after the existing step-up replay test in Foundation CI. It races two independent PostgreSQL sessions against the same recovery digest and signed assertion and requires exactly one redemption. The first CI attempt exposed test-fixture key collisions (multiple active verifier keys); the fixture now explicitly rotates the active test keys before creating its isolated recovery-race keys. The corrected exact-head run is pending.


## Recovery assertion correction and exact-head verification checkpoint — 2026-11-11

- The first recovery assertion unit-test run found that the constructor accepted a step-free recovery assertion but the verifier still required a numeric TOTP step. Corrected the verifier so both `password_reauth` and `recovery` purposes require a null TOTP step; the recovery assertion remains distinct by purpose and signature.
- At exact code head `d94be2d971848f009f189a0117fcccbbe80acdec`: Foundation checks passed, including all PostgreSQL 16 migrations/tests through 0027 and both concurrent step-up/recovery redemption scripts. Oracle Arc API tests passed. Web typecheck, contract tests, server-security tests and lint passed. Browser E2E and production build were still running at the last check.
- The earlier recovery concurrency failure was a test-fixture collision between active signing-key rows, not a recovery-procedure failure. The fixture now deactivates prior test keys before creating isolated keys; the corrected Foundation run passed the concurrency test.
- Do not mark the complete web workflow green until browser E2E and production build complete on the latest exact head. The recovery route has no browser UI/E2E yet.


## MFA status, enrollment resume and first security interface — 2026-11-11

- Added migration 0028 and GET /api/internal/operations/mfa/status. The database returns only the current verified operator account's credential state, lockout and exact-session step-up expiry; a second session does not inherit assurance, and non-operators receive no Operations state. PostgreSQL coverage proves these boundaries.
- Added migration 0029 and POST /api/internal/operations/mfa/enrollment/resume. A pending seed can be retrieved only after the current session is revalidated and the account password is reauthenticated; PostgreSQL verifies and consumes a one-time password_reauth assertion and returns ciphertext only for a live pending credential. Active credentials cannot be read through this pending-only accessor.
- Added the authenticated /operations/security/mfa page and client interface for status, password-reauthenticated setup/resume, confirmation, one-time recovery-code acknowledgement, TOTP step-up and recovery redemption. Provisioning URI and recovery codes are kept in component memory only; no browser storage is used. The current UI explicitly labels QR display as not yet available and provides manual setup as a temporary fallback.
- Added route/UI contract tests and wired migrations 0028–0029 and their PostgreSQL tests into Foundation CI.
- **Verification:** migration 0028 and its SQL test passed in the Foundation workflow; Oracle Arc API passed; web typecheck, contract tests, server-security tests and lint passed before the 0029/UI additions. The 0029 and UI exact-head workflows are pending. Browser E2E for MFA is not implemented; existing browser E2E covers profiles only.
- **Still outstanding:** local QR generation, browser E2E for MFA end-to-end, recovery-code regeneration, controlled disable/reset with dual control, audit notification delivery, session lifecycle invalidation, key provisioning/rotation and disaster-recovery drills, independent security review, and production-like migration/recovery review. MFA is not production-ready.


## MFA recovery-code regeneration — 2026-11-11

- Added migration 0030 and a regeneration procedure requiring both a fresh password_reauth assertion for the current account/session and an unexpired MFA step-up for that exact session. PostgreSQL atomically consumes the assertion nonce, replaces the complete recovery digest set and records a recovery_codes_regenerated event. A stale or different-session step-up cannot authorize regeneration.
- Added POST /api/internal/operations/mfa/recovery/regenerate. It validates the same-origin request and current session, reauthenticates the account password, generates a new recovery set server-side, and returns plaintext codes once only after database commit.
- Added the regeneration flow to the MFA security page. It is shown only when the status reports an active exact-session step-up, and the replacement codes use the same explicit acknowledgement screen. The server remains authoritative if the five-minute step-up expires while the page is open.
- Added PostgreSQL tests for forged/replayed assertions, replacement of old digests, audit, application-role isolation and denial without current-session step-up; added route/UI contract tests. Foundation CI applies migration 0030 and its test.
- **Verification:** exact-head CI for the 0030 route, migration, UI and tests is pending. The prior status migration/test passed; that does not prove this newer checkpoint.
- **Still outstanding:** controlled MFA disable/reset with dual control, QR generation, full browser E2E for enrollment/challenge/recovery/regeneration, notification delivery, session lifecycle invalidation, key provisioning/rotation and disaster-recovery drills, independent security review and production-like migration/recovery review.


## Verified checkpoint — 2026-11-11, exact head bee8603a832fe09307384e4a8faa2820ed9ec394

- All three GitHub workflows completed successfully on this exact head: Foundation checks, Oracle Arc API, and UNIBUD Web and Database.
- Foundation PostgreSQL 16 migration/RLS job passed all migrations/tests through 0030, including the MFA enrollment, challenge, recovery, status, pending-resume and recovery-regeneration SQL tests, the existing TOTP assertion replay race, and the new concurrent recovery-redemption race.
- Web workflow passed PostgreSQL migration validation, TypeScript typecheck, contract tests, server-security unit tests, lint, existing profile browser E2E, and production build.
- Oracle Arc API tests passed. This does not mean local model inference or all Oracle Arc tools are deployed/operational.
- **Scope of browser proof:** the browser E2E in this workflow is the existing profile E2E; it does not exercise the new MFA page or the MFA flows end-to-end.
- **Session lifecycle note:** step-up is bound to the verified current persisted session. The database session verifier denies revoked, expired, suspended and rotated-out sessions, and a new session cannot inherit an old step-up. Cleanup/pruning of expired step-up and assertion records remains outstanding.
- PR #15 remains OPEN and DRAFT, not merged or deployed. Issue #16's independent security review and production-like migration/recovery review remain release blockers.


### Operations MFA local QR setup — 2026-11-11

- Added the `qrcode` browser library and local QR generation to the authenticated MFA setup interface. The QR is rendered from the in-memory provisioning URI in the browser; no third-party QR endpoint receives the authenticator seed. The manual setup key remains available as an accessible fallback if QR generation fails or the operator cannot scan.
- Added responsive QR styling, UI assertions and a real Playwright MFA workflow assertion that the QR image is rendered during enrollment.
- The provisioning URI and QR data URL remain in component memory only; no localStorage, sessionStorage or IndexedDB persistence was added.
- **Exact-head verification: PASS** at `9cf961e4658146b3bc24fe50a238aa9f7f144178`: Foundation run `42966207133`, Oracle Arc API run `42966207125`, and UNIBUD Web and Database run `42966207290`. Web typecheck, contract tests, server security tests, lint, PostgreSQL migration validation, profile and MFA browser E2E, and production build all completed successfully.
- **MFA remains not production-ready:** controlled disable/reset with dual approval, notifications, session/account lifecycle invalidation evidence, key provisioning/rotation/recovery, cleanup/retention, production-like database review and independent security review remain outstanding.


### Exact-head QR verification — 2026-11-11

The local authenticator QR implementation is verified at code head `9cf961e4658146b3bc24fe50a238aa9f7f144178`. All three GitHub workflows completed successfully: Foundation `42966207133`, Oracle Arc API `42966207125`, and UNIBUD Web and Database `42966207290`. The Web/Database run passed dependency installation, typecheck, contract tests, server security tests, lint, profile + MFA browser E2E and production build. Foundation passed migrations through 0030, RLS/isolation checks and both MFA concurrency scripts.

The code is tested in CI, not deployed. PR #15 remains draft/open/unmerged. MFA is still not production-enabled because operational key provisioning/rotation/recovery, disable/reset dual control, lifecycle notifications/cleanup, independent security review and production-like migration/rollback approval remain.


### Operations MFA dual-control disable/reset — contract established, code not yet implemented

- Added `docs/security/OPERATIONS-MFA-DISABLE-RESET-DUAL-CONTROL.md` in commit `16dd3596534f9fd77a9501394cd7ab8e2c7b907a`.
- The contract requires distinct requester and approver identities, fresh password reauthentication and exact-session MFA step-up for both, verified database-derived actor/session identity, immutable request details, expiry, atomic single-use approval, row locking, append-only audit, and complete invalidation of target step-ups and recovery codes.
- Self-approval is prohibited even across multiple sessions; the target account cannot approve its own reset. The UI is not authoritative. No break-glass bypass is introduced.
- **Status: contract/documentation only.** No migration, database procedure, route, UI, notification, or runtime behavior has been implemented or tested for dual-control disable/reset. Do not describe it as available.
- Next code slice: inspect current migrations 0022–0030 and assertion-purpose handling; add the protected request schema and narrow SECURITY DEFINER procedures; prove requester/approver distinctness and concurrency behavior on PostgreSQL before adding routes or UI.
- PR #15 remains draft/open/unmerged. Issue #16 remains an independent security blocker. No production migration or deployment is authorised.


### Operations MFA dual-control — database foundation added, verification pending

- Added forward-only migration `database/migrations/0031_operations_mfa_dual_control.sql`.
- Added protected MFA security-request storage with a 30-minute expiry, one pending request per target, requester and exact persisted session attribution, action/reason/policy fields, and separate approver identity/session fields.
- Added a database-only password reauthentication assertion consumer. It derives account/session from the signed transaction context, verifies the assertion signature and time window, and consumes the nonce once.
- Added request and decision procedures. Both require the corresponding new scoped grant, exact-session MFA step-up and fresh password reauthentication. PostgreSQL denies requester self-approval and target self-approval, rechecks the requester's live session/grant/MFA state, and row-locks the request before deciding.
- Approval atomically marks the request complete, removes all target step-ups, recovery digests and authenticator credential, and appends audit events. Rejection is terminal and audited. Application roles have no direct request-table access.
- Added PostgreSQL test `database/tests/0031_operations_mfa_dual_control.test.sql` for request creation, requester self-approval denial, target self-approval denial, distinct-operator approval, replay/second-decision denial, target credential/recovery/step-up invalidation, audit and app-role isolation.
- Wired migration 0031 and its test into Foundation CI.
- **Status: database implementation committed; exact-head CI pending.** No API route, request/approval UI, cancellation/expiry worker, notification delivery, concurrency race script, or independent security review is included yet. Do not call the feature available or production-ready.
- New grants require trusted DBA provisioning of `operations.mfa.security.request` and `operations.mfa.security.approve`; no grant is provisioned by this migration.


### Operations MFA request lifecycle — cancellation and expiry implementation

- Added forward-only migration `0032_operations_mfa_request_lifecycle.sql`.
- Request cancellation is restricted to the original requester, on the same verified persisted session, with the current Operations MFA step-up and request permission. It locks the request row, only transitions a still-pending, unexpired request, and appends an actor/session-attributed audit event.
- Added a bounded, idempotent expiry sweep using `FOR UPDATE SKIP LOCKED`, with a maximum batch size of 1,000. It only expires due pending requests and writes explicit system-attributed audit events (NULL actor/session); it is private to the NOLOGIN Operations owner and cannot be invoked by the application role.
- Added PostgreSQL test `0032_operations_mfa_request_lifecycle.test.sql` for requester cancellation, expired-request cancellation denial, app-role denial of the expiry worker, owner-only expiry, and audit attribution.
- Wired migration 0032 and its test into Foundation CI.
- **Status: implementation committed; exact-head CI pending.** No scheduler/worker is configured, so expiry processing does not run automatically yet. No API routes, approver list/read API, UI, notifications or race stress tests exist yet. No production operator grants/secrets or deployment.


### Operations MFA dual-control API action routes — initial slice

- Added same-origin, no-store API route for creating disable/reset requests. It validates the HTTP-only session, verifies the account password without rotating the session, creates a purpose-bound short-lived password-reauth assertion, and invokes the protected PostgreSQL procedure through a signed session transaction.
- Added approve/reject decision route with the same fresh-password and signed-session pattern. The database procedure remains authoritative for scoped MFA step-up, distinct requester/approver, target restrictions, request expiry and atomic state transition.
- Added requester cancellation route. It validates the HTTP-only session and delegates original requester/exact-session/MFA/pending-state checks to the database procedure.
- Added route-boundary tests asserting same-origin, session-derived identity, no caller-supplied actor/role fields and no-store responses.
- **Status: routes and static boundary tests committed; exact-head typecheck/lint/unit tests/E2E pending.** There is not yet an approver pending-request list/read endpoint or Operations UI. No per-route rate-limit policy beyond the underlying authentication verification controls has been added or independently verified.


### Operations MFA request read API — implementation slice

- Migration `0033_operations_mfa_request_read_api.sql` adds a SECURITY DEFINER read model for a bounded pending-request page or a single request detail.
- The database requires a validated account and exact session plus current `operations.mfa.security.approve` permission (which itself requires live MFA step-up); direct application-role table access remains revoked.
- The response deliberately omits requester/approver session IDs and all credential/assertion material. Pagination uses a stable created-at/request-ID cursor; page size is capped at 100.
- Added authenticated GET `/api/internal/operations/mfa/requests` for list/detail, using the HTTP-only session, server-derived signed database context, bounded query validation and no-store responses. A supplied foreign Origin is rejected; origin-less safe GETs are allowed.
- Added PostgreSQL permission/data-minimisation tests and static API boundary tests. Migration 0033 and its test are wired into Foundation CI.
- **Exact-head verification pending.** No Operations review UI, dedicated API rate limit, live PostgreSQL API integration tests or browser E2E have been completed.


### Operations MFA dual-control request console — implementation checkpoint (2026-11-11)

- Migration 0033 adds a permission-gated, bounded pending-request read model with a minimal projection that excludes persisted session identifiers and credentials.
- The authenticated GET endpoint supports bounded pagination and request detail; it derives viewer identity from the validated HTTP-only session and uses a signed database session transaction.
- Migration 0034 extends read visibility: approvers with current MFA step-up can inspect the pending queue; request-permission holders can inspect only their own pending requests. This is required so requesters can see and cancel their own pending requests without gaining access to other operators' requests.
- Added Operations UI for submitting reset/disable requests, viewing the permitted queue, reviewing requests, entering fresh approver credentials, approving/rejecting, and cancelling one's own request. The UI distinguishes requester actions from independent approver actions using the server-returned viewer account ID; PostgreSQL remains authoritative and denies self-approval.
- Added database tests for requester-only list/detail visibility and static API/UI boundary tests.
- **Status: implementation committed; exact-head CI pending.** Dedicated API rate-limit policy, route integration tests, complete browser E2E, verified notifications, scheduled expiry worker, grant management, audit search/export, operational secrets and independent review remain outstanding. No production enablement.


### Operations MFA dual-control request console — latest checkpoint (2026-11-11)

- The current branch includes migrations 0033 and 0034, authenticated GET list/detail, bounded cursor pagination, requester-only visibility for request-permission holders, and the Operations request/review UI. These are present in code; do not repeat or recreate them.
- Exact-head run 42974033173 Foundation checks passed; 42974033157 Oracle Arc API passed; PostgreSQL migration validation passed in Web/Database run 42974033180.
- Web/Database run 42974033180 failed in Playwright MFA E2E because getByLabel("Current password") matched both the enrollment password and the dual-control request form. Profile browser workflows passed. Typecheck, contract tests, server security tests and lint passed; production build was skipped after the E2E failure.
- Corrected the two enrollment password labels to Authenticator setup password and updated the MFA E2E selectors to target that distinct label. UI commit 21b6a549609d923f39c69dd05010f494d615a78d; E2E selector commit 2e304b2c2d09b4ee98630aee48300e10c49f0bf3.
- Status: fix committed; exact-head rerun pending. Do not mark the browser workflow passed until the rerun completes. The dual-control request console remains not production-enabled.


- Follow-up: the first rerun exposed a second duplicate password locator in the recovery-maintenance panel. Scoped that third selector to the Regenerate recovery codes section in commit 1baac0491106deb9b66cc4d66e999cd5ec684044. Exact-head workflows for this correction are running: Foundation 42975503504, Oracle Arc API 42975503393, Web/Database 42975503421. PostgreSQL validation has passed in the Web/Database run; typecheck, contract tests, server security tests and lint have passed; Playwright is still running. Do not mark the browser suite or build complete yet.


- Latest E2E rerun at commit 1baac0491106deb9b66cc4d66e999cd5ec684044 confirms the duplicate password-label issue is resolved; it now reaches the end of the MFA browser flow and fails at the old `calls.length === 6` assertion because the request-console UI also performs read-only GET queue refreshes (observed total 10 calls). This is a test-accounting defect, not evidence of a server/API failure. The assertion must count the six POST mutation calls separately from GET list refreshes; do not weaken it to a generic minimum. The exact-head Web/Database workflow therefore remains failed and the production build is skipped until corrected. Foundation and Oracle Arc API passed for the code fix; PostgreSQL migration validation passed.


### Operations MFA request queue and browser verification

- Added bounded, cursor-paginated request list and detail read model in migrations 0033/0034. Current-MFA approvers can inspect the pending queue; request-permission holders can inspect only their own requests. The projection omits persisted session identifiers, credentials and recovery material.
- Added authenticated no-store GET route with server-derived session context, bounded page size and cursor validation.
- Added the Operations dual-control panel for request submission, separate approval/rejection and requester-only cancellation, backed by authenticated API data.
- Added a Playwright dual-control workflow covering queue review, independent approval, own-request cancellation and request creation; wired it into Web CI.
- **Verification caveat:** latest observed Web E2E run failed in the older MFA lifecycle script because it asserted exactly six intercepted requests while the new request panel also performs list GETs. Profile browser workflows passed. The test harness must distinguish GET reads from POST actions and rerun on exact head. No claim of passing full Web CI.


### Operations MFA API throttling — implementation slice (2026-11-11)

- Added migration `0035_operations_mfa_api_rate_limits.sql` with an Operations-owner-owned, application-inaccessible rate-limit table and SECURITY DEFINER consumer.
- Limits are fixed in PostgreSQL, not supplied by callers: request creation 5 per 15 minutes; approve/reject 10 per 15 minutes; cancellation 10 per 15 minutes; list/detail reads 60 per minute.
- Each action maps to its required scoped permission and requires the validated current account/session plus live MFA step-up. Counters are atomic per account and action.
- Added `operations-mfa-rate-limit.ts` server adapter and wired all four API action classes before expensive password verification or read execution.
- Added PostgreSQL test 0035 for action-specific permission boundaries, fixed-window throttling and denial of direct application-role table access. Added route-boundary assertions and wired migration/test into Foundation CI.
- Corrected the dual-control Playwright selector to scope the password input to the request form (commit `fa69fd413e3a852dc30396f92ed5df44f44f0486`).
- **Status: code committed; exact-head CI pending.** No production deployment. Per-account throttling is an additional control, not a substitute for edge/IP abuse controls, alerting or independent review.


## UNIBUD / Oracle Arc master blueprint

- Added `docs/product/UNIBUD-ORACLE-ARC-MASTER-PLAN.md` at commit `bda20dcc0468207df869e6af867a16637326279d`.
- This consolidates the product purpose, module boundaries, identity/profile model, platform architecture, Oracle / SPARK / ORBITS responsibilities, AI agent governance, financial and safety boundaries, history-preservation rules, delivery roadmap and production acceptance gates.
- It is a scope and architecture reference, not a statement that the entire product is implemented. Future product decisions must be appended to the decision history with rationale and supersession links; never silently overwrite an approved requirement.
- **Next Operations action:** correct the Playwright test accounting in `scripts/e2e/operations-mfa.mjs`. The latest recorded Web/Database run observed ten intercepted requests after the request console added queue reads, while the legacy assertion expected six. The test must assert the six expected MFA lifecycle mutation endpoints exactly once and account for read-only queue GETs separately. The attempted test-file update has not been committed; do not claim this fix is implemented.


- Added `docs/product/DECISION-HISTORY.md` at commit `0b81e7391c6ad55fd7658f0cfd522577912cd2f9`. It records the reconstructed approved product decisions from the 2026-11-08 to 2026-11-09 project discussions, with explicit date ranges where exact timestamps are unavailable, and defines an append-only process for future decisions. This is a reconstructed decision register, not a substitute for original chat transcripts or operational audit logs.


### Operations dual-control browser test accounting correction (2026-11-11)

- Latest observed Web/Database run `42978530254` passed PostgreSQL migration validation, typecheck, contract tests, server security tests and lint, then failed the dual-control Playwright script at the assertion expecting two request-creation POSTs when the scenario intentionally creates one. The queue refreshes are GETs and are not part of the mutation count.
- Corrected `scripts/e2e/operations-mfa-dual-control.mjs` to assert exactly one request-creation mutation, while retaining the exact one-approval and one-cancellation assertions.
- Fix commit: `31ac46fe1a99da74173cedff3cc0646ed113ff31`.
- **Exact-head CI pending.** The prior browser run failed and its production build was skipped; do not mark this workflow passed until the rerun completes.


### Operations MFA ephemeral-state maintenance (2026-11-11)

- Added migration `0036_operations_mfa_ephemeral_maintenance.sql` at `b193bd4b36cec9f5c2ca22bb3652d62d18c3260f`.
- Added PostgreSQL test `0036_operations_mfa_ephemeral_maintenance.test.sql` at `1f20ea9d60afbe6592dd7ae7dc7121deab4681d5`.
- Added both to Foundation PostgreSQL 16 migration/RLS CI at `1075d2d7a63aa4979effe9f871b331ada9b4feb9`.
- Worker performs bounded, idempotent cleanup: expires pending dual-control requests through the existing expiry procedure; removes expired exact-session step-up rows; retains consumed assertion nonces for 24 hours after expiry before deleting; removes rate-limit buckets untouched for 24 hours. It uses row locking with `SKIP LOCKED`, caps batches at 1,000 and is executable only by the NOLOGIN Operations owner.
- Tests cover app-role denial, owner execution, stale-versus-live retention, nonce/step-up foreign-key ordering and batch-size bounds.
- **Important:** this adds a maintenance worker, not a scheduler. Automatic recurring execution remains NOT IMPLEMENTED until a trusted scheduler/worker identity, credentials, cadence, monitoring and failure alerting are configured and tested.
- Exact-head CI for the migration/test is pending. No production scheduler or production secrets are configured.


### Operations dual-control concurrency and expiry hardening — 2026-11-11

- Added migration `0037_operations_mfa_dual_control_concurrency.sql` to revalidate request expiry, approver account/session/grant/MFA step-up and requester account/session/grant/MFA state after acquiring the security-request row lock.
- Terminal approval, rejection and cancellation updates now include a wall-clock expiry predicate. This avoids relying on `statement_timestamp()`, which is fixed before a potentially long row-lock wait.
- Added `scripts/test-operations-mfa-dual-control-concurrency.sh`. It uses independent PostgreSQL connections to race approve versus reject, approve versus requester cancellation, and approval versus expiry while a separate connection holds the request row lock. It checks exactly one terminal state and one corresponding audit event.
- Wired migration 0037 and the concurrency harness into Foundation PostgreSQL 16 CI.
- **Status at commit pending:** implementation and CI validation are pending. No production scheduler, secrets or Operations enablement are configured. Issue #16's non-forgeable actor remediation is present in migration 0021; independent security review remains open.


### Verified Operations dual-control concurrency checkpoint — 2026-11-11

This addendum supersedes the earlier note that the concurrency implementation and validation were pending.

- **Implemented:** migration `0037_operations_mfa_dual_control_concurrency.sql` revalidates request expiry and the approver's live exact-session grant/MFA step-up after acquiring the request row lock. It revalidates the requester's persisted account/session/grant/authenticator state using wall-clock time. Approve, reject and cancel terminal updates include a wall-clock expiry predicate. Requester/target self-approval denials remain enforced.
- **Implemented:** `scripts/test-operations-mfa-dual-control-concurrency.sh` uses independent PostgreSQL connections to race approve/reject, approve/cancel, and approval against expiry while a separate transaction holds the request lock. It verifies one terminal winner and the corresponding audit event.
- **CI wiring:** Foundation workflow applies migration 0037 and runs the new concurrency harness. The existing assertion-replay concurrency script now deactivates prior test signing keys before seeding its own, preventing cross-suite active-key collisions.
- **Verified at exact PR #15 head `308bfe4a92c92d5b97844326f1bcb6432bb1e8f3`:** Foundation checks run `43013208219` PASSED, including PostgreSQL 16 migrations/RLS, the new dual-control race harness, MFA assertion replay concurrency and recovery redemption concurrency. Oracle Arc API run `43013208224` PASSED. UNIBUD Web and Database run `43013208441` was still IN PROGRESS at the time of this update; its E2E/build result is not yet claimed.
- **Still outstanding:** exact-head Web/Database completion; independent security review and Issue #16 disposition; trusted recurring scheduler for migration 0036 maintenance; verified security notifications; secrets management/rotation; retention and session lifecycle; grant-management UI; audit search/export; alerts and operational runbooks.
- **Release boundary:** PR #15 remains draft/open/unmerged. No production deployment, production grants, scheduler or Operations enablement is claimed.


### CI completion addendum — 2026-11-11

The complete code-change validation checkpoint at commit `308bfe4a92c92d5b97844326f1bcb6432bb1e8f3` is now complete:

- Foundation checks `43013208219`: **PASSED**. PostgreSQL 16 migrations and RLS tests, dual-control approve/reject race, approve/cancel race, approval/expiry lock-wait race, existing MFA assertion replay concurrency and recovery-code redemption concurrency all passed.
- Oracle Arc API `43013208224`: **PASSED**.
- UNIBUD Web and Database `43013208441`: **PASSED**. PostgreSQL migration validation, TypeScript typecheck, contract tests, server security tests, lint, profile browser E2E and production build all passed.

The branch subsequently advanced through documentation-only commits to `c0d65a273a025376bd144e184018a8af40e1aa20`. Fresh CI for that documentation-only head was queued/in progress when this addendum was prepared. The three successful runs above validate the code-change head; they do not establish deployment or production verification.


### Operations MFA maintenance worker — implementation checkpoint (2026-11-11)

- Added migration 0038 with a dedicated `unibud_ops_scheduler` role. It is `NOLOGIN`, non-superuser, non-owner and `NOBYPASSRLS`; it has schema usage and EXECUTE on only the bounded migration-0036 maintenance entry point. It has no direct access to protected MFA tables and cannot invoke the lower-level request-expiry procedure.
- Added PostgreSQL test 0038 for role attributes, exact function privilege, denial of application-role execution, denial of direct protected-table access and successful invocation through the scheduler role.
- Added `scripts/run-operations-mfa-maintenance.sh`. It requires a secret-manager-supplied `DATABASE_URL`, validates batch size (default 200, maximum 1,000), explicitly sets the scheduler role, applies bounded SQL timeouts and emits only aggregate cleanup counts.
- Added `docs/operations/OPERATIONS-MFA-MAINTENANCE-RUNBOOK.md` with DBA provisioning requirements, least-privilege membership, TLS/secret handling, recommended five-minute cadence, retry/overlap controls, alert conditions and activation acceptance tests.
- Wired migration 0038, its role-isolation test and a worker-entrypoint smoke invocation into Foundation PostgreSQL 16 CI.
- **Status: implementation and CI validation pending.** The repository still has no selected production database host, API runtime or scheduler service. The new role is not a login; no scheduler login, production credential, production grant, recurring schedule, alert route or deployment has been created. The checked-in worker is a secure invocation entrypoint, not proof of an automatic recurring job.
- **Activation remains blocked** on selecting the hosting/scheduler environment, provisioning a dedicated login with membership in `unibud_ops_scheduler` using `INHERIT FALSE, SET TRUE`, verifying secure connectivity and secret rotation, exercising the worker with that non-superuser login, testing monitoring/retry/overlap behavior, and obtaining independent security review and explicit production change approval.


### Operations maintenance worker — CI verification update (2026-11-11)

- The first worker smoke test exposed a connection-handling defect: the PostgreSQL URI was being interpreted by libpq as a database name. This failure was not hidden; the Foundation job failed at the worker invocation after all migrations and existing concurrency tests had passed.
- Corrected the worker to parse the secret URI from its environment into libpq connection variables, remove the original URI before launching `psql`, reject unsupported URI parameters and conflicting TLS modes, and avoid placing credentials in process arguments or writing them to disk.
- Added a 10-second connection timeout and a 45-second hard process deadline. SQL remains bounded by 30-second statement, 3-second lock and 10-second idle-in-transaction timeouts.
- **Verified:** Foundation checks passed on commit `84b81c451c0b597146f48248cd139984e21bdfb7`; the PostgreSQL job specifically passed migration application, RLS isolation, all existing Operations concurrency checks, scheduler-role provisioning and the restricted worker invocation. Oracle Arc API tests also passed on that commit.
- Web and Database browser/build checks were still running at the last status check. No claim is made that every workflow on the latest branch head has passed.
- Production recurring execution remains intentionally inactive; the provider, production login, secret binding, alert route and independent review are still outstanding.


### Operations MFA in-app security notifications — implementation checkpoint (2026-11-11)

- Added migration 0039 with a forced-RLS, account-scoped notification inbox. Notifications are inserted by a database trigger from the append-only MFA audit stream in the same transaction as the source event.
- Added recipient rules for enrollment confirmation, lockout, recovery-code use/regeneration and dual-control request/decision/cancel/expiry events. Requester, target and independent approver receive only their relevant notices.
- Added session-derived database read/mark-read functions. No account ID is accepted from the caller; application roles have no direct table privileges; cross-account marking is denied.
- Added a dedicated account-level `notification_read` rate limit. It intentionally does not require MFA step-up, allowing a locked-out user to read their own security notices through a validated persisted session. It grants no privileged Operations permission.
- Added the authenticated API route, notification inbox UI on the Operations authenticator security page, responsive styling, database isolation test, application contract test and notification scope/delivery runbook.
- **External delivery is not implemented.** This feature creates in-app notices only. It does not send email, SMS, push or webhooks and makes no external delivery claim. The existing verification-delivery gateway is not assumed to be a security-notification provider.
- **CI status: pending for the new notification slice.** Migration 0039 and its test have been wired into Foundation CI; API/UI changes have been wired into Web CI. Await the current branch-head workflows before marking the slice verified.
- Notification retention is currently durable with no cleanup schedule. A bounded retention policy must be designed with the audit-retention requirements before deletion is introduced.


### Signing-key rotation overlap — implementation checkpoint (2026-11-11)

- Added migration 0040 with a maximum-two-active-key overlap for account transaction context, exact persisted-session context and Operations MFA assertions. Each purpose retains an independent key table and independent application secret binding.
- Updated account and session verifiers to evaluate every active candidate and complete fixed-length HMAC comparisons without early return. Added a shared verifier for password reauthentication, pending-enrollment resume, enrollment confirmation, recovery redemption and recovery-code regeneration; the MFA step-up verifier has its own overlap-aware comparison.
- Added a transaction-serialized trigger enforcing the two-key ceiling for each key purpose. No keys are generated, seeded or rotated by the migration.
- Application signing bindings identified from source: `UNIBUD_DB_CONTEXT_HMAC_KEY`, `UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY` and `UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY`. The existing signer reads these bindings; production values have not been changed.
- Added PostgreSQL test 0040 for old/new signature acceptance during overlap, third-key rejection, retired-key rejection, tampered signatures and confirmation that every existing Operations MFA assertion verifier uses the overlap-aware helper. The baseline test 0002 remains scoped to the original identity migration contract; it does not test migration 0040's overlap policy.
- Added explicit privilege regression assertions in test 0040: application/read-only roles cannot read any of the three signing-key tables or execute the private MFA verifier; the NOLOGIN Operations owner retains verifier execution.
- Wired migration 0040 and its test into Foundation CI. Added `docs/security/SIGNING-KEY-ROTATION.md` with staged provisioning, signer rollout, TTL/drain wait, retirement, rollback and incident boundaries.
- **CI status: pending on the current branch head.** Do not mark the migration/test verified until the exact-head Foundation run passes. Any regex-based conversion failure in migration 0040 must stop the migration; it is deliberately fail-closed rather than silently leaving a single-key verifier.
- **Production rotation is not performed.** No production key material, secret-manager binding, application deployment, session revocation or key retirement was changed. PR #15 remains draft/open/unmerged; independent review remains outstanding.

### CI remediation — baseline migration test and browser dependency setup (2026-11-11)

- Exact-head CI for `73faeed7164bf7471afab731746604ce42ae1fc2` exposed two independent validation issues.
- The Web/Database migration job applies migrations 0001–0017, while the two-active-key policy is introduced only by migration 0040. The earlier edit had placed a migration-0040 assertion in baseline test 0002, making that test depend on a migration that the job had not applied. Removed that misplaced assertion; test 0002 now validates the original single-key baseline, while test 0040 remains the authoritative overlap/third-key/retirement coverage and runs in Foundation CI after migration 0040.
- The Web CI Playwright install step used `--with-deps`, which invokes the hosted runner's apt package installation. The run failed in that dependency-install step before browser E2E or production build. Changed the step to install the Chromium browser without invoking apt; the hosted Ubuntu runner supplies the system libraries. The E2E suite itself must still pass on the new exact head before this is considered verified.
- **Current exact head:** `9e2634bb19d33d9592596abf7c3208a1a0a710c5`. Foundation, Web/Database and Oracle Arc API workflows were queued at the last status check. No success is claimed for this checkpoint.
- These are CI/test-harness corrections only. They do not alter production data, secrets, scheduler activation, deployment state or PR approval boundaries.

### Security-notification fixture correction — 2026-11-11

- Foundation PostgreSQL CI reached migration 0039 and exposed a fixture mismatch: the approval audit event referenced request `f039...0201`, but only the separate expiry request `f039...0202` existed. The notification trigger correctly could not resolve the missing requester's account, so the test observed three notices rather than four.
- Added the missing pending request 0201 with the expected requester account/session and target. Kept the expiry request 0202 as a separate expired record. The expected requester/target/approver notification coverage remains unchanged; no production trigger behavior was weakened.
- **Correction commit:** `bcd619504084d38d0ee989c8e25b81e6f3a00993`. Exact-head Foundation, Web/Database and Oracle Arc API CI must complete before this slice is marked verified.
### Security-notification test privilege correction — 2026-11-11

- The next Foundation run passed the corrected requester fixture and reached the cross-account mark-read assertion. It then correctly denied a direct SELECT against the notification table while the test had assumed the `unibud_app` role.
- Moved retrieval of the other account's notification UUID into the privileged test harness before `SET LOCAL ROLE unibud_app`. The application-role test now receives only the opaque UUID and proves the mark-read API refuses cross-account ownership without granting direct table access.
- This preserves the production privilege boundary and strengthens the test: `unibud_app` remains unable to read notification rows directly. Exact-head PostgreSQL CI must be rerun and pass.

### Identity RLS CI fixture correction — 2026-11-11

- Exact-head Web/Database PostgreSQL validation exposed that baseline test 0002 attempted to insert a second active account-context signing key. The baseline migration already provisions one active key and enforces a single-active-key unique index.
- Updated the isolated test transaction to deactivate the seeded key before installing its CI-only synthetic active key. The test's final `ROLLBACK` restores the original baseline state; production migrations and key material are unchanged.
- **Correction commit:** `3c352a508e2a0466d876487367de18e8043452b2`. Exact-head Foundation and Web/Database CI must verify the correction. The independent migration 0039 notification assertion failure and hosted-runner browser dependency failure remain separate items to validate against the new head.


### Exact-head CI verification — 2026-11-12

- **Current branch head:** `12510f70bbdec1300768bc54084e8656ce61d86b` on `foundation/session-derived-operations-rbac-v2`.
- **Foundation integrity:** PASSED, run `43058291877`. PostgreSQL 16 migration/RLS job and foundation integrity job both completed successfully. The workflow includes the independent-connection Operations dual-control approve/reject, approve/cancel and approval/expiry race harness; MFA assertion replay concurrency; and recovery-code redemption concurrency.
- **UNIBUD Web and Database:** PASSED, run `43058291884`. PostgreSQL migration validation and web build/type checks both completed successfully; the successful Web job includes its configured browser E2E/build stages.
- **Oracle Arc API:** PASSED, run `43058292045`.
- The earlier concurrency concern is resolved by existing checked-in scripts and their Foundation CI execution; no additional concurrency patch was needed in this checkpoint.
- PR #15 remains OPEN, DRAFT and UNMERGED. Issue #16 remains an independent security-review blocker. No production deployment, production key rotation, recurring scheduler activation, or live Operations grant provisioning is claimed.
- **Next acceptance work:** complete independent security review and Issue #16 disposition; select and approve the production scheduler/runtime and secret-manager binding before activation; verify worker monitoring/retry/alert delivery; define notification retention against audit retention; complete key provisioning/rotation evidence, Operations grant-management UI, audit search/export and security alerting.


### Maintenance worker safety-contract verification — 2026-11-12

- Added `scripts/test-operations-mfa-maintenance-worker.sh` and wired it into Foundation CI before the disposable database worker smoke test.
- The test verifies percent-encoded PostgreSQL URI parsing, that `DATABASE_URL` is removed before `psql`, that credentials do not appear in process arguments, required libpq environment, TLS downgrade rejection, unsupported URI-parameter rejection, batch bounds, the configured 45-second hard timeout arguments, and propagation of psql/timeout failures.
- **Verified at exact branch head `4cc1cd09d377933e02c0067b6c94761159db791f`:** Foundation `43136999522` PASSED, including the new safety-contract test and the actual worker invocation through the disposable least-privilege scheduler login; UNIBUD Web and Database `43136999469` PASSED; Oracle Arc API `43136999501` PASSED.
- This does not establish production scheduler configuration, production credentials/secret-manager integration, external alert delivery, recurring execution, or production deployment. PR #15 remains draft/open/unmerged and Issue #16 remains open pending independent review/disposition.


### Operations MFA encryption-key overlap support — 2026-11-12

- Added versioned TOTP seed encryption envelopes in `apps/web/src/lib/server/operations/operations-mfa-core.ts`: legacy v1 ciphertext remains readable; when a keyring is configured, new writes use v2 with a key ID authenticated as AES-256-GCM additional data.
- The optional `UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON` configuration accepts one or two unique 32-byte keys and requires the active key ID to be present. The existing `UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY` remains the legacy v1 decryption key.
- Added tests for v1 compatibility, v2 active-key writes, two-key overlap, unknown/retired key failure, invalid keyring bounds/IDs and environment parsing.
- Updated `.env.example` and `docs/security/SIGNING-KEY-ROTATION.md` with the safe rollout and retirement procedure.
- **Not yet CI verified at this addendum:** the implementation commits are on the active PR branch and require fresh exact-head Foundation, Web/Database and Oracle Arc API workflows.
- **Not production rotation:** no secret-manager binding, production key provisioning, ciphertext inventory/re-encryption, deployment rollout or production key retirement has occurred. Recovery-code HMAC key rotation remains unsupported and must not be attempted until a versioned digest migration exists.
- The previously verified migrations 0037–0040 provide dual-control concurrency hardening, the non-login maintenance execution role, transactional in-app MFA notices, and two-key HMAC verifier overlap. Notifications are in-app only; external email/SMS delivery is not established.
- Issue #16 remediation is present in migration 0021 and its PostgreSQL integration test: actor identity is derived from cryptographically verified database context, and the actor-selectable legacy function signatures are dropped. Issue #16 remains open pending independent review and formal disposition.
- PR #15 remains open, draft and unmerged. No production deployment, recurring production scheduler, production Operations grants or regulated financial functionality is enabled.


### Operations MFA recovery-code HMAC rotation support — 2026-11-12

- Added a versioned recovery-code HMAC keyring in operations-mfa-core.ts. Legacy v1 digests remain verifiable; newly generated recovery codes use the active v2 key ID and a domain-separated HMAC input.
- Recovery redemption now computes at most three candidates (legacy key plus the one/two configured v2 keys) and calls the new bounded PostgreSQL candidate wrapper. The wrapper delegates to the existing atomic one-time redemption procedure; the application role no longer has execute permission on the legacy single-digest entry point.
- Added migration 0041_operations_mfa_recovery_key_rotation.sql, its PostgreSQL privilege-boundary test, application tests for legacy/new key compatibility and keyring validation, environment documentation and a rotation runbook.
- The legacy recovery HMAC key remains required while any legacy recovery-code set may still be outstanding. Digest rows intentionally do not expose their key ID; retirement requires controlled replacement evidence and must not be inferred from successful deployment alone.
- CI status: exact-head Foundation, Web/Database and Oracle Arc API workflows must complete successfully before this implementation is marked verified. Do not rotate production keys as part of this code change.
- No production secrets, secret-manager bindings, recovery-code regeneration, production grant changes or deployment were performed. PR #15 remains open/draft/unmerged; Issue #16 remains open pending independent security review.


### Recovery-code HMAC rotation — exact-head verification — 2026-11-12

- **Verified code head:** d2a30e19cb46c1f3c80ce88db512f42a7cd91912.
- **Foundation checks:** PASSED, run 43142922889. PostgreSQL 16 applied migrations 0001–0041; the complete database/RLS suite passed, including the new recovery candidate-wrapper privilege test, the recovery redemption integration test with a mismatching candidate before the valid digest, and the existing independent-connection one-time redemption concurrency harness.
- **UNIBUD Web and Database:** PASSED, run 43142922820. PostgreSQL migration validation, TypeScript type check, contract tests, server security unit tests (including recovery keyring compatibility), lint, profile browser E2E and production build all passed.
- **Oracle Arc API:** PASSED, run 43142923010.
- CI initially exposed two test integration defects: migration 0041 had not been included in the Foundation migration/test command list, and the new test used pgTAP although the Foundation PostgreSQL service does not install that extension. Both were corrected: migration/test 0041 are explicitly wired into Foundation CI and the new test now uses native SQL assertions. The subsequent exact-head Foundation and Web/Database runs passed.
- No production key was generated or provisioned; no secret-manager binding, user recovery-code replacement, production deployment, production Operations grant or live key rotation was performed. The legacy recovery HMAC key must remain configured while legacy codes may exist. PR #15 remains open/draft/unmerged; Issue #16 remains open pending independent security review.


### Operations audit search and CSV export — 2026-11-12

- Added migration 0042 with a bounded, exact-session/MFA-step-up-protected SECURITY DEFINER audit read model. It filters by a mandatory time window (maximum 90 days), optional permission/outcome/actor and keyset cursor, and caps results at 1,000.
- Added an `audit_read` database-enforced rate-limit bucket (30 requests/minute) mapped to `operations.audit.read`.
- Added authenticated `GET /api/internal/operations/audit` with JSON pages (maximum 100), CSV export (maximum 1,000), no-store headers, server-side validation, and append-only audit records for successful, denied and failed access attempts.
- Added `/operations/audit` search console with time, permission, outcome and actor filters, pagination and CSV export.
- Added PostgreSQL authorization/filter/bounds/table-isolation coverage and application route contract tests; migration and SQL test are included in Foundation CI.
- Grant provisioning/revocation remains controlled database-administrator work. No HTTP grant-management endpoint was added: doing so without a reviewed independent dual-control grant lifecycle would expand privileged authority prematurely.
- Exact-head CI for this new checkpoint is pending. No production deployment, grants or permissions were provisioned.


### Operations audit search/export — exact-head verification — 2026-11-12

- **Verified code head:** b944b41be9cdcbcb6cbfac0de9b9f74c4a3d979f.
- **Foundation checks:** PASSED, run 43144303648. PostgreSQL 16 applied migrations 0001–0042 and the full database/RLS suite passed, including migration 0042 audit permission, date-range, outcome-filter, row-bound and direct-table-isolation assertions. Existing notification access without MFA step-up and the complete recovery/dual-control concurrency checks also passed.
- **UNIBUD Web and Database:** PASSED, run 43144297258. PostgreSQL migration validation, TypeScript type check, contract tests, server security unit tests (including the new audit route contract), lint, profile browser E2E and production build passed.
- **Oracle Arc API:** PASSED, run 43144303769.
- CI initially found that migration 0042's replacement rate-limit function/table constraint had dropped the pre-existing notification_read action. The action and its no-MFA notification semantics were restored in migration 0042, and the full Foundation suite subsequently passed. This was a regression caught and corrected before accepting the checkpoint.
- No production grants, production database changes, production deployment or self-service grant-management endpoint were introduced. Grant provisioning/revocation remains restricted to controlled DBA procedures pending an independently reviewed dual-control lifecycle. PR #15 remains draft/open/unmerged; Issue #16 remains open for independent review.

### Operations grant lifecycle — database foundation added

- **Implemented on branch:** migration 0043 adds a protected dual-control request lifecycle for ordinary operator grants and revocations. Request and decision functions derive actors from cryptographically verified account/session context, require exact-session MFA step-up and single-use password reauthentication assertions, lock requests before decisions, and revalidate live actor/session/grant/MFA state.
- **Permission boundary:** `operations.grants.request` and `operations.grants.approve` are bootstrap permissions only; the migration deliberately excludes them from assignable permission sets. A trusted DBA must provision these two permissions out-of-band. Existing role-specific allow-lists, mandatory 1–90 day grant expiry, self/target-approval denial, and no direct app-role table access are enforced in PostgreSQL.
- **Implemented tests:** Foundation now applies migration 0043 and runs the new PostgreSQL test for request creation, self-approval denial, independent approval, grant creation, append-only audit evidence, direct table isolation and bootstrap-permission non-escalation.
- **Not yet implemented:** HTTP routes, grant inventory/request/approval UI, request cancellation and bounded expiry worker, concurrency stress tests for grant transitions, grant notification delivery, and independent security review. The database functions are not exposed as a user-facing workflow.
- **Release boundary:** no bootstrap grants were provisioned; no production migration or deployment was performed. Treat migration 0043 as feature-branch code until exact-head CI and independent review pass.

### Operations grant management API and console — implementation checkpoint — 2026-11-12

- **API implemented:** `GET/POST /api/internal/operations/grants` exposes the bounded pending approval queue, active grant inventory and grant/revocation request creation. `POST /api/internal/operations/grants/[requestId]/decision` supports approve/reject. All responses are no-store.
- **UI implemented:** authenticated `/operations/grants` console provides request creation, permission/role selection, active grant inventory, revocation request initiation, independent approval/rejection and fresh password reauthentication. The Operations audit console now links to grant governance.
- **Trust boundary:** routes validate same-origin and the HTTP-only session, verify the account's current credentials, then pass a short-lived password reauthentication assertion and signed exact-session context to PostgreSQL. PostgreSQL independently enforces MFA step-up, grant permission, actor separation, live session/grant/MFA state, expiry, role allow-lists and target eligibility. No route directly queries or mutates protected grant tables.
- **Database hardening:** grant queue and active-inventory functions are VOLATILE to permit their database-enforced rate-limit writes. Rejected requests retain approver identity and reason. The SQL test now covers grant, revocation and rejection transitions in addition to privilege isolation and anti-escalation.
- **Verification pending:** current exact-head Foundation, Web/Database and Oracle Arc API CI runs must pass. Web typecheck, contract/security tests, lint, E2E and production build are required.
- **Still outstanding:** requester cancellation, bounded expiry worker, independent-connection grant concurrency tests, notifications, browser E2E for this console, accessibility review and independent security review.
- **Release boundary:** no bootstrap permissions or grants were provisioned; no production migration or deployment was performed. PR #15 remains draft/open/unmerged; Issue #16 remains open.

### Operations grant management — exact code-head verification — 2026-11-12

- **Verified code head:** `8a4ce7d78dac9ad86259ccdc5bd086343b864d6b`.
- **Foundation checks:** PASSED, run `43146549452`. PostgreSQL 16 applied migrations through 0043 and ran `database/tests/0043_operations_grant_dual_control.test.sql`, covering request creation, self-approval denial, independent approval, grant creation, revocation, rejection/approver attribution, audit evidence, direct-table isolation and bootstrap permission non-escalation. Existing RLS and concurrent Operations/MFA controls passed.
- **UNIBUD Web and Database:** PASSED, run `43146549394`. TypeScript typecheck, web contract tests (including the grant route/console contracts), server security tests, lint, existing profile browser E2E, PostgreSQL migration validation and production build passed.
- **Oracle Arc API:** PASSED, run `43146549362`.
- The first Web typecheck run caught a literal escaped newline in the new grant route type declaration. It was corrected in the verified code head; all three workflows subsequently passed.
- This verifies the database lifecycle, API contract and build, but does not constitute grant-console browser E2E or independent security review. No bootstrap grant, production migration, production deployment or operator activation occurred.

### Operations grant cancellation and bounded expiry — implementation and exact-head verification — 2026-11-12

- **Same-session requester cancellation:** migration 0044 adds `unibud_operator_cancel_grant_change`, a SECURITY DEFINER transition requiring the original requester account and exact original persisted session, live Operations MFA step-up, a single-use password reauthentication assertion and the dedicated `grant_cancel` rate-limit bucket. It locks and rechecks the pending request before cancellation and writes a system-verified requester audit event.
- **Requester queue visibility:** request-permission holders can read only their own pending requests from the exact originating session. Approvers retain the bounded review queue. The active grant inventory remains restricted to approvers.
- **UI/API:** `POST /api/internal/operations/grants/[requestId]/cancel` and the `Cancel my request` control are implemented. The database rejects cancellation from another session even if the account matches.
- **Bounded expiry:** migration 0045 extends the existing bounded Operations maintenance entry point. It expires at most the configured batch size of pending grant requests using `FOR UPDATE SKIP LOCKED`, marks them `expired`, and records a system-attributed `operations.grants.expire` audit event. It does not create a new scheduler or recurring schedule; the existing trusted scheduler entry point remains the only invocation path.
- **Database verification:** Foundation CI applies migrations 0044–0045 and tests the cancellation function's SECURITY DEFINER privilege boundary, same-account/session checks, reauthentication, MFA permission and throttle contract. The expiry integration test executes the existing scheduler role and verifies expiry state, reason and system audit attribution.
- **Verified code head:** `1ec9c88a8db2523a8723154e5870e08bb3caa92b`.
- **Foundation checks:** PASSED, run `43147456579`; PostgreSQL 16 applied migrations through 0045 and the full database/RLS suite passed, including grant cancellation boundary and bounded grant expiry tests.
- **UNIBUD Web and Database:** PASSED, run `43147456659`; TypeScript, contract/security tests, lint, existing profile browser E2E, migration validation and production build passed.
- **Oracle Arc API:** PASSED, run `43147456542`.
- **Still outstanding:** dedicated browser E2E for the grant console and cancellation, independent-connection race tests specifically for grant approval/rejection/cancellation/expiry, grant notifications, monitoring/alert routing, accessibility review, bootstrap permission provisioning and independent security review. No bootstrap grants, production migration, production deployment or operator activation occurred.

### Operations grant cancellation lock-wait hardening — migration 0046

- **Implemented:** migration 0046 replaces the cancellation function so wall-clock time is captured only after the request row lock is acquired. It then revalidates request/assertion expiry, the exact persisted requester session, live grant, active authenticator and exact-session MFA step-up before cancellation.
- **Why:** migration 0044 captured its timestamp before the row-lock wait. That allowed security state to become stale during a long wait even though the final request-state update still had a pending/expiry predicate.
- **Test:** added database/tests/0046_operations_grant_cancellation_post_lock_revalidation.test.sql to check function ordering, SECURITY DEFINER ownership, app-role execute access and protected-table isolation. Foundation CI applies migration 0046 and runs this test.
- **Not yet verified:** independent-connection grant races (approve/reject, approve/cancel, cancellation while step-up expires, and approval versus bounded expiry) still require a dedicated concurrency harness. The catalog contract test alone does not prove those runtime races.
- **Release boundary:** migration is feature-branch code only. No production migration, grants, deployment or operator activation occurred.
