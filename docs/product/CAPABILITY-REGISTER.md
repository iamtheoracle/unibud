# UNIBUD Capability Register

This register is the scope-preservation ledger for the complete UNIBUD ecosystem. It is intentionally broader than the first release. A capability may be planned, in design, implemented, tested, or production-verified; these states must never be conflated.

## Status vocabulary

- **Target** — part of the agreed product scope; not yet implemented.
- **Designed** — requirements and boundaries documented.
- **Building** — implementation is underway.
- **Implemented** — code exists, but may not yet be fully tested or production-ready.
- **Verified** — evidence exists for the stated test scope.
- **Production-ready** — operational, legal, security, provider, support, and release requirements have been met.

The initial repository foundation is documentation and service scaffolding. The spaces below are not represented as fully implemented.

## Platform foundations

| Capability | Scope to preserve | Initial state |
|---|---|---|
| Account and identity | Registration, login, recovery, sessions, verification, account lifecycle, device/session controls | Migrations 0001–0010 and PostgreSQL 16 auth/RLS/rate-limit tests added; scrypt, verification, session lifecycle, registration/login/recovery orchestration, encrypted identifier protection, dual role-specific PostgreSQL pools, RPC adapters, database-backed rate limiting, HTTP verification gateway, auth routes, secure cookie handling, and first-party sign-up/login/verification/recovery screens implemented; legal policy pages are drafts and production onboarding fails closed until approved policy versions are configured; production database credentials, delivery gateway configuration, and deployment verification pending |
| Profile families | Personal, creator, page/community; one account may own/manage several; explicit switching | Contracts and server-side profile service implemented; one-personal-profile invariant and delegated owner binding migrated; PostgreSQL 16 owner/delegate/outsider tests added; PostgreSQL profile RPC adapter and authenticated list/create/delegation/switch routes implemented; owner-only creator/page identity editor and explicit least-privilege profile-role matrix added in migrations 0012–0013 with PostgreSQL isolation tests; migration 0014 adds owner-controlled invitation cancellation, expiry state, delegated role changes, suspension, restoration and permanent revocation (including revocation while suspended; revoked access remains terminal), with service, PostgreSQL and browser lifecycle tests now wired into CI; profile lifecycle verified by PostgreSQL 16 migration/RLS tests, service/contract tests, browser workflows, typecheck, lint and production build at commit db957da46a01f9a68a936c9d93cccf8d101276a2; production database credentials and deployment verification pending; typecheck, unit tests, lint, browser workflows, PostgreSQL 16 migration/RLS tests and production build verified at commit 89c67dd0da82eff50256b73521e004cdbc1d3201; production database credentials and deployment verification pending; distinct active-profile views and family-specific navigation now implemented for Personal, Creator, and Page/Community identities; unavailable publishing, analytics, monetisation, moderation and membership capabilities are explicitly marked as not connected; focused browser coverage added; latest UI/E2E changes and recovery/transfer flows verified by full CI at commit 329ace67d54e85d31162ab3af59b84169c5eb0eb; migration 0015 adds owner-only reversible archive/restore procedures, serialized per-account lifecycle changes, append-only archive/restore audit history, active-session context invalidation, and protection for the personal identity and remaining active profiles; authenticated archive, restore, archived-profile listing and owner history endpoints plus recovery controls are implemented; PostgreSQL and service tests added, full CI verification passed at commit 87cb81240f682fb014af39f085acdfd3745926d4; migration 0016 adds durable in-app archive/restore notifications, owner-only inbox/read endpoints, archive-time suspension of active delegated memberships, revocation of profile-scoped resource grants, notifications to affected delegates/grant holders, and no automatic reactivation on restore, account-closure preflight reporting, and a database closure guard that blocks closing accounts with owned profiles (including archived ones) or unreleased delegated relationships; migration 0017 adds two-party, seven-day Creator and Page/Community profile ownership transfer, with fresh password reauthentication by the current owner at request and finalization and by the recipient at acceptance, active verified personal identities for both participants, remaining-profile protection, no personal-profile transfer, active/suspended delegate and pending-invitation blockers, stable advisory-lock ordering across participant accounts and profile lifecycle, database-clock expiry, frozen new delegation/invitations/profile-scoped grants while consent is open, with archived profiles rejecting new scoped grants, cancellation on profile archive/restriction, participant account suspension/restriction, or loss of the participant's last verified sign-in identity, audited expiry/cancellation, notifications to both parties, atomic owner/membership mutation, revoked delegation history preservation, pending invitation cancellation, profile-scoped grant revocation, active session profile-context clearing, and owner-visible append-only transfer history; database status changes require trusted procedures; API, service/repository, UI, service tests, PostgreSQL and browser E2E added; payments, bookings, contracts, provider accounts and other account-level assets are outside this profile-only transfer foundation and must extend transfer preflight before becoming transferable; full CI (PostgreSQL 16 migrations/RLS, Oracle Arc API tests, typecheck, contract tests, server security tests, lint, profile browser E2E and production build) passed at commit 329ace67d54e85d31162ab3af59b84169c5eb0eb; production database credentials and deployment verification remain pending |
| Delegated access | Page admins, moderators, school/seller/provider roles; scoped grants and revocation | Exact-profile grant/revoke service implemented; delegated rows bound to canonical owner and grantor; handle-based invitations require recipient acceptance; page-role permissions are explicit and deny by default; specialised seller/provider/education/staff identities do not inherit authority from a profile role; owner/delegate/unrelated-account and role-isolation tests added |
| Discovery and search | People, profiles, communities, institutions, creators, services, opportunities, activities, content | Target |
| Messaging | Direct and contextual conversations, attachments, voice messages, safety controls | Target |
| Notifications | Meaningful, preference-aware, space-specific events; no noisy blanket notifications | Target |
| Media and files | Upload, playback, processing, permissions, scanning, retention, reporting | Target |
| Trust and safety | Reporting, blocking, moderation, appeals, age controls, abuse prevention, incident response | Target |
| Payments and bookings | Provider-backed transactions, confirmation, idempotency, reconciliation, refunds and disputes | Target |
| AI assistance | Oracle Arc integration with scoped memory, agent permissions, confirmation and audit | Designed |
| Accessibility and localisation | Responsive layouts, accessible interaction, language/currency/time-zone support | Target |
| Operations and observability | Audit, logs, metrics, alerts, backups, recovery, support tooling | Target |


## Identity onboarding
- First-party email/phone registration and login; no Google or Apple sign-up.
- Versioned terms and privacy acceptance; account identity is resolved from a verified session, never a caller-supplied account ID.
- Personal profile and owner membership are created idempotently; creator and page/community profiles remain separate profile families.
- **Status:** onboarding orchestration, explicit policy acceptance, PostgreSQL transactional adapter, verified-session completion route, and personal-profile setup screen implemented; legal text remains draft and production onboarding is gated pending legal approval.

## Education identities — private future capability

Tutors, students, and institutions are distinct education-domain identities, not public profile types. An institution may hold separate, explicit authority to manage tutor records and student records. One authority never implies the other. Tutor and institution records remain private and non-discoverable in the current phase. See [Private Education Identity Boundaries](../security/EDUCATION-IDENTITY-BOUNDARIES.md). This is planned scope, not a released feature.

## Consumer and ecosystem spaces

### Connect
- Discover people, friends, communities, towns, institutions, schools, creators, pages, services, jobs, and opportunities.
- Follow, connect, join, request access, or contact according to the relevant context.
- Interest-based gists and open conversations do not require prior friendship or forced group membership.
- Remote work, delivery, domestic services, cafeteria/food pre-orders, and other offers have clear provider/buyer roles.
- Contextual provider/customer chat can be pinned during an active order and retired or archived after fulfilment/payment according to retention policy.
- Events, tournaments, tours, and community activities can be discovered here while their operational planning remains in the owning space.
- SouLync and Wayward remain distinct experiences discoverable through the ecosystem.
- **Boundary:** Connect is not a forced-match dating app and not a duplicate of every other space.

### Bud — academic companion
- Tutoring, study plans, courses, assignments, learning goals, progress and academic support.
- Academic profiles and relevant school/course connections.
- Academic library for notes, PDFs, slides, textbooks and other permitted materials, research, and saved resources.
- Academic lectures, educational videos, podcasts, seminars and recordings.
- Academic updates distinguish official school information, education news, and campus happenings.
- Saved academic material remains organised for later retrieval and is not mixed into a general entertainment feed.

### Board — campus workspace inside Bud
- A navigable digital campus map with real school locations, buildings, faculties, departments and points of interest.
- School workspace for lecture halls, libraries, laboratories, student affairs, administration, facilities and campus services.
- School-specific materials, notices, timetables, exams, registration and academic resources.
- School and department information with appropriate official-source and update status.
- **Boundary:** Board is a school/campus workspace and map, not a news feed. Academic live video and podcasts are separate from general Square media.

### Flow — student financial services
- Accounts, balances, account activity, statements and financial history.
- Local currency accounts and eligible foreign-currency accounts where supported.
- Physical and virtual cards, card controls and wallet experiences.
- Transfers by permitted account identifiers, username or QR where supported.
- Payments, including school fees and other recurring/structured obligations.
- Savings, fixed goals, budgeting, financial planning and level-aware student planning.
- Eligible credit products, scoring, limits and final-year loan pathways subject to underwriting and law.
- Nigeria-first rollout with later geographic expansion.
- **Boundary:** banking-first, not a marketplace. No fake balances, simulated success presented as real, or live financial rails without regulated partners, approvals, ledger, fraud/compliance and reconciliation.

### Square — general media and entertainment
- General video, music/culture content, podcasts, creators, live streams and entertainment discovery.
- Creator publishing, audience interaction and appropriate moderation.
- **Boundary:** general entertainment is separate from Bud's academic media and school resources.

### The Quarter — marketplace
- Product, food and service listings; seller/provider identity and storefronts.
- Search, categories, pricing, availability, inventory and seller terms.
- Carts, orders, pre-orders, payments, delivery/pickup and fulfilment.
- Order-linked conversations, receipts, tracking and status.
- Cancellations, refunds, disputes, ratings and support.
- **Boundary:** The Quarter owns marketplace records and fulfilment. Concierge may assist but cannot become the ledger or bypass seller terms.

### SouLync — dating and relationships
- Adults-only access controls and age-appropriate onboarding.
- Distinct dating profiles, preferences, discovery and recommendations.
- Likes and mutual interest, messaging, voice messages and eligible live calls.
- Consent, blocking, reporting, moderation, privacy and safety interventions.
- **Boundary:** separate from general Connect discovery; adults-only safeguards are mandatory before release.

### Wayward — open experience world
- Discover, create, organise and join trips, tours, meetups, concerts, sports, talent, music, training, challenges, social gatherings and other experiences.
- Public participation, open participation with criteria, request-to-join, organiser approval, invite-only, capacity-limited and paid/ticketed access.
- Friends can plan together while leaving places open to additional participants.
- Experience-specific profiles/settings: organiser, description, rules, location, schedule, participants, capacity, chat, applications/bookings, payments, progress and results as relevant.
- Track created, joined, saved, upcoming and past activities.
- Distinguish user-organised, co-organised and UNIBUD-organised experiences.
- Lifecycle: Draft → Published → Open → Confirmed → Active → Completed or Cancelled.
- Organiser control and clear participant terms.
- **Boundary:** not only an events directory, dating app, community directory, or forced two-person matching system. AI can assist but cannot silently approve, charge, book, override organisers or delete.

### Riff — open discussion
- Lightweight thread-feed topics, opinions, jokes, celebrity/music debates and casual conversation.
- Interest-based discussion and participation without forcing an education-only identity.
- Podcast and live formats may appear where appropriate, while content remains correctly categorised.
- **Boundary:** lightweight discussion, not a duplicate of the full Connect experience.

### Lync — purposeful engagement
- Streaks and continuity for user-defined reasons to connect, chat, learn or participate.
- Visible goals and shared intentions, with user control over reminders and privacy.
- **Boundary:** supports meaningful engagement; it must not manipulate users with coercive or noisy engagement loops.

### Concierge — conversational services
- Chat-first conversational interface and persistent conversation history.
- Discover and coordinate one-time services and multi-unit service packages.
- Packages can represent quantities and schedules (for example, four meals, weekly cleaning or monthly deliveries), not one generic subscription.
- Each arrangement tracks provider, customer, scope, price, payment, quantity/remaining units, schedule, fulfilment history, status, cancellation and renewal terms.
- Inline action summaries/cards complement chat; they do not replace it.
- Consequential actions require user confirmation and verified outcomes.
- **Boundary:** Concierge coordinates; the owning domain remains authoritative for orders, bookings, payments and fulfilment.

### The Fixer — private support
- Private personal, emotional and relationship support; listen first and offer options without forcing a path.
- Optional AI support, anonymous temporary human connection, or qualified professional pathways.
- Anonymous identity is protected and temporary unless both parties consent to continued connection.
- Professional qualifications, availability, requests, acceptance, pricing and session management.
- Emergency escalation, clear confidentiality limits, reporting and safeguards.
- **Boundary:** not a substitute for clinical care or emergency services.

## UNIBUD Operations — internal-only

- Organise physical experiences, workforce, contractors, suppliers, venues, transport and delivery.
- Departments include experience/community operations, workforce, transport/fleet, venue/supplier, booking/fulfilment, safety/trust, support, finance and administration.
- Worker identities include roles, status, permissions, region, availability, training and assignment history.
- Field representatives operate lawfully and accountably; no covert surveillance or impersonation.
- Fleet includes passenger cars, vans/minibuses, coaches, event/tour vehicles, delivery vehicles and special-access vehicles.
- Vehicle records include registration, ownership, capacity, driver, availability, maintenance, insurance, permits and roadworthiness.
- No dispatch without current required documentation and approvals.
- AI may recommend; authorised humans approve dispatch, spend, refunds and safety decisions.
- Operational lifecycle: request → eligibility/risk → operating plan → people/resources → approval → booking → delivery → incident handling → reconciliation → closure.
- **Boundary:** internal tools are not consumer spaces. Consumer roles never imply staff permissions.

## Independent Oracle Arc dependency

Oracle Arc is a separately bounded AI core, not merely a UNIBUD chatbot. It can serve UNIBUD and separately authorised My Realm Network applications.

- ORACLE: reasoning, evaluation and traceable decisions.
- SPARK: authenticated, consented, permitted, user- and app-scoped memory.
- ORBITS: controlled multimodal files, documents and audio with validation, malware scanning, limits and retention.
- CONCIERGE: authorised conversational workflows and confirmation.
- Agent registry, versioning, duty assignment, model routing, tool grants/revocation, quotas, usage, lifecycle and recovery.
- Provider-independent gateway, local-first inference preference, opt-in remote inference, secure server-side keys, fallback and spend controls.
- Evaluation for quality, groundedness, safety, latency, cost, regression, memory isolation and failure recovery.
- **Boundary:** Oracle Arc is independently deployable and governed. No cross-app memory or tool access by default.

## Delivery and traceability rule

1. Preserve every capability in this register even when delivery is staged.
2. Give each implemented capability an owning domain, API contract, data model, permission model and tests.
3. Mark integrations as unavailable until their external provider and credentials are actually configured.
4. Do not describe a placeholder, design document, mock screen or passing narrow test as a complete feature.
5. Update this register when scope changes; record deliberate removals or deferrals with rationale rather than silently dropping them.


## Account lifecycle and closure readiness
- **Implemented on the feature branch:** authenticated `GET /api/account/closure-readiness` derives identity from the validated session, aggregates the database closure preflight with owned/archived profiles, delegated relationships and incoming/outgoing profile transfers, and returns non-cacheable account-scoped data.
- **Implemented on the feature branch:** accessible account closure readiness page with blocker inventory, profile-management actions, loading/error/empty states and an explicit permanent-closure policy gate. Profile management links to the new experience.
- **Verified:** readiness builder tests cover active/archived profiles, active/suspended delegation, incoming/outgoing transfers, and the invariant that permanent closure remains disabled even when profile checks are clear. Full CI passed at code commit `b2204d568635db570924572c5f4c8b501abdff46` (PostgreSQL 16 migration/RLS, Oracle Arc API, typecheck, contract tests, server security tests, lint, profile browser E2E and production build).
- **Not implemented / not approved:** permanent account closure, deletion, data export, retention schedules, legal notices, content ownership rules, dependent transaction/provider record disposition, backup expiry, cooling-off/recovery windows, and production support operations. The page must never be treated as a closure authorization.
- **Release boundary:** no production deployment or production database change is part of this milestone. Full CI must pass on the feature branch before this work is considered verified.


## Account closure dependency and retention readiness

- **Implemented:** schema-grounded dependency inventory version `schema-inventory-1`, served through the existing authenticated `GET /api/account/closure-readiness` response and displayed in the account readiness page.
- **Verified schema boundary:** account identity, sessions, profile families, memberships, delegated grants/invitations, lifecycle notifications, ownership transfers and audit records are registered from migrations 0001–0017.
- **Not implemented / explicit blockers:** messaging, media, commerce/payments/bookings/contracts/disputes, education records, subscriptions and support/operations have no persisted domain schemas in migrations 0001–0017. They are not treated as empty.
- **Policy state:** every registered domain remains unclassified; every unimplemented domain blocks closure. No legal retention durations or deletion rights are inferred. The inventory is not a record-count query and does not claim row-level completeness.
- **Implemented:** migration 0018 adds read-only `public.account_dependency_discovery(UUID)`, called only after session validation through a signed account transaction. It returns aggregate counts for registered account/profile tables, including password credential and verification-challenge row counts without exposing hashes or challenge digests, shared relationship counts, and foreign-key topology; the UI presents the live results.
- **Test coverage added:** PostgreSQL test verifies account-scoped counts, FK metadata, fail-closed policy state and cross-account denial; web repository tests verify signed context, commit/rollback and connection release. The exact dependency-discovery base commit `ba5ed206240bd2a0db8617ced65501033575b09e` has successful Foundation, Oracle Arc API, and UNIBUD Web and Database workflow runs. A subsequent workflow review found that Foundation had stopped at migration 0017, so those green runs did not verify migration 0018. This branch now extends Foundation to execute migrations and SQL tests 0018–0019; fresh CI on the current PR head is still required.
- **Boundary:** counts cover only the allowlisted tables in migration 0018. They do not cover unimplemented spaces, JSON-only links, object storage, external providers, analytics, backups or support records. Retention durations remain unapproved; permanent closure remains disabled. No production database change or deployment is performed.
- See [Account Dependency and Retention Inventory](./ACCOUNT-DEPENDENCY-RETENTION.md).


### External dependency registry — foundation in progress

- **Implemented on feature branch `foundation/external-dependency-registry`:** migration 0019 adds a non-secret catalogue of repository-declared integration surfaces and an account-scoped opaque-reference registry protected by forced RLS.
- **Implemented:** signed-context RPC returns aggregate reference counts, per-domain counts and integration verification/capability metadata. The authenticated closure-readiness API includes this response using the validated session account.
- **Explicit evidence state:** the verification-delivery gateway and Oracle Arc catalogue entries remain `unknown`; a tracked environment template is not proof of live configuration or provider identity. Provider capability flags default to false.
- **Not implemented:** provider-specific adapters, actual object-store/event/payment/identity-provider inventory, deletion/export workflows or receipts, backup expiry, and the UI for the new response. These remain closure blockers, not zero-count domains.
- **Verification:** SQL and web repository tests have been added. Full CI for this new branch is pending; no passing result is claimed. Permanent closure remains disabled and no production changes are authorised.


### External dependency readiness experience — in progress

- **Implemented on `foundation/external-dependency-readiness`:** account closure readiness UI now displays registered external integrations and aggregate account reference counts with verified, unknown, unavailable and unclassified states. Policy gaps are reported separately.
- **Implemented:** provider adapter lookup and verification contracts use account-scoped opaque digests, reject stale or malformed evidence and fail closed when adapters are missing or fail.
- **Safety boundary:** no export or delete operations exist in the provider adapter contract; UI projection always reports export/deletion/closure unavailable. No provider is registered or contacted by this implementation.
- **Tests added:** missing provider, stale lookup and verification evidence, provider failure, unexpected references, shared participant ownership, state classification and fail-closed capability display.
- **Verification:** fresh CI for the exact branch head is required; no passing CI is claimed until workflows report completion for that SHA.


### Provider diagnostics and verification gateway transport hardening

- **Verified on PR #10:** the temporary internal diagnostic bearer gate requires at least 32 UTF-8 bytes, accepts exactly one bearer credential, rejects embedded whitespace/additional fields, and uses constant-time comparison for equal-length credentials. The Foundation, Oracle Arc API, and UNIBUD Web and Database workflows all passed on commit `8bde0050c2485f70ab04692f16c7af54855cbfa8`. This is a configuration gate only, not operator identity, session-derived RBAC, token rotation/revocation, or live provider verification.
- **Implemented on the next stacked feature branch:** verification gateway endpoint validation rejects embedded URL credentials, query strings and fragments; production requires HTTPS; non-production HTTP is limited to loopback development hosts. Focused tests cover these boundaries and verify that endpoint secrets are not exposed in diagnostic output.
- **Provider evidence remains unknown:** no vendor identity is inferred, no POST delivery is used as a health probe, and no email/SMS or verification code is sent. A provider-specific adapter and documented read-only health contract are still required before connectivity can be tested.
- **Release boundary:** all changes remain on unmerged feature branches. No production deployment, production credentials, production data, or `main` change is included.


### Session-derived Operations authorization (PR under review)

- Global Operations grants are stored separately from profile memberships. Tutor, Student, Institution, Creator, Page/Community and other profile roles do not grant internal Operations access.
- The verification-delivery metadata diagnostic now derives the actor only from the existing validated first-party session cookie, then checks the narrowly scoped database permission `integrations.verification_delivery.read`.
- Operator grants are provisioned and revoked only through a controlled database-administrator process. They support explicit role, permission allow-list, expiry and revocation. No public grant-management endpoint is introduced.
- Every diagnostic authorization decision is recorded through a narrow database function in an append-only audit table. The application role has no direct table access.
- **Verified at PR head `ba2c48a90ad0508b1fcb13991d277e87bcbe5432`:** Oracle Arc API, Foundation checks, and UNIBUD Web and Database GitHub Actions all completed successfully (run IDs 42885594693, 42885594784, 42885594658). The PR remains open/draft/unmerged; no production rollout is authorised. No operator grant is provisioned by the migration.
- **Still outstanding:** MFA/step-up, grant-management UI/workflow, audit search/export and alerting, independent live PostgreSQL migration/RLS proof, and actual provider identity/read-only health contract.


## Expanded product scope — Flow, The Quarter, AI interfaces and platform-wide requirements

The complete requirements and release boundaries are recorded in [EXPANDED_FINANCIAL_AI_AND_PLATFORM_CAPABILITY_SCOPE.md](./EXPANDED_FINANCIAL_AI_AND_PLATFORM_CAPABILITY_SCOPE.md). This is a preserved capability target, not a claim of implementation or live financial rails.

- **Flow:** full student banking target including accounts, ledger/reconciliation, transfers, virtual/physical debit cards, conditional credit cards, loans, savings, flex-money classification, buy-now-pay-later, FX and investments. Real issuance, lending, execution, custody and settlement require verified regulated partners, permissions, disclosures and production evidence.
- **The Quarter:** separate marketplace/order/merchant/refund domain; eligible pay-later checkout integrates with a regulated credit product without merging marketplace records into Flow's bank ledger.
- **Bud, The Concierge and The Fixer:** three distinct AI application interfaces with shared governed chat, multimodal, voice, search, tools, memory, privacy, safety and usage capabilities; each has separate role/tool grants and confirmation policy.
- **Oracle Arc:** remains the separate My Realm Network AI core; it is not a replacement name for the three interfaces.
- **Wayward:** non-wagering games/prize experiences only within UNIBUD. Real-money gambling is excluded from the teen/student product; any adult gambling service requires a separate 18+ product, independent licence/jurisdiction checks, identity, funds, compliance and responsible-gambling controls.
- **Every public app/site:** accessibility, responsive design, security, privacy, account/session lifecycle, support, observability, backup/recovery, testing, operational readiness and auditable admin separation are explicit platform capabilities.
- **Profile boundaries:** Student, Tutor and Institution remain distinct; Tutor and Institution remain non-public until their planned release gate. Institutions can manage eligible tutors and students only through explicit scoped delegation.

Implementation order: finish Operations security PR; establish module-specific capability matrices; build Flow's ledger/reconciliation and authorization before payment/card/credit UX; then regulated provider integrations; then The Quarter; then distinct AI interfaces; keep Wayward non-wagering. Each item requires tests, docs and exact-head CI.


## Central unfinished-work tracker

See [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md) for the cross-project status ledger, evidence requirements, external blockers, module-by-module unfinished work and mandatory definition of done. The tracker must be reviewed and updated at every implementation stage; it does not replace this capability register.


## Security hold — PR #15 database actor provenance

A high-priority database trust-boundary finding is tracked in [Issue #16](https://github.com/iamtheoracle/unibud/issues/16). Although the HTTP route uses a validated session account, migration 0020 exposes SECURITY DEFINER functions that accept caller-supplied account UUIDs. The app database role can therefore query permissions for another account directly and can forge actor attribution in audit calls. This does not meet the requirement for non-forgeable account context. PR #15 must remain unmerged until the database interface derives/verifies actor identity from a cryptographically trusted context and PostgreSQL negative impersonation/audit-forgery tests pass.


### Operations actor provenance remediation — pending verification

- Migration 0021 and the verification-delivery diagnostic route now use the existing HMAC-verified transaction context to derive the Operations actor. The application cannot pass an arbitrary account UUID to the permission or audit procedures.
- PostgreSQL tests cover forged account GUC rejection, audit attribution, unauthenticated unattributed audit events and revocation. The older migration-0020 SQL test has also been updated to the replacement function signatures.
- **Verification state:** Foundation PostgreSQL 16 and identity/RLS checks passed in run `42918389218`; Oracle Arc API tests passed in `42918389332`. Web/database migration validation, type checks and contract tests passed in `42918389306`, but server security unit tests failed 1/94 because a route contract assertion expected the validated account ID inline rather than through the correctly assigned `authenticatedAccountId` variable. The assertion was corrected in commit `6658dd12`; fresh exact-head CI is still required. Issue #16 remains open, PR #15 remains draft/open/unmerged, and no production rollout is authorised.


### Operations MFA — cryptographic core started, not active

- Implemented RFC 6238 TOTP primitives, encrypted seed envelopes using AES-256-GCM with account-bound associated data, provisioning URI generation, recovery-code generation and keyed recovery-code digests.
- Added unit coverage for RFC vectors, clock tolerance, replay-step handling, seed confidentiality/integrity, account binding, recovery-code uniqueness and malformed inputs.
- This is a cryptographic library only. Persistence, atomic replay prevention, single-use recovery redemption, enrollment and step-up routes, session assurance, operator UI, throttling, lockout, audit and end-to-end enforcement remain unimplemented. Operations MFA must be treated as **not enabled** until those layers are complete and verified.


### Operations MFA persistence schema — implemented, not active

- Added protected credential and recovery-digest tables in migration 0022. The schema supports pending/active credential state, enrollment expiry, confirmed timestamp, last accepted TOTP step, failed-attempt count/lock expiry and one-time recovery redemption timestamps.
- The tables are owned by the non-login Operations owner role; the application, readonly, auth and PUBLIC roles receive no direct table privileges.
- PostgreSQL integration tests and Foundation CI wiring are added. Exact-head CI for the new migration is pending.
- This is storage only. No application procedures, enrollment endpoints, session-bound step-up, replay-proof assertion, recovery consumption, UI or active MFA enforcement exists. Treat Operations MFA as **not enabled**.


### Exact-head verification update — 2026-11-11

- PR #15 branch head inspected: `c16e9e8cff39dc6926c11bc6b8c3851d52ca5604`.
- Exact-head CI passed: Foundation run `42925640430` (PostgreSQL 16 migrations/RLS isolation and Foundation integrity), Oracle Arc API run `42925640442`, and UNIBUD Web and Database run `42925640425` (PostgreSQL migration validation, type check, contract tests, server security unit tests, lint, profile browser E2E and production build).
- Migration 0021's signed-context Operations actor provenance remediation and migration 0022's protected MFA storage schema/test are included in that verified head.
- **Important boundary:** MFA remains disabled/not implemented end-to-end. Migration 0022 grants no application access to the MFA tables and exposes no enrollment, confirmation, verification, replay-prevention or recovery-consumption procedures. The TOTP cryptographic library and protected storage do not constitute an active second factor.
- Issue #16 still requires independent security review, secret-manager configuration review and production-like migration/recovery review. PR #15 remains open/draft/unmerged; no deployment or production migration is authorised.
- Next work is to inspect the actual session lifecycle and design a session-bound MFA challenge/assertion protocol before adding database procedures or routes. Do not accept account/session IDs or TOTP steps supplied by the client as trusted evidence.


### Operations MFA session-bound protocol — design checkpoint (2026-11-11)

- Current PR #15 head before this documentation update: `49cdefc2f1cd93c4783daabface3070c6dcd62dc`; all three exact-head workflows passed (Oracle Arc API `42925990785`, Foundation `42925990948`, UNIBUD Web and Database `42925990790`).
- Inspected the actual SessionService, session repository, auth RPC adapter, signed account-context helper, session routes, migrations 0001/0004/0008/0021/0022 and session lifecycle contract.
- Added [Operations MFA: session-bound step-up protocol](../security/OPERATIONS-MFA-SESSION-STEP-UP.md). The protocol requires versioned HMAC-authenticated account+session context, exact live-session binding, server-signed single-use TOTP assertions, atomic replay prevention, one-time recovery, reauthentication, lockout, negative/concurrency tests and per-request server-side enforcement.
- **Status: DESIGN ONLY.** The existing signed account context does not bind a session. Do not enable Operations MFA or claim step-up protection until the new session-bound context and database verifier, MFA procedures, server routes, UI, audit, tests and operational controls are implemented and reviewed.
- Next code slice: session-bound signed context plus PostgreSQL migration/negative tests. Do not proceed to MFA RPCs until that trust boundary is proven.


### Session-bound context implementation slice — 2026-11-11

- Added a server-only core primitive to create a versioned HMAC assertion binding account ID, persisted session ID, expiry and nonce; added a transaction helper to set both account and session claims locally in one transaction.
- Added unit tests for claim binding, invalid IDs/keys, transaction-local propagation, commit and rollback.
- **Not yet secure/active:** PostgreSQL does not yet verify the new session assertion; no database accessor or route integration exists. GUC values remain untrusted until the matching database verifier is implemented and tested.
- Code commit `a1a5d15e92828c043bfc81a6e7a396f8c322ac3e`; exact-head CI is pending. Next slice is the private PostgreSQL verifier/accessor plus negative SQL tests. No Operations MFA is enabled.


## Operations session-context trust boundary — 2026-11-11

**Building; exact-head verification pending.** Migration 0023 adds an independently verified, versioned HMAC claim binding account + persisted session + expiry + nonce. The database checks the signed account context, session ownership, active account, active/unrevoked session, idle expiry and absolute expiry. Operations authorization now requires that verified session, and audit events retain the verified session reference. The application role cannot directly execute the private verifier or read the signing key. The existing diagnostic route now signs context only from the account and session returned by server-side session validation. PostgreSQL tests cover signed context, forged session GUC, revoked session, account-only context, protected verifier/key access and unattributed unauthenticated events. This is not MFA: enrollment, TOTP verification, replay prevention, recovery, step-up expiry and enforcement remain unimplemented. Production key provisioning and independent security review remain pending.


### Independent Operations signing-key separation — 2026-11-11

The account context signer and session context signer are now separate. The app requires both UNIBUD_DB_CONTEXT_HMAC_KEY and UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY; PostgreSQL verifies them using separate private key tables. Only the NOLOGIN Operations owner can read the session verifier key table and execute the session accessor. PostgreSQL tests now use different test keys and reject a correctly signed but cross-account session pair and expired signed claims. Exact-head CI for this refinement is pending.


### Operations MFA session-bound step-up — 2026-11-11

Server-side signed MFA assertions now bind account, exact persisted session, purpose, time window, nonce and matched TOTP step using a distinct assertion key. Migration 0024 adds private assertion-key storage, protected nonce consumption and exact-session step-up records. The database consumes the assertion and advances the TOTP counter atomically; Operations permissions now fail closed without an active, unlocked MFA credential and current session step-up. PostgreSQL integration coverage is added to Foundation CI but exact-head CI is pending. Enrollment/challenge/reauthentication/recovery routes and UI, concurrency proof, lockout, key provisioning/rotation and independent security review are still incomplete. This is not an end-to-end active MFA service.


### MFA audit integrity and concurrent replay test — 2026-11-11

The database now derives the effective Operations audit outcome: app callers cannot write an "allowed" outcome unless current permission (including active MFA and exact-session step-up) is true. Tests cover denied/allowed outcome derivation. A two-connection PostgreSQL concurrency script now attempts the same signed assertion simultaneously and requires one success and one rejection; it is included in Foundation CI. Exact-head CI for this refinement is pending.


### Password-reauthenticated MFA enrollment start

A separate signed password_reauth assertion now binds fresh password verification to the validated account and exact session. Migration 0025 adds the protected pending-enrollment procedure and server-only encrypted-secret accessor. The enrollment-start route validates same-origin and the HTTP-only session, reauthenticates the current account using the existing password verifier and login rate limiter, encrypts a new TOTP seed, consumes the signed assertion in PostgreSQL, and returns a no-store provisioning URI. Pending credentials do not authorize Operations. Confirmation/activation, recovery-code persistence/display, challenge and recovery routes, lockout, UI and E2E remain outstanding; exact-head CI is pending.


### Password-reauthenticated enrollment CI checkpoint

Foundation PostgreSQL 16 migrations and tests, including migration 0025 and concurrent step-up replay proof, passed at checkpoint 17f1ee53a5dbcb5f61ac0c01d37860cbda035ea4. Oracle Arc API tests and web PostgreSQL migration validation passed; web typecheck, contract tests, server security tests and lint passed. Browser E2E and production build were still running. The enrollment route creates only pending MFA; it does not activate MFA or authorize Operations.
