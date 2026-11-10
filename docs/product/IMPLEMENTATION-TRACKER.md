# UNIBUD / My Realm Network implementation tracker

Last verified: 2026-11-11
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
- Latest inspected head: `c16e9e8cff39dc6926c11bc6b8c3851d52ca5604`.
- Exact-head GitHub Actions at `c16e9e8cff39dc6926c11bc6b8c3851d52ca5604`: **PASS** for Foundation checks (run `42925640430`), Oracle Arc API (run `42925640442`), and UNIBUD Web and Database (run `42925640425`). The Web workflow completed type check, contract tests, server security unit tests, lint, profile browser E2E and production build; PostgreSQL migration validation passed. Foundation applied all identity/auth migrations and passed PostgreSQL 16 RLS isolation and foundation integrity.
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

