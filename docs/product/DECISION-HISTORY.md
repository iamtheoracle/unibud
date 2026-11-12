# UNIBUD / My Realm Network — Product Decision History

**Purpose:** preserve the product decisions that define UNIBUD and Oracle Arc. This is a version-controlled decision register, not an audit log and not proof of implementation.
**Initial reconstruction:** decisions below were consolidated from the UNIBUD project discussions dated 2026-11-08 through 2026-11-09. Where an exact decision timestamp is unavailable, the date is deliberately recorded as a range.
**Current consolidated architecture:** [UNIBUD and Oracle Arc Master Plan](UNIBUD-ORACLE-ARC-MASTER-PLAN.md).

## How to maintain this history

- Append new decisions; do not delete or silently rewrite old ones.
- Each new entry needs a stable ID, date, status (PROPOSED / APPROVED / SUPERSEDED / REJECTED), decision, rationale, affected areas, dependencies and links to implementation PRs/issues/ADRs.
- If a decision changes, append a new entry and mark the earlier entry SUPERSEDED with a link to the replacement.
- Keep product decisions separate from implementation evidence and security audit records.
- Reconstructed entries are labelled as such. Ask for confirmation before upgrading an ambiguous recollection to APPROVED.
- Link important commits, migrations, PRs and releases to the relevant decision IDs.

## Reconstructed approved decisions

### DEC-001 — UNIBUD is a connected social and life platform, not only an academic app
- **Recorded:** 2026-11-08 to 2026-11-09
- **Status:** APPROVED
- **Decision:** UNIBUD serves students and young people across social relationships, academic life, communities, opportunities, services, commerce and student-focused finance.
- **Rationale:** academic functionality is important but should not define or restrict the whole platform.
- **Areas:** all UNIBUD modules, onboarding, navigation, product positioning.

### DEC-002 — One connected product with distinct embedded spaces
- **Recorded:** 2026-11-08
- **Status:** APPROVED
- **Decision:** modules should feel like purposeful mini-applications within one UNIBUD identity. They may have their own visual identity, settings and information architecture while sharing account, design foundations and navigation.
- **Rationale:** make the product feel integrated without mixing unrelated experiences or overwhelming users.
- **Areas:** Bud, Board, Connect, Quad, Square, Flow, The Quarter, SouLync, Riff, Wayward, Lync, Concierge, Fixer and Operations.

### DEC-003 — Board is academic-only and separate from the main social stream
- **Recorded:** 2026-11-08
- **Status:** APPROVED
- **Decision:** Board is the dedicated academic environment for school/campus discovery, student/tutor/institution connections, classes, study groups, assignments, tests/exams, saved academic materials, academic news, lecture videos and podcasts.
- **Rationale:** students should be able to reach and preserve academic materials without being distracted by unrelated social activity.
- **Areas:** Board, education identity, academic content and notifications.

### DEC-004 — Board and Connect have different jobs
- **Recorded:** 2026-11-08
- **Status:** APPROVED
- **Decision:** Board handles academic life; Connect handles broader relationships, discovery, communities, towns, creators, jobs/offers, services, food pre-orders, events, tournaments, tours and other real-world connection formats.
- **Rationale:** prevent academic and general social content from becoming one undifferentiated feed.
- **Areas:** Board, Connect, discovery, search and notifications.

### DEC-005 — Connect must remain extensible
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Connect is not limited to a fixed list of social formats. New experiences may be added if they preserve the common identity, privacy, age, moderation and permission framework.
- **Rationale:** avoid designing a closed product that can only support the examples initially discussed.
- **Areas:** Connect and future experiences.

### DEC-006 — Personal, Creator and Page/Community profiles are distinct
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Personal, Creator and Page/Community are separate profile families with their own fields, layouts, permissions and tools. One account may own/manage multiple eligible profiles and switch explicitly between them.
- **Rationale:** a creator or community identity should not be a cosmetic mode on a personal profile; ownership and authority must remain clear.
- **Areas:** identity, profiles, publishing, community administration, delegation.

### DEC-007 — Student, Tutor and Institution are distinct education identities
- **Recorded:** 2026-11-08 to 2026-11-09
- **Status:** APPROVED
- **Decision:** Student, Tutor and Institution are distinct education-domain identities. Tutor and Institution are private/non-public until their own release gates. Institution delegation must be scoped and auditable; authority over tutor records does not imply authority over student records, or vice versa.
- **Rationale:** education roles have different responsibilities, visibility and data protection requirements.
- **Areas:** Board, education identity, institution administration, delegation.

### DEC-008 — UNIBUD identity invitations replace manual account-ID exchange
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** users should be discoverable/invitable through their UNIBUD identity/handle where privacy settings allow, rather than needing to exchange internal account IDs.
- **Rationale:** account IDs are implementation details and should not be the user-facing identity mechanism.
- **Areas:** identity search, invitations, delegation, groups and communities.

### DEC-009 — Quad is the UNIBUD discovery space; no Guild concept
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Quad is the discovery experience. The earlier Guild concept is not part of the approved architecture.
- **Rationale:** retain one clear discovery model.
- **Areas:** Quad, search and navigation.

### DEC-010 — SouLync is a separate dating experience with age and safety gates
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** SouLync has its own dating experience, eligibility rules, age assurance, consent, moderation and safety boundaries.
- **Rationale:** dating interactions require protections beyond ordinary social discovery; minors must not be exposed to adult dating.
- **Areas:** SouLync, trust and safety, age assurance.

### DEC-011 — Riff, Lync and Wayward remain distinct experiences
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Riff has its own identity/conversation format and lifecycle; Lync represents visible streaks/goals/reasons to connect or study; Wayward supports non-wagering games and education-bill surprises in the teen/student release.
- **Rationale:** preserve the separate interaction models rather than flattening them into generic posts or feeds.
- **Areas:** Connect, Riff, Lync, Wayward.
- **Boundary:** real-money wagering is excluded from the teen/student release.

### DEC-012 — Flow is a financial app; The Quarter is the marketplace
- **Recorded:** 2026-11-08 to 2026-11-09
- **Status:** APPROVED
- **Decision:** Flow owns financial accounts and services; The Quarter owns marketplace discovery, merchants, listings, catalogue, orders and fulfilment. They may integrate through approved checkout/payment contracts but do not share a shadow ledger.
- **Rationale:** banking/financial records and commerce catalogues/orders are different domains with different controls.
- **Areas:** Flow, The Quarter, payments and reconciliation.

### DEC-013 — Flow has a broad student-finance vision and Nigeria-first path
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Flow's intended scope includes accounts, transfers, tuition, cards, savings, credit, loans, Flex, BNPL, FX, remittance and investments, beginning with a Nigeria-first plan and later jurisdictional expansion.
- **Rationale:** provide a coherent student financial experience rather than a simple wallet.
- **Areas:** Flow, financial ledger, partnerships, legal and compliance.
- **Boundary:** no live regulated financial execution is claimed without licensed partners, contracts, jurisdictional review and operational evidence.

### DEC-014 — Bud, Concierge and Fixer are separate AI experiences
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Bud is the social companion; Concierge researches and prepares authorised bookings/orders/purchases; Fixer troubleshoots, researches and executes approved tasks. They may share Oracle Arc infrastructure but must have distinct interfaces, permissions, memory scopes and tool policies.
- **Rationale:** a shared AI backend must not collapse distinct user expectations or grant every agent the same authority.
- **Areas:** Bud, Concierge, Fixer, Oracle Arc.

### DEC-015 — Oracle Arc is a separate My Realm Network AI core
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Oracle Arc is an independent AI platform core for UNIBUD and future My Realm Network applications, not simply a UNIBUD chatbot.
- **Rationale:** provide reusable, governed intelligence while keeping application data and permissions isolated.
- **Areas:** Oracle Arc, Bud, Concierge, Fixer and future network apps.

### DEC-016 — Oracle Arc has Oracle, SPARK and ORBITS responsibilities
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Oracle is the reasoning/evaluation/traceability layer; SPARK is authenticated app-scoped memory; ORBITS is controlled multimodal processing.
- **Rationale:** separate reasoning, memory and media processing so each can be governed, tested and secured.
- **Areas:** Oracle Arc architecture and all AI agents.

### DEC-017 — Local-first inference with governed remote fallback
- **Recorded:** 2026-11-09
- **Status:** APPROVED direction; hardware details UNRESOLVED
- **Decision:** prefer local inference when suitable; remote inference must be governed and restricted. Ollama and Qwen 2.5 7B were discussed as a proposed early local stack, not as verified installed hardware/runtime.
- **Rationale:** improve control over privacy, cost and availability while retaining a deliberate fallback path.
- **Areas:** Oracle Arc model gateway, infrastructure, security and cost controls.
- **Unresolved:** local hardware capacity, model evaluation, hosting and production routing.

### DEC-018 — Authentication and database ownership prioritise user safety
- **Recorded:** 2026-11-09
- **Status:** APPROVED direction
- **Decision:** first-party email/password authentication, on-device verification code and no Google/Apple/guest shortcut; PostgreSQL should be controlled by the project with server-derived identity and strict account isolation.
- **Rationale:** retain control over identity, data and security boundaries.
- **Areas:** authentication, PostgreSQL, RLS, sessions, backups and recovery.
- **Unresolved:** production delivery provider, credentials, deployment environment and operational ownership details.

### DEC-019 — No bottom navigation; calm, integrated navigation
- **Recorded:** 2026-11-08
- **Status:** APPROVED direction
- **Decision:** no conventional bottom navigation; use a discreet back/minimise navigation concept inspired by My Realm. Disable accidental pinch zoom where appropriate, and use the agreed Oracle-style typography direction.
- **Rationale:** maintain immersion and reduce interface clutter.
- **Areas:** design system, responsive navigation and accessibility.
- **Note:** the final interaction and accessibility behaviour still requires usability validation.

### DEC-020 — Teen/student release excludes real-money gambling
- **Recorded:** 2026-11-09
- **Status:** APPROVED
- **Decision:** Wayward is non-wagering for the teen/student release. Any future adult gambling product, if ever considered, must be a separate 18+ product with licensing, age assurance, jurisdictional controls, KYC/AML, segregated funds and responsible-gambling safeguards.
- **Rationale:** prevent gambling exposure and financial harm in a youth-oriented platform.
- **Areas:** Wayward, Flow, legal, age assurance and trust/safety.

## Implementation history pointers

- **Authentication and profile foundations:** see the migration history, implementation tracker and capability register. These are implementation artefacts and may contain work completed after the original product decisions.
- **Operations MFA:** migrations 0021–0040 and their tests are tracked in the security contract and implementation tracker. Migration 0021 removes actor-selectable Operations authorization/audit interfaces in favour of cryptographically verified transaction identity; migration 0040 adds database-side overlapping HMAC verifier keys. Application-level versioned TOTP seed-encryption overlap is documented separately. This is a privileged platform-security workstream, not the full Operations product.
- **Oracle Arc:** API and infrastructure work must be linked to Oracle Arc decisions above; a passing API test does not prove a deployed model runtime.
- **Master scope:** see [UNIBUD-ORACLE-ARC-MASTER-PLAN.md](UNIBUD-ORACLE-ARC-MASTER-PLAN.md).

## New decision template

```md
### DEC-XXX — Short decision title
- **Recorded:** YYYY-MM-DD
- **Status:** PROPOSED / APPROVED / SUPERSEDED / REJECTED
- **Decision:**
- **Rationale:**
- **Alternatives considered:**
- **Affected areas:**
- **Dependencies / risks:**
- **Supersedes / superseded by:**
- **Implementation evidence:**
```

### DEC-021 — User-selectable OTP delivery transports
- **Recorded:** 2026-11-12
- **Status:** APPROVED
- **Decision:** Phone-based OTP challenges may be requested over SMS, WhatsApp or RCS; email-based OTP challenges remain email-delivered. The authentication identity remains the verified email address or E.164 phone number and is distinct from the delivery transport. Existing phone flows default to SMS when no transport is specified.
- **Rationale:** provide accessible delivery choices without coupling account identity to a messaging provider or forcing a single channel.
- **Alternatives considered:** provider-specific client integrations (rejected; provider credentials and routing remain server-side behind the verification gateway).
- **Affected areas:** registration, verification resend, password recovery, verification gateway, abuse controls and delivery operations.
- **Dependencies / risks:** the configured gateway must implement the declared `deliveryMethod` contract and independently verify WhatsApp/RCS sender registration, template/consent requirements, destination eligibility, delivery receipts, retries and regional availability. RCS support varies by carrier/device. No provider has been selected or verified by this code change.
- **Supersedes / superseded by:** none.
- **Implementation evidence:** PR #15, OTP delivery-method contract in verification services and signup/recovery interfaces; external provider integration remains NOT VERIFIED.


### DEC-022 — Flow and MoneyLead financial integration boundary
- **Recorded:** 2026-11-12
- **Status:** APPROVED
- **Decision:** Flow remains the customer-facing financial experience and card identity inside UNIBUD. MoneyLead remains a separate banking institution/platform with independent applications, infrastructure, records, products and commercial opportunities. UNIBUD financial actions must use a common server-enforced transaction-specific authorization protocol. AI agents and plugins may prepare instructions but cannot authorize or finalize them. Banking data is not social-platform data and is exposed only through narrow, authenticated, consented interfaces.
- **Rationale:** deliver a connected financial experience without collapsing product identities, compromising customer consent or creating unrestricted cross-platform access.
- **Alternatives considered:** relabel Flow as MoneyLead or merge both applications/data stores (rejected by founder direction).
- **Affected areas:** Flow, MoneyLead integration gateway, Identity/Sessions, Concierge, Oracle Arc tools, plugins, The Quarter, Wayward and financial audit.
- **Dependencies / risks:** canonical UNIBUD currently has no Flow payment implementation or verified payment provider. Legacy wallet code is not a safe ledger. Transaction PIN/device-bound authorization, immutable journal, idempotency, limits, risk controls, provider evidence, reconciliation and regulatory arrangements must be implemented/verified before live use.
- **Supersedes / superseded by:** none.
- **Implementation evidence:** Issue #17; audit artifact `docs/financial/FLOW-MONEYLead-UNIBUD-PAYMENT-ARCHITECTURE-AUDIT.md`; implementation remains in progress.

### DEC-023 — Flow's journal is a settlement mirror, not a second bank ledger
- **Recorded:** 2026-11-12
- **Status:** APPROVED
- **Decision:** Flow owns its customer-facing account mapping, payment instructions, transaction authentication challenges and audit/lifecycle state. MoneyLead remains independent and is the intended authoritative banking ledger and settlement boundary. Flow may maintain an immutable, balanced mirror of verified MoneyLead settlement events, but that mirror must never be used as a spendable-balance source or as an independent authority to debit, credit or settle customer funds.
- **Rationale:** preserve Flow's identity and useful first-party financial domain without creating competing balances or a shadow bank ledger. An integration boundary must be explicit before transfers or settlement ingestion are enabled.
- **Areas:** Flow, MoneyLead gateway, transaction security, journal/reconciliation.
- **Implementation reference:** migration `0048_flow_domain_and_settlement_mirror.sql`; test `0048_flow_domain_and_settlement_mirror.test.sql`; PR branch `foundation/flow-domain-ledger-v1`.
- **Release boundary:** no MoneyLead repository or verified integration contract was available during implementation. No ingestion role privileges, provider activation, live transfers, or production financial operation are enabled.

