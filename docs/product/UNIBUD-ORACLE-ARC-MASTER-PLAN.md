# UNIBUD and Oracle Arc — Master Product, System and History Blueprint

**Status:** authoritative scope and architecture baseline; not a claim that every listed capability is implemented or production-ready.
**Product family:** My Realm Network
**Primary application:** UNIBUD
**AI platform core:** Oracle Arc
**Repository:** `iamtheoracle/unibud`

## 1. The purpose

UNIBUD is a connected social and life platform for students and young people. It brings together relationships, communities, academic life, opportunities, everyday services, commerce and student-focused financial tools without forcing every activity into one noisy feed. It is not merely a school app, dating app, marketplace, bank or chatbot. It is a set of purposeful spaces that share one account, identity, safety model and design language.

The product principle is **one connected world, distinct spaces, clear boundaries**. Each space should feel like a coherent mini-application inside UNIBUD, with its own information architecture, settings, privacy, permissions and visual character. Shared navigation and identity should make the whole feel unified without blending unrelated content.

Oracle Arc is not another UNIBUD tab or a replacement for the app. It is a separately governed AI core intended to serve UNIBUD and, later, other My Realm Network products. Bud, The Concierge and The Fixer are distinct user-facing AI experiences that may use Oracle Arc under different permissions and policies.

## 2. Product principles and non-negotiable boundaries

1. **Purposeful separation:** academic work belongs in Board; social discovery and relationships belong in Connect and its experiences; money belongs in Flow; commerce belongs in The Quarter.
2. **One account, multiple identities:** an account may own or manage eligible Personal, Creator, Page/Community and future education identities. These are distinct profile types, not cosmetic themes. Switching identity must never silently switch legal owner or permissions.
3. **Least privilege:** every delegated role is scoped, revocable, time-bounded where appropriate and audited. Tutor and Institution identities are separate from Student; institution authority over tutors never implies authority over students, or vice versa.
4. **Safety before growth:** age assurance, privacy, abuse prevention, reporting, blocking, moderation, appeals and incident response are product foundations.
5. **No false integrations:** a screen or schema is not a live provider integration. Banking, payments, delivery, messaging, AI providers and identity verification require verified contracts, credentials, test evidence and operational monitoring.
6. **Explicit consent for consequential actions:** bookings, orders, payments, transfers, account changes and external actions require a clear preview and user confirmation. Higher-risk actions require reauthentication and/or step-up.
7. **History and accountability:** material product decisions, schema changes, ownership transfers, security actions and AI decisions need versioned records and append-only audit where appropriate. Preserve superseded decisions with dates and rationale; do not silently erase history.
8. **Accessible, calm and useful:** responsive layouts, readable hierarchy, accessible controls, language/currency/time-zone support and user-controlled notification preferences.
9. **Local-first AI:** prefer local inference where feasible; remote inference is explicitly governed, opt-in where required, data-minimised and restricted by policy.
10. **Release honestly:** planned, coded, tested, deployed and production-verified are separate states.

## 3. UNIBUD application map

### Bud
The social home and companion space: a personal, conversational interface for navigating UNIBUD and connecting with people. Bud should not become a universal unbounded agent. Its tools, memory, visibility and permissions are limited to the signed-in user's allowed context.

### Board — the academic environment
Board is a focused academic world, not a general social feed or news stream. It can contain school/campus discovery presented spatially, students, tutors, institutions and departments, classes, study groups, assignments, tests/exams, academic materials, academic news, lecture videos and podcasts. Academic content and saved learning materials must remain easy to find and separate from general social activity. Tutor and Institution identities remain private/non-public until their own release and governance gates are met.

### Connect — relationships and real-world connection
Connect is the broader social and discovery area: friends, communities, towns, institutions, creators, pages, jobs/offers, services, food pre-orders, events, tournaments, tours and other ways people meet and organise. It can contain experiences with distinct rules and settings. The platform should not reduce Connect to only the examples listed here; new connection formats can be added under the same safety and permission framework.

- **SouLync:** a distinct dating experience with independent age assurance, consent, safety and moderation gates. It must not expose minors to adult dating.
- **Riff:** a distinct identity/conversation format and lifecycle, with its own interaction rules.
- **Wayward:** non-wagering games, playful challenges and education-bill surprises in the teen/student release. No real-money gambling or wagering in that release.
- **Lync:** visible goals, streaks and reasons to connect or study together. Avoid manipulative streak pressure; users control visibility and reminders.

### Quad
UNIBUD-wide discovery: a way to explore people, places, communities, opportunities and experiences. It is not a separate Guild concept. Discovery must respect privacy, age, visibility and block/report rules.

### Square
A separate approved space whose existing product decisions must be preserved. Its complete feature acceptance matrix must be maintained rather than silently folded into another module.

### Flow — student-focused financial services
Flow is the financial application, not the marketplace. The long-term product vision includes accounts, balances, statements, transfers, tuition payments, cards, savings, credit, loans, Flex, BNPL, FX wallets, remittance, investments and financial safety. Keep the financial ledger and liabilities separate from The Quarter's catalogue/order domain. Flow must be Nigeria-first with a deliberate path to other jurisdictions. Every live regulated feature requires licensed partners, local legal review, safeguarding, operational controls and evidence. Flex must be represented distinctly from the user's own savings, overdraft, advance or loan.

### The Quarter — commerce and marketplace
The Quarter is the commerce hub: peer-to-peer listings, supermarkets, restaurants, food ordering, housing/hostel rentals, fashion/resale, referrals and services. It owns merchant/catalogue/listing/order/fulfilment/refund/dispute workflows. Payment execution is delegated to verified payment/Flow partners; the marketplace must not create an independent shadow ledger.

### The Concierge
A user-facing AI service for authorised research, bookings, orders and purchases. It prepares the action, displays merchant/provider, price, terms, delivery or booking details and consequences, then asks for explicit confirmation before committing. It must not infer consent from conversation alone for consequential actions.

### The Fixer
A user-facing AI service for troubleshooting, investigation, research and approved task execution. It explains proposed changes, requests approval where needed, records actions and offers rollback or recovery where technically possible. It must not gain broad system or account authority merely because it is an AI assistant.

### Operations
A privileged internal administration and security plane, separate from ordinary user profiles and product spaces. It needs scoped operator grants, exact-session MFA, dual-control security changes, audited access, read-only provider health, grant management, audit search/export, alerts, retention and incident runbooks. No user-facing role automatically grants Operations authority.

## 4. Oracle Arc — independent AI core

Oracle Arc is the shared AI platform for My Realm Network. Its purpose is to provide governed reasoning and execution infrastructure while keeping each application responsible for its own user experience, product policy and permissions.

### Oracle — reasoning and decision layer
- Model and tool selection, task planning and constrained execution.
- Policy evaluation before tools or data are accessed.
- Evidence-aware answers, provenance and traceable decisions.
- Risk classification, approval gates, fallback and refusal behaviour.
- Evaluation, quality measurement, regression tests and incident review.

### SPARK — memory layer
- Authenticated, user-controlled and app-scoped memory.
- Separate short-term task context from durable preferences and facts.
- Purpose limitation, consent, retention and deletion workflows.
- No cross-app memory leakage by default.
- Provenance, confidence, timestamps and correction history.
- Memory retrieval is not authority: an agent must still check current permissions.

### ORBITS — multimodal processing layer
- Controlled processing of images, audio, video and documents.
- Content validation, malware scanning, privacy controls and retention.
- Separate extraction/transcription from interpretation and action.
- Tool- and app-scoped access to processed artefacts.
- No assumption that a media upload authorises publication or external sharing.

### Agent and model governance
- Bud, Concierge and Fixer are separate agents/experiences with different tool allow-lists and action policies.
- Agent identity, user identity, app identity and delegated authority must remain distinct.
- Local inference is preferred when suitable (the proposed early local stack included Ollama and Qwen 2.5 7B, subject to hardware evaluation).
- Remote inference is opt-in/governed, with sensitive-data restrictions, server-side credentials, provider controls and clear fallback rules.
- Model routing must account for capability, latency, privacy, cost, quotas and availability.
- Track token/compute usage, spend limits, per-user and per-app quotas, provider failures and model versions.
- Discovery of a model or runtime is not proof that it is installed, secure, evaluated or in production.

## 5. Shared platform architecture

The following is the target architecture; implementation status must be tracked independently.

1. **Clients:** responsive web and mobile experiences; distinct module shells; accessible navigation; secure session handling.
2. **Application/API layer:** server-side routes and domain services; strict schemas; same-origin protection; idempotency; rate limits; no client-supplied actor identity.
3. **Identity and access:** email/password account authentication, on-device verification code, secure recovery, session/device lifecycle, profile membership, delegated grants and policy checks.
4. **PostgreSQL-owned persistence:** authoritative relational data, migrations, constraints, transactions, row-level security and narrowly scoped SECURITY DEFINER procedures. The project should own and control its database and backups rather than depend on an opaque application-owned datastore.
5. **Domain services:** separate bounded contexts for profiles, education, social graph, messaging, content/media, events, marketplace, payments/ledger, AI, safety and Operations.
6. **Integrations:** provider adapters behind explicit contracts, timeouts, retries, circuit breakers, idempotency and health checks. Secrets remain server-side.
7. **AI gateway:** Oracle Arc policy, routing, evaluation, memory and multimodal orchestration; applications receive only approved capabilities.
8. **Observability and operations:** structured redacted logs, metrics, traces, audit, alerts, support tools, backups, restore tests, disaster recovery and incident response.
9. **Delivery:** CI, migration validation against PostgreSQL, contract/unit/integration/E2E/load tests, preview environments, staged rollout, rollback and production verification.

### Identity and profiles
- Email/password only for the agreed first-party account flow; no Google, Apple or guest account shortcut.
- Verification codes are generated and verified through the owned authentication flow; production delivery needs a verified provider.
- Personal, Creator, Page/Community, Student, Tutor and Institution are distinct identity/profile families with their own fields, tools, visibility and permission rules.
- One account can hold multiple eligible profiles, with explicit switching and a clear active-profile context.
- Invitations use searchable UNIBUD identity/handles, not manual exchange of account IDs.
- Delegation is scoped to a profile/resource and permission, accepted by the recipient where required, revocable and audited.

### Data and security boundaries
- Never trust caller-supplied account IDs, session IDs, roles, MFA state or permissions.
- Derive actor and session from validated server sessions and cryptographically verified database context.
- Keep public profile data, private education records, financial data, AI memory and security/audit data in appropriately separated domains.
- Apply data minimisation, encryption in transit/at rest, key rotation, least privilege and tested recovery.
- Sensitive actions require fresh authentication and step-up; high-impact operator actions require independent dual control.
- All important lifecycle changes need audit history, but secrets and raw credentials must never enter logs or audit payloads.

## 6. Financial and regulated boundaries

Flow's target feature map includes:
- deposit/payment accounts and immutable double-entry ledger;
- balances, statements, transaction history, receipts and reconciliation;
- internal/external transfers, tuition payments, fees, limits, reversals and disputes;
- virtual/physical debit cards and card controls;
- credit cards, limits, APR/fees, billing and repayments;
- lending, underwriting, servicing, hardship and collections safeguards;
- savings pots and goals;
- Flex as a separately modelled product with explicit cost, repayment and eligibility;
- BNPL with affordability, disclosures, due dates and hardship controls;
- multi-currency wallets, FX, remittance and settlement;
- investment research, portfolio, execution and custody only through appropriately licensed partners;
- fraud detection, chargebacks, account restrictions and full audit.

No live banking rail, card, loan, investment custody, FX execution or settlement should be claimed without partner contracts, licences/permissions, jurisdictional review, security certification and production evidence. Teen/student safeguarding and guardian/consent requirements must be designed before release. Real-money wagering is excluded from the teen/student product.

## 7. Product history and decision preservation

The complete history must be preserved as a first-class engineering asset.

- Keep this master blueprint as the current consolidated product/architecture reference.
- Record every material decision in a dated decision log with: ID, date, status, decision, rationale, affected modules, alternatives rejected, dependencies and superseding decision.
- Never overwrite a previous decision to hide a change. Mark it superseded and link the new decision.
- Keep Git commits, pull requests, issues, migration history and release notes linked to the relevant decision IDs.
- Keep an implementation tracker with evidence and exact commit/workflow/environment references.
- Maintain an architecture decision record (ADR) for major technical choices such as database ownership, auth, local/remote model routing, financial ledger, identity boundaries and provider selection.
- Preserve user-approved scope even when not implemented; do not silently delete or rename modules.
- Audit logs for security and financial actions are append-only or tamper-evident. Product decision history is version-controlled; it is not a substitute for operational audit logs.
- Where earlier conversation history is incomplete or ambiguous, label the record as reconstructed and ask for confirmation before treating it as a final product decision.

## 8. Delivery roadmap and acceptance gates

### Foundation and identity
Finish authentication, verification delivery, recovery, sessions/devices, profile lifecycle, identity search, invitations, delegation and private education identity boundaries. Require PostgreSQL migration/RLS tests, account-isolation tests and browser E2E.

### Operations security
Finish MFA dual-control lifecycle, list/detail, rate limiting, request console, race tests, expiry worker, notifications, secrets/rotation, grants, audit/alerts and independent review. The current code is not production-enabled.

### Core social and academic spaces
Implement Board and Connect as separate domains; complete Quad and Square; add messaging, media, search, notifications, moderation, reporting, blocking, appeals and accessibility.

### Distinct experiences
Implement SouLync with age/safety gates; Riff conversation lifecycle; Wayward non-wagering play; Lync goals and visibility controls.

### Commerce and finance
Build The Quarter's catalogue, listings, orders, fulfilment, refund and dispute lifecycle. Build Flow ledger and account foundations before any real-money product. Integrate only verified partners and approved jurisdictions.

### Oracle Arc
Establish agent registry, policy engine, model gateway, local runtime evaluation, SPARK memory controls, ORBITS processing, tool permissions, evaluation suites, usage/cost controls, audit and app-specific integration.

### Concierge and Fixer
Add approved action plans, confirmation, idempotency, provider execution, rollback/recovery, user-visible history and permission tests.

### Production readiness
Complete privacy/legal review, security review, threat modelling, accessibility, load and resilience tests, backups/restore drills, monitoring, support operations, incident response, staged deployments and rollback. A passing CI workflow alone is not production readiness.

## 9. Current known implementation checkpoint (2026-11-11)

The recent repository work has concentrated on authentication/profile foundations and privileged Operations MFA. The Operations stream includes protected MFA storage, signed exact-session assertions, TOTP enrollment/challenge/recovery, dual-control disable/reset requests, requester cancellation, expiry procedure, permission-gated request reads, request console and database-backed action-specific throttling. Migrations 0031–0035 are recorded in the implementation history.

The latest recorded Web/Database run at commit `1baac0491106deb9b66cc4d66e999cd5ec684044` passed PostgreSQL migration validation, typecheck, contract tests, server security tests and lint, but failed the browser script `scripts/e2e/operations-mfa.mjs` at an obsolete total-request assertion (10 observed versus 6 expected). The production build was skipped after that E2E failure. Foundation and Oracle Arc API workflows passed at that checkpoint. This is a test-harness failure, not proof that the full application or Operations workflow is production-ready.

The branch/PR state, latest commit and workflow results must be refreshed from GitHub before every subsequent status report. Do not assume a commit or workflow remains current merely because it is written here.

## 10. What this blueprint does not claim

This document does not claim that all modules, integrations, AI models, financial rails, notifications, deployment environments or production operations exist. It records the intended system, boundaries, sequencing and evidence required to build it safely. Every capability must move through designed, implemented, tested, deployed and production-verified states with explicit evidence.


## Current repository verification addendum — 2026-11-11

At PR #15 head `2b33726b472c80488157037608221d6c20e74935`, the latest Foundation checks (run `42984214254`), Oracle Arc API (run `42984214255`) and UNIBUD Web and Database (run `42984214256`) completed successfully. These exact-head CI results do not establish production readiness. PR #15 remains draft/open/unmerged and Issue #16 remains open for independent security review of the migration-0021 actor-provenance remediation.

The next Operations acceptance gap is true dual-control concurrency. The ordinary SQL tests in migrations 0031–0036 validate lifecycle and permissions but do not race terminal request transitions over independent connections. Migration 0037 and the dedicated concurrency harness are being added to validate approve/reject, approve/cancel and approval/expiry serialization, including wall-clock expiry after row-lock waits.


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
