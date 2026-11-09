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
| Account and identity | Registration, login, recovery, sessions, verification, account lifecycle, device/session controls | Migrations 0001–0004 and PostgreSQL 16 auth/RLS tests added; scrypt, verification, session, and registration/login/recovery orchestration cores implemented; production RPC adapters, routes, delivery, and cookie wiring pending |
| Profile families | Personal, creator, page/community; one account may own/manage several; explicit switching | Contracts and server-side profile service implemented; one-personal-profile invariant and delegated owner binding migrated; PostgreSQL 16 role-isolation tests pending latest CI; production repository adapter pending |
| Delegated access | Page admins, moderators, school/seller/provider roles; scoped grants and revocation | Exact-profile grant/revoke service implemented; delegated rows bound to canonical owner and grantor; owner/delegate/unrelated-account isolation test added |
| Discovery and search | People, profiles, communities, institutions, creators, services, opportunities, activities, content | Target |
| Messaging | Direct and contextual conversations, attachments, voice messages, safety controls | Target |
| Notifications | Meaningful, preference-aware, space-specific events; no noisy blanket notifications | Target |
| Media and files | Upload, playback, processing, permissions, scanning, retention, reporting | Target |
| Trust and safety | Reporting, blocking, moderation, appeals, age controls, abuse prevention, incident response | Target |
| Payments and bookings | Provider-backed transactions, confirmation, idempotency, reconciliation, refunds and disputes | Target |
| AI assistance | Oracle Arc integration with scoped memory, agent permissions, confirmation and audit | Designed |
| Accessibility and localisation | Responsive layouts, accessible interaction, language/currency/time-zone support | Target |
| Operations and observability | Audit, logs, metrics, alerts, backups, recovery, support tooling | Target |

### Identity onboarding
- First-party email/phone registration and login; no Google or Apple sign-up.
- Versioned terms and privacy acceptance; account identity is resolved from a verified session, never a caller-supplied account ID.
- Personal profile and owner membership are created idempotently; creator and page/community profiles remain separate profile families.
- **Status:** onboarding orchestration and acceptance persistence implemented; production repository adapter, route handlers, delivery provider, and cookie integration pending.

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
