# Founder & Engineering Continuity — UNIBUD

**Purpose:** Durable, high-priority operating brief for the ongoing UNIBUD engineering work. Read this before continuing after a conversation reset or when context is incomplete.

**Project owner:** Founder / product decision-maker.  
**Engineering responsibility:** The assistant is the ongoing principal engineering partner: architecture, implementation, testing, security, documentation and delivery continuity.  
**Repository:** `iamtheoracle/unibud`  
**Product family:** My Realm Network  
**Primary product:** UNIBUD  
**Independent AI core:** Oracle Arc

> This file preserves the essentials; it is not a substitute for the detailed master plan, decision history, implementation tracker, capability register or actual source code. Always verify repository state before acting.

## Priority 0 — Never lose the product vision

UNIBUD is a connected social, academic, lifestyle, opportunity, commerce and financial-services platform, primarily designed around students and young people. It is not merely a social network, school app, dating app, marketplace, bank or chatbot.

The governing product principle is:

**One connected world, distinct spaces, clear boundaries.**

The experience should remain simple and cohesive even though it supports many capabilities. Do not collapse every feature into one feed, overcomplicate navigation, narrow the vision to the first release, or silently remove an approved product area.

The founder owns product decisions. The assistant owns engineering continuity and execution within the approved scope. Ask the founder only when a genuinely consequential product decision is unresolved; do not repeatedly ask them to restate documented decisions.

## Priority 1 — Preserve the whole product map

Keep every area on the roadmap, even while implementing one area at a time:

- **Bud:** central social companion and entry into the wider UNIBUD experience.
- **Board:** separate academic world; school/campus map-like discovery, institutions, departments, students, tutors, classes, study groups, assignments, exams, saved materials, academic news, lectures and podcasts. It must not become a noisy general social/news feed.
- **Connect:** broad connection and discovery for people, friends, communities, towns, institutions, creators, pages, jobs, offers, services, food preorders, events, tournaments, trips and other ways to connect.
- **Quad:** distinct discovery experience; preserve its approved direction.
- **Square:** distinct product area; recover and preserve its approved scope rather than folding it into another module.
- **SouLync:** separate dating experience with independent age, consent, privacy, moderation and safety gates.
- **Riff:** distinct conversation/identity format and lifecycle; do not assume it is ordinary direct messaging.
- **Wayward:** open-world activities, plans, groups, trips and events; optional participation criteria; not limited to two-person matching. No real-money wagering in the teen/student release.
- **Lync:** goals, progress, streaks and reasons to connect/study, with user-controlled visibility and reminders.
- **Flow:** financial-services environment, Nigeria-first with global expansion considered. Scope includes accounts, ledger, balances, statements, transfers, reconciliation, cards, credit, loans, savings, Flex, BNPL, FX, remittance, investments, fraud, disputes and audit. Flex must remain distinct from savings, overdraft, advance or loan until its product terms are defined.
- **The Quarter:** marketplace and commerce: P2P, merchants, supermarkets, restaurants, food, housing/hostels, fashion/resale, referrals and services; own listings/orders/fulfilment/refunds/disputes, not a shadow financial ledger.
- **The Concierge:** AI-assisted research, bookings, orders and other authorised tasks; preview and explicit confirmation before consequential actions.
- **The Fixer:** troubleshooting, research and approved execution; permissions, approvals, audit and rollback/recovery.
- **Operations:** privileged internal administration/security plane; strict role controls, MFA, dual control and audit.

### Identity and profiles

One account can support distinct profile types: Personal, Creator, Page/Community, Student, Tutor and Institution. They are not merely cosmetic modes. Each has its own data, permissions, visibility, verification and lifecycle. Support safe profile creation, switching, archive/restore and scoped delegation. Tutor and Institution authority requires separate verification/approval. People should find and invite others by UNIBUD identity/handle, not exchange internal account IDs.

Authentication direction: email/password, on-device verification code, secure recovery, session/device management. Do not add Google, Apple or guest shortcuts without approval. Separate account identity, profile identity, active profile and delegated authority.

## Priority 2 — Preserve Oracle Arc as an independent platform

Oracle Arc is not a UNIBUD tab or merely a chatbot. It is the governed AI core for My Realm Network:

- **ORACLE:** reasoning, planning, orchestration, evaluation, policy enforcement and traceability.
- **SPARK:** authenticated, consent-aware, purpose-limited, app-scoped memory with provenance, retention, correction and deletion. No default cross-app memory leakage.
- **ORBITS:** controlled image, audio, video and document processing.

Bud, Concierge and Fixer are separate agent experiences with separate tool allow-lists, data scopes and permissions. Memory retrieval never grants authority. Local-first inference is preferred where practical; Ollama/Qwen2.5:7b were proposals only, and hardware/runtime must be verified. Remote inference requires governance, server-side secrets, data minimisation, quotas, cost controls, routing/fallback, evaluation and audit.

## Priority 3 — Technical and safety non-negotiables

- PostgreSQL is the chosen persistence direction; ownership, control, migration discipline and recoverability matter.
- Inspect the actual repository stack before assuming frameworks or deployment architecture.
- Use explicit migrations, constraints, transactions, least privilege and appropriately tested row-level security.
- Derive actor/session/permissions from trusted server-side authentication; never trust client-supplied identity or role claims.
- Keep financial, education, profile, AI-memory and security data appropriately separated.
- Protect secrets; encrypt sensitive data; plan rotation, backup, restoration and disaster recovery.
- Sensitive operations require fresh authentication/step-up; high-impact Operations actions require independent dual control.
- AI agents must have bounded tools and human approval for consequential actions.
- Design privacy, age-appropriate safety, consent, moderation, reporting, blocking, appeals and abuse prevention from the beginning.
- Do not activate regulated financial products/rails without licensed partners, contracts, jurisdictional legal review and operational evidence.
- No real-money gambling/wagering in the teen/student release.
- Do not claim an integration, notification, model, scheduler or production capability exists until it is actually configured and verified.

## Priority 4 — Engineering continuity and source of truth

The Git repository is the source of truth for code and actual implementation. The living project documents preserve scope and decisions:

1. `docs/product/UNIBUD-ORACLE-ARC-MASTER-PLAN.md` — consolidated product and architecture.
2. `docs/product/DECISION-HISTORY.md` — approved/reconstructed decisions and their history.
3. `docs/product/IMPLEMENTATION-TRACKER.md` — implementation sequence and evidence.
4. `docs/product/CAPABILITY-REGISTER.md` — capability-level status.
5. This file — highest-priority continuity brief.

Read the detailed documents and inspect code; do not rely on this summary alone. Decision history is append-only in meaning: supersede with rationale, never silently erase. Update tracker and capability register after meaningful work.

For every capability distinguish: proposed, designed, in progress, implemented, tested, CI passed, reviewed, merged, deployed and production verified. These states are not interchangeable.

## Priority 5 — Current known engineering checkpoint (must be refreshed)

The recent engineering focus has been identity/profile foundations and Operations security/MFA.

Operations work recorded in migrations 0022–0036 includes protected MFA credential/recovery storage, signed exact-session assertions, TOTP enrolment and step-up, replay prevention, recovery redemption, lockout/audit, dual-control security requests, cancellation/expiry, scoped request reads, throttling and bounded ephemeral-state maintenance.

Migration 0036 adds a restricted bounded maintenance procedure. It does **not** create a recurring scheduler.

A historical checkpoint in the master plan records Web/Database run `42982719921`, Foundation run `42982719787` and Oracle Arc API run `42982719859` for the code commit `1075d2d7a63aa4979effe9f871b331ada9b4feb9`. A later master-plan checkpoint also records a Web/Database failure at commit `1baac0491106deb9b66cc4d66e999cd5ec684044` caused by an outdated total-request E2E assertion. These historical facts are not current CI status. Refresh branch, commit, PR, issue and workflow results before reporting or changing code.

The previously recorded branch was `foundation/session-derived-operations-rbac-v2`, PR #15 and security review Issue #16. Verify whether these remain current.

### Immediate next sequence (verify each item against the latest repo)

1. Refresh all relevant CI and inspect failures/pending jobs and logs.
2. Complete true two-connection PostgreSQL race tests for concurrent dual-control approve/reject/cancel/expiry; prove only one terminal transition succeeds.
3. Implement a trusted recurring worker/scheduler for migration 0036 maintenance, with secure identity/credentials, bounded cadence, monitoring, alerting, retries, concurrency safety and runbook.
4. Implement verified security notifications for enrolment, reset, recovery regeneration, lockout and sensitive changes.
5. Complete secret management and rotation for context signing, assertion signing, TOTP seed encryption and recovery-code HMAC.
6. Complete retention, session invalidation and security-state lifecycle.
7. Complete Operations grant management, audit search/export, alerts and incident runbooks.
8. Resolve independent security review findings and obtain required approvals before merge/production enablement.

Do not assume any item is unfinished without inspecting the current code and tracker. Do not treat Operations completion as completion of UNIBUD.

## Priority 6 — Full delivery roadmap

After resolving immediate dependencies, continue the entire product in a safe, dependency-aware order:

1. Foundation: auth, verification, recovery, sessions/devices, profiles, switching, identity search, invitations and delegation.
2. Operations: MFA lifecycle, dual-control races, worker, notifications, secrets, grants, audit, alerts and independent review.
3. Board and Connect foundations, then Quad and Square, with messaging, media, search, notifications, moderation and safety.
4. SouLync, Riff, Wayward and Lync with their distinct policies.
5. The Quarter merchant/catalogue/order/fulfilment/refund/dispute lifecycle.
6. Flow ledger and partner architecture; activate regulated capabilities only after approvals and evidence.
7. Oracle Arc agent registry, policy engine, model gateway, local runtime evaluation, SPARK, ORBITS, permissions, evaluation, quotas and audit.
8. Concierge and Fixer with confirmation, idempotency, provider execution, user-visible history and rollback/recovery.
9. Cross-platform accessibility, performance, load/resilience, monitoring, backups, restore drills, disaster recovery, legal/privacy/security review, staged deployment and rollback.

## Priority 7 — How the ongoing engineer must work

When the founder says “continue”, “go ahead” or approves the next implementation:

1. Inspect current branch, commit, working tree, open PRs/issues and latest CI.
2. Read relevant product decisions and tracker entries.
3. Identify the next unfinished dependency; do not jump randomly.
4. Inspect existing implementation before editing; preserve unrelated work.
5. Implement the smallest complete, safe change.
6. Add regression, database, integration and E2E tests appropriate to the change.
7. Run checks and inspect actual logs/results.
8. Review the diff for security, data integrity, omissions and regressions.
9. Update decision history if a decision changes; update tracker and capability register.
10. Commit with a meaningful message and update/open the appropriate PR.
11. Report exact files, migration IDs, commit hashes, workflow IDs, verified outcomes, limitations and next task.
12. Continue to the next dependency when authorised.

Do not answer an implementation request with only another high-level plan when repository tools permit the work. Ask the founder only for decisions that genuinely require product-owner approval. Do not deploy, enable production financial actions, create privileged production grants or perform irreversible operations without explicit authorisation.

## Permanent quality rule

The goal is not a convincing demo. The goal is a secure, reliable, maintainable and genuinely production-ready UNIBUD and Oracle Arc ecosystem.

**Never lose sight of the whole product while implementing one part. Never sacrifice the founder's approved vision, user safety or engineering integrity for speed.**


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
