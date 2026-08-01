# UNIBUD OS — Core Architecture v1.0

> **Status:** ❄️ FROZEN · **Version:** 1.0 · **Date:** 2026-08-01
>
> This is the **single source of truth** for the UNIBUD platform — for Base44 now and for UNIBUD's own engineering platform later. No new constitutions are added after this point. Changes go through **versioned revisions** (v1.1, v1.2, …; v2.0 for breaking changes).
>
> Organized into **10 Volumes + Appendices** so every future engineer and every AI authority has one authoritative reference instead of dozens of separate prompts.

---

## Table of Contents

| Volume | Title |
|---|---|
| [Volume 1](#volume-1--vision-principles-governance) | Vision, Principles, Governance |
| [Volume 2](#volume-2--oracle-bud-command-authorities-agents) | Oracle, Bud, Command Authorities, Agents |
| [Volume 3](#volume-3--kernel-execution-synchronization-workflow) | Kernel, Execution, Synchronization, Workflow |
| [Volume 4](#volume-4--identity-authentication-authorization-security) | Identity, Authentication, Authorization, Security |
| [Volume 5](#volume-5--academic-platform) | Academic Platform |
| [Volume 6](#volume-6--communities) | Communities |
| [Volume 7](#volume-7--institutions) | Institutions |
| [Volume 8](#volume-8--engineering-platform) | Engineering Platform |
| [Volume 9](#volume-9--developer-platform) | Developer Platform |
| [Volume 10](#volume-10--deployment-operations-monitoring) | Deployment, Operations, Monitoring |
| [Appendices](#appendices) | Constitutions, Events, Syscalls, Repositories, Data Models |
| [Verification Checklist](#v10-freeze-verification-checklist) | All 22 pre-freeze verification areas |

---

# Volume 1 — Vision, Principles, Governance

## 1.1 Vision

UNIBUD is an intelligent, multi-dimensional University Operating System that unifies the social, academic, professional, and operational life of a university into one premium, AI-native experience — governed invisibly by Oracle and accessed through Bud, the trusted companion.

## 1.2 Mission

To save every student time, reduce stress, and improve academic success by orchestrating all campus systems, relationships, and opportunities through a single, calm, intelligent interface that feels personal rather than institutional.

## 1.3 Design Principles

1. **Intelligence-first** — every surface anticipates the user's next need.
2. **Premium calm** — dark, glassmorphic, spacious; never corporate.
3. **Bud as the universal interface** — consolidate actions into the companion; keep the backend invisible.
4. **Oracle as invisible governor** — no exposed login pages or public admin dashboards.
5. **Tenant-isolated** — `institution_id` scoping + Row-Level Security on every entity.
6. **Modular independence** — each capability is an independently maintainable module.
7. **Demonstrable value** — every feature saves time, reduces stress, or improves outcomes.
8. **Founder-orchestrated autonomy** — Oracle routes work to specialist agents; admins never assign manually.
9. **Platform-native** — build on Base44 primitives; do not reinvent platform-owned infrastructure.
10. **Accessible by default** — reduced motion, high contrast, text scaling, keyboard navigation.

## 1.4 Core Philosophy

The platform operates as a **living operating system**, not a collection of static apps. Bud is a supportive mentor — never referred to as an AI, GPT, LLM, or chatbot. Oracle governs silently. Every experience is student-centric and autonomous.

## 1.5 Platform Objectives

- Unify academic, social, professional, and operational domains in one OS.
- Deliver an Apple-quality, US-banking-grade welcome and daily experience.
- Enforce a 16-level Oracle Executive Authority governance hierarchy.
- Maintain autonomous AI intelligence across a unified design language.
- Maximize glass and mirror UI effects throughout all components.
- Operate every capability through Bud as the single entry point.

## 1.6 Terminology

| Term | Definition |
|---|---|
| **Bud** | The user-facing trusted companion / mentor (never "AI", "chatbot"). |
| **Oracle** | The hidden executive authority coordination intelligence. |
| **Spark** | The multi-agent orchestration engine. |
| **Authority Code** | A verification token granting a specific executive scope. |
| **Institution** | A tenant university; data is scoped by `institution_id`. |
| **RLS** | Row-Level Security — per-entity access control. |
| **Founder** | The platform owner with full Oracle authority (A0). |
| **CCL** | Command Connection Layer — Bud → Oracle → agent routing protocol. |
| **UDS** | UNIBUD Design System — the tokenized component library. |
| **Midnight** | The dark-only design language (Deep Midnight Blue foundation). |

## 1.7 Governance Constitution

### Core Constitution
The platform is a living OS. All engineering, design, and operations are orchestrated autonomously by Oracle and specialist agents per the Master Builder Constitution. Oracle is invisible. All sessions are authenticated and routed via Oracle's invisible logic. Founders/admins never manually assign work to agents.

### Governance Constitution
Oracle enforces a 16-level (A0–A4 tier) executive authority hierarchy with 27 authority codes. Human administrators interact exclusively with Bud to delegate tasks to background agents. Every executive action is audit-logged. Authority codes are hash-verified with replay protection.

### Experience Isolation Constitution
Each portal (User, Operator, Institution, Founder, Developer) is an independent experience. No portal interferes with another. Portals are gated by `OracleWorkspaceGuard` and role-based access.

### Native Engineering Constitution
Build exclusively on Base44 primitives. Do not reinvent platform-owned infrastructure (ORM, auth backend, API server, vector store, model loader). Logic shared by multiple backend functions lives in `base44/shared/` modules. Backend functions are the only integration layer for external APIs without built-in integrations.

### Progressive Experience Constitution
Onboarding is conversational and progressive — Bud captures identity contextually rather than through multi-step forms. Experiences load progressively; autosave and clear feedback are standard.

### Adaptive Visibility Constitution
Navigation adapts to context: `AdaptiveNav` surfaces relevant tabs per screen. `FloatingNav` provides persistent top navigation. The Ecosystem Rail offers accessibility toggles. `ContextPulse` and `EdgeContextSwipe` provide contextual surfacing. Classroom mode gates Bud when appropriate.

---

# Volume 2 — Oracle, Bud, Command Authorities, Agents

## 2.1 Oracle Kernel

The hidden executive authority coordination intelligence. Oracle is never exposed publicly — no login pages, no public dashboards. All Oracle pages are gated by `OracleWorkspaceGuard`.

**Implementation:** `src/lib/oracle/`
- `orchestrationEngine.js` — core coordination logic
- `executiveMode.js` — executive authority state
- `authorityCodes.js` — 27 authority codes, 5 tiers (A0–A4)
- `authorityLevels.js` — hierarchical level definitions
- `healthMonitor.js` — platform health scanning
- `specialistAgents.js` — agent registry
- `managementCenters.js` — management center mappings
- `engineeringDirective.js` / `engineeringConstitution.js` — engineering governance

**Backend:** `verifyAuthorityCode` (hash-verified, replay-protected), `logExecutiveAction` (audit trail), `oracleHealthScan` (health scanning).

## 2.2 Bud Shell

The user-facing trusted companion. Never referred to as AI/chatbot. Accessed via `BudCompanion`, `BudLivingOrb`, `BudPanel`, `BudHome`.

**Implementation:** `src/lib/bud/`
- `orchestrator.ts` — conversation orchestration
- `conversation.ts` — conversation state
- `personality.ts` — Bud's voice and personality
- `constitution.ts` — behavioral constitution
- `prompts/systemPrompt.ts` — system prompt
- `context/buildContext.ts` — context assembly
- `actions/` — `reason.ts`, `recallMemory.ts`, `searchKnowledge.ts`, `planIfNeeded.ts`, `storeInteraction.ts`, `generateResponse.ts`
- `adapters/` — `liveSparkAdapter.ts`, `sparkPort.ts`

**Frontend:** `src/components/bud/` — companion UI, orb, panel, voice mode, memory timeline, context cards, categories, suggested prompts, quick actions.

## 2.3 Command Connection Layer (CCL)

The routing protocol: Bud (user input) → Oracle (authority validation + routing) → specialist agent (execution) → Bud (formatted response).

**Flow:**
1. User speaks to Bud
2. Bud validates input via guardrails
3. Bud builds context (`buildContext.ts`)
4. Orchestrator routes to Oracle or direct LLM
5. If executive action → authority code verification (`verifyAuthorityCode`)
6. Specialist agent executes (via Spark orchestrator)
7. Response formatted and filtered through guardrails
8. Bud delivers to user
9. Interaction stored (`storeInteraction.ts`)

## 2.4 Command Authorities

27 authority codes across 5 tiers:

| Tier | Level | Scope |
|---|---|---|
| A0 | Founder | Full platform control |
| A1 | Executive | Platform-wide governance |
| A2 | Administrative | Institution-wide management |
| A3 | Operational | Department/feature management |
| A4 | Supervisory | Read-only oversight |

**Verification:** Hash-based (no plaintext storage), deduplication, replay protection. `ExecutiveVerificationGate` component enforces at the UI level. `logExecutiveAction` records every use.

## 2.5 Super Agents (In-App Agents)

Configured in `base44/agents/`:

| Agent | File | Domain |
|---|---|---|
| Bud | `bud.jsonc` | User companion |
| Oracle | `oracle.jsonc` | Platform governance |
| Spark | `spark.jsonc` | Orchestration |
| Study | `study.jsonc` | Academic assistance |
| Career | `career.jsonc` | Professional development |
| Campus | `campus.jsonc` | Campus life |
| Quad | `quad.jsonc` | Social feed |
| Pulse | `pulse.jsonc` | Analytics & insights |
| Library | `library.jsonc` | Knowledge & resources |
| Admin | `admin.jsonc` | Administration |
| Search | `search.jsonc` | Information retrieval |
| Security | `security.jsonc` | Security monitoring |
| Notification | `notification.jsonc` | Notification dispatch |

## 2.6 Worker Agents

`SparkAgent` entity registry — each with `agent_id`, `name`, `division`, `role`, `responsibilities`, `tools`, `permissions`, `input_schema`, `output_schema`, `validation_rules`, `success_criteria`, `failure_handling`, `retry_max`, `handoff_rules`, `dependencies`.

**Implementation:** `src/lib/spark/agents/` (definitions, registry, runner). `src/lib/oracle/specialistAgents.js`.

## 2.7 AI Registry

`SparkAgent` entity (admin-managed). Oracle sections: `SparkAgentRegistry` (manage agents), `SparkAgentObservability` (monitor runs).

## 2.8 AI Memory

`BudMemory` entity (episodic, semantic). `useBudMemory` hook. `MemoryDashboard` page. Context built in `src/lib/bud/context/buildContext.ts`.

## 2.9 AI Learning & Collaboration

- **Learning:** `LearningPath` entity + `src/lib/spark/learning/`. `src/lib/bud/actions/` for reasoning, planning, knowledge search.
- **Collaboration:** `src/lib/spark/orchestrator.js` — multi-agent orchestration. `SparkExecutionLog` for run tracking. `src/lib/oracle/orchestrationEngine.js`.

## 2.10 AI Lifecycle

Agent configs versioned in `base44/agents/*.jsonc`. Fields: `enabled`, `order`, `retry_max`, `failure_handling`, `handoff_rules`. Observability via `SparkAgentObservability` + `SparkExecutionLog`.

---

# Volume 3 — Kernel, Execution, Synchronization, Workflow

## 3.1 Core OS Component Mapping

Concepts from prior monorepo blueprints (runtime, workflow-engine, repository-engine, event-bus, scheduler, queues, synchronization, monitoring, logging, diagnostics, recovery) are **implemented natively by the Base44 platform** — not as separate packages.

| OS Component | Native Implementation |
|---|---|
| **Oracle Kernel** | `src/lib/oracle/` |
| **Bud Shell** | `src/lib/bud/` |
| **Command Connection Layer** | `src/lib/bud/orchestrator.ts` → `InvokeLLM` → agent routing |
| **Intelligent Execution Layer** | `base44/agents/` + `src/lib/spark/` |
| **Event Bus** | Entity realtime subscriptions (`entity.subscribe`) |
| **Workflow Engine** | `base44/workflows/` (CNCF SWF v1.0) |
| **Scheduler** | Scheduled workflow triggers + reminder backend functions |
| **Repository Manager** | `base44.entities.<Name>` SDK |
| **Memory Engine** | `BudMemory` entity + hooks |
| **Knowledge Engine** | `src/lib/knowledge/` + `KnowledgeHub` |
| **Synchronization Engine** | Entity realtime subscriptions + sync functions |
| **Runtime Engine** | Base44 platform runtime (Vite + React; Deno backend) |
| **Monitoring** | `CrashReport`, `AuditLog`, `ProviderLog`, `AIServiceMetric` |
| **Logging** | `ProviderLog` entity + structured console |
| **Diagnostics** | `SparkExecutionLog` entity |
| **Recovery** | Platform-owned (backups, failover) |

## 3.2 Boot Process

```
App Launch
    │
    ▼
Splash (logo animation, < 2s)
    │
    ▼
Auth Check (base44.auth.isAuthenticated)
    │
    ├── Not authenticated → Welcome → Login / Register → OTP → MeetBud → ModeSelector
    │
    └── Authenticated → OracleAuthRouter (role detection)
                              │
                              ▼
                         Correct Portal
```

## 3.3 Event Bus

Entity realtime subscriptions:
```js
const unsubscribe = base44.entities.Todo.subscribe((event) => {
  // event: { id, type: 'create'|'update'|'delete', data }
});
```
Connector webhook events via workflow triggers. `WebhookEvent` entity for financial webhooks.

## 3.4 Workflow Engine

CNCF SWF v1.0 workflows in `base44/workflows/`. Supports: scheduled, entity, connector, in_app_agent, app_user_auth, app_publish triggers; call, wait, switch task types; durable waits; jq branching.

**Existing workflows (8):** Bud Notification Engine, Bud Reminders, Deadline Reminders, Event Reminders, Study Streak Reminders, Exam Countdown, Welcome New Student, Outreach Follow-up, University Connect Background Sync, Activate Scheduled Announcements, Study Group Message/Task Notifications, Task Deadline Reminders.

## 3.5 Scheduler

Scheduled workflow triggers (cron, interval, one-time). Backend functions for reminder cadence: `deadlineReminders`, `eventReminders`, `examReminders`, `streakReminders`, `budReminders`, `taskReminders`.

## 3.6 Repository Manager

Entity SDK operations: `list`, `filter`, `get`, `create`, `update`, `delete`, `bulkCreate`, `bulkUpdate`, `updateMany`, `deleteMany`, `subscribe`. No separate repository classes — the SDK is the repository layer. Domain wrappers: `src/lib/academic/academicApi.js`, `src/lib/social/socialApi.js`, `src/lib/finance/*`.

## 3.7 Synchronization Engine

- Entity realtime subscriptions (live sync)
- `universityConnectSync` / `universityConnectBgSync` (institution data sync)
- `googleCalendarSync` (calendar sync)
- `studyGroupEventBridge` (study group events)

---

# Volume 4 — Identity, Authentication, Authorization, Security

## 4.1 Welcome & Authentication Experience

### Design Philosophy
The first impression must be inspired by high-trust banking apps (Chase, Capital One, American Express, Revolut) — **clean, fast, and reassuring** — while remaining original to UNIBUD. Premium. Minimal. Apple quality.

### App Launch Flow

```
UNIBUD Logo Animation (< 2s)
        │
        ▼
Welcome Screen
  "Welcome to UNIBUD"
  Learn. Connect. Thrive.
  [ Sign In ]  [ Create Account ]
  ☐ Keep me signed in on this device
  ☑ Use Face ID / Fingerprint when available
        │
        ▼
Authentication
        │
        ▼
Role Detection (OracleAuthRouter)
        │
        ▼
Correct Portal
```

### Welcome Screen Specification

| Element | Specification |
|---|---|
| Logo | Reserved `{{UNIBUD_PRIMARY_LOGO}}` — Founder-supplied, never generated |
| Headline | "Welcome to UNIBUD" |
| Value statement | "Learn. Connect. Thrive." |
| Sign In button | Primary CTA |
| Create Account button | Secondary CTA |
| "Keep me signed in" | Toggle, **off by default** on shared/public devices |
| "Use Face ID / Fingerprint" | Toggle, opt-in, only functional when platform supports |
| Language selector | Reserved (i18n — see known gaps) |
| Accessibility options | Ecosystem Rail toggles (motion, contrast, text size) |
| Theme selector | Dark-only (Midnight); light theme deferred |
| Privacy notice | Link to `/privacy` |
| Terms acknowledgement | Link to `/terms` |
| Animation | Under 2 seconds total |

### Sign In Screen Specification

| Element | Specification |
|---|---|
| Email / Username | Required |
| Password | Required, masked |
| Forgot Password | Link to `/forgot-password` → `resetPasswordRequest` |
| Biometric Login | Toggle (Face ID / Touch ID / Fingerprint) — **platform-dependent** |
| Multi-Factor Authentication | **Platform-dependent** — not natively available |
| Trusted Device support | **Platform-dependent** — `Device` entity exists, trust management limited |
| "Keep me signed in on this trusted device" | Opt-in only — **never auto-enabled** |
| Session Management | Platform-owned (tokens, sessions) |
| Security notice | Visible to user |

### Critical Security Rule: "Keep me signed in" Does NOT Bypass Security

"Keep me signed in" extends session convenience **only**. It never bypasses security for sensitive actions. The following actions **always** require re-authentication regardless of session persistence:

| Sensitive Action | Required Verification |
|---|---|
| Changing password | Re-authentication (current password) |
| Managing finances (payments, transfers, wallet) | Biometric or MFA (when available); re-auth otherwise |
| Altering permissions / role assignments | Authority code + re-authentication |
| Executive authority actions | Authority code verification (`verifyAuthorityCode`) |
| Account deletion | Re-authentication + explicit confirmation |
| Security settings changes | Re-authentication |
| Data export (sensitive) | Re-authentication |

**Implementation note:** The platform's auth schema manages sessions at the platform level. A user-controlled "keep me signed in" toggle and biometric/MFA gating for sensitive actions are **platform-dependent** and documented as known limitations. The UI reserves these controls; they activate when the platform supports them. Until then, sessions follow platform defaults.

### Authentication Flow (Registration)

```
Register (email + password)
    │
    ▼
Does NOT log in — user is unverified
    │
    ▼
OTP sent to email
    │
    ▼
verifyOtp({ email, otpCode })
    │
    ▼
Returns access_token → setToken → hard redirect
    │
    ▼
MeetBud → ModeSelector → OnboardingConversation
    → OnboardingSecurity → OnboardingPreparing → OracleAuthRouter
```

**Critical:** Never call `loginViaEmailPassword` after register — unverified users get a broken session. OTP is mandatory.

### Separate Authentication by Role

| Role | Auth Path | Portal |
|---|---|---|
| **User (Student)** | `Login.jsx` / `Register.jsx` | `AppShell` routes (`/home`, `/bud`, etc.) |
| **Operator** | Login → `OracleWorkspaceGuard` | `/operator` |
| **Administrator** | Login → `OracleWorkspaceGuard` | `/oracle`, `/management`, `/admin` |
| **Founder** | Login → A0 authority code verification | `/oracle` (full access) |
| **Developer** | Login → `OracleWorkspaceGuard` | `/architect` |

All use the same platform auth backend; portal routing is role-gated.

### Known Platform Limitations (Documented)

- Biometric login (Face ID / Touch ID / Fingerprint) — not natively available
- Multi-Factor Authentication (MFA) — not natively available
- Trusted-device management — `Device` entity exists, full trust management is platform-dependent
- User-controlled "keep me signed in" toggle — platform manages sessions
- Email change/verification flow — cannot be implemented natively on current Auth schema

These are **deferred until the platform supports them**. The UI reserves the controls; they are non-functional until then.

## 4.2 Identity

| Component | Implementation |
|---|---|
| **User entity** (built-in) | id, email, full_name, role, created_date |
| **StudentIdentifier** | Matriculation number, student ID |
| **StudentRecord** | Academic record |
| **DigitalBadge** | Achievement badges |
| **KYCRecord** | Financial identity verification |
| **ConsentLink** | Consent management (keyed by `{{user.id}}`) |

## 4.3 RBAC

- `Role` entity + `OperatorRole` + `OperatorAssignment`
- User.role defaults: 'admin' / 'user' (freely customizable)
- RLS `user_condition: { role: "admin" }` patterns for admin-only operations
- `OperatorAssignment` for operator task routing

## 4.4 Sessions

Platform-owned: tokens, sessions, email verification. `base44.auth` SDK: `isAuthenticated()`, `me()`, `updateMe()`, `logout()`, `redirectToLogin()`.

## 4.5 Security Constitution

- RLS on every entity; no open writes
- `SecurityCenter` page, `SecurityEvent`, `Device`, `ApiKey` entities
- Authority code verification (hash-based, replay-protected)
- Crash reporting via `CrashReport` entity
- Consent management keyed by `{{user.id}}`
- `ContentReport` + `TrustScore` for community moderation
- `matriculationPrivacy.js` governs academic record visibility

### RLS Patterns

| Pattern | Rule Shape | Usage |
|---|---|---|
| Ownership | `created_by_id: "{{user.id}}"` | User-owned records |
| Role-based | `user_condition: { role: "admin" }` | Admin-only operations |
| Tenant | `data.institution_id: "{{user.data.institution_id}}"` | Institution scoping |
| Member-based | `data.member_ids: "{{user.id}}"` | Collaboration visibility |
| Status-based | `data.status: "published"` | Public content |
| User-scoped | `data.user_id: "{{user.id}}"` | Personal data (notifications, presence) |

### Privacy Constitution

- Student-centric autonomous OS model (no parent/guardian portals)
- Presence "offline" status hides user from peer reads
- `matriculationPrivacy.js` governs academic record visibility
- `ConsentLink` entity for consent management

### Compliance Constitution

- `AuditLog` entity for all executive actions
- `KYCRecord`, `RefundRequest`, `PaymentAttempt`, `WebhookEvent` for financial compliance
- `VerificationRequest` entity for identity verification
- All financial transactions tracked with `FinancialTransaction` + `WalletLedger`

---

# Volume 5 — Academic Platform

## 5.1 Module Registry

| Module | Entity | Route |
|---|---|---|
| **Courses** | `Course`, `CourseMaterial`, `CourseMaterialProgress` | `/courses`, `/course/:id` |
| **Assignments** | `Assignment` | `/assignments` |
| **Projects** | `Project`, `FYPProject`, `ResearchProject` | `/projects` |
| **Research** | `ResearchProject`, `ResearchHub` | `/research`, `/study/research` |
| **Office Hours** | `OfficeHoursSlot`, `OfficeHoursBooking` | `/office-hours` |
| **Calendar** | `CalendarEvent` | `/calendar` |
| **Timetable** | `TimetableEntry`, `InstitutionTimetable` | `/timetable` |
| **Exams** | `Exam`, `ExamPaper`, `ExamQuestion`, `ExamAttempt`, `ExamCertificate` | `/exam/*` |
| **Attendance** | `AttendanceRecord`, `AttendanceSession` | `/attendance`, `/smart-attendance` |
| **Grades** | `StudentGrade`, `Grade` | `/academics/results`, `/academics/report` |
| **AI Learning** | `LearningPath`, `StudySession`, `StudyGoal`, `Flashcard`, `QuizAttempt`, `Citation` | `/study/*` |
| **Live Classroom** | `LiveClass`, `LiveRecording` | `/classroom/:id`, `/live/*` |
| **Notes** | `Note` | `/notes` |
| **Study Groups** | `StudyGroup`, `StudyGroupTask`, `StudyGroupMessage` | `/study-groups` |
| **Academic Timeline** | `AcademicTimelineEntry` | `/academic-timeline` |
| **Student Goals** | `StudentGoal`, `Milestone` | `/study/planner` |
| **Documents** | `StudentDocument` | `/study/library` |

## 5.2 Study Suite

The intelligent study companion: `StudySuite`, `StudyHome`, `StudyPlanner`, `LearningPaths`, `AssignmentAssistant`, `ProjectAssistant`, `SmartNotes`, `ResearchAssistant`, `ExamPreparation`, `Flashcards`, `PracticeTests`, `CitationManager`, `DocumentLibrary`.

## 5.3 Examination Platform

Full exam lifecycle: `ExamHub` → `ExamStart` → `ExamTaker` → `ExamResult` → `ExamAnalytics` → `ExamCoach` → `ExamAuthor`.

## 5.4 Report Engine

`src/lib/academics/reportEngine.js` — GPA progress, semester performance, assignment completion, weekly study charts, study streak timeline, milestone timeline. Exports via `ReportExportBar`.

---

# Volume 6 — Communities

## 6.1 Social Ecosystem

| Module | Entity | Route |
|---|---|---|
| **Quad (Feed)** | `QuadPost`, `QuadComment` | `/quad` |
| **Shorts** | `ShortVideo`, `ShortVideoComment` | `/shorts` |
| **Stories** | `Story`, `StoryView`, `StoryReply` | (social hub) |
| **Podcasts** | `Podcast`, `PodcastEpisode`, `PodcastListen` | `/podcasts`, `/podcasts/:id` |
| **Creator Studio** | — | `/creator-studio` |
| **Messages** | `Conversation`, `Message` | `/messages` |
| **Communities** | `Community` | `/communities`, `/community/:id` |
| **Clubs** | `Club` | `/clubs` |
| **Marketplace** | `MarketplaceListing`, `MarketplaceReview` | `/marketplace` |
| **Lost & Found** | `LostFoundItem` | `/lost-found` |
| **Discover** | — | `/discover` |
| **Friends** | `FriendRequest`, `SocialConnection`, `Follow` | `/friends`, `/following` |
| **Profile** | `User` | `/profile/:id`, `/me` |

## 6.2 Community Architecture

Each community is an independent app-like experience with immersive headers, banner identities, and crystal-dock bottom tab bars. Sections: Home, Feed, Chat, Members, Media, Events, Announcements, Settings.

## 6.3 Football Hub

`FootballMatch`, `FootballNews`, `FoodItem` — global (not tenant-scoped). Live ticker, match cards, news feed, food ordering.

## 6.4 Campus Hub

`CampusEvent`, `Club`, `CampusTradition`, `Celebration`, `LostFoundItem`. Campus life central.

---

# Volume 7 — Institutions

## 7.1 Multi-Tenancy

Every entity can be scoped by `institution_id`. RLS enforces tenant isolation: `data.institution_id: "{{user.data.institution_id}}"`.

## 7.2 Institution Entity

`Institution` entity — name, type, logo_url, branding config, status.

## 7.3 Portal Architecture (Consolidation Required)

**v1.0 freeze blocker:** Three parallel portal implementations exist:
- `src/pages/portal/` (legacy)
- `src/components/institution/` (current)
- `src/components/uni-portal/` (alternate)

**Requirement:** Consolidate into one canonical portal system before v1.0 freeze.

## 7.4 Institution Portal

Route: `/institution/console` (gated by `OracleWorkspaceGuard`). Sections: Dashboard, Communications, Records, Admissions, Branding, Permissions, Academic, Analytics, Documents, BudAdmin, HelpDesk, Results, Timetable, Announcements.

## 7.5 Institution Onboarding

`InstitutionOnboarding` page + `UniversityDirectory`. `universityConnectSync` / `universityConnectBgSync` for data sync.

## 7.6 Institution Outreach

`InstitutionOutreach` entity + `outreachFollowup` function for recruitment follow-ups.

## 7.7 Lecturer Portal

Route: `/lecturer/portal` (gated). Sections: Dashboard, Courses, Assignments, Timetable, Grades, Exams, Attendance, Office Hours, Projects, Research, Analytics, Messages, Bud, Class Lists.

## 7.8 Staff & Management

`Staff` entity, `ManagementTask`, `StaffAnnouncement`, `AnnouncementRead`. Management portal at `/management`.

---

# Volume 8 — Engineering Platform

## 8.1 Architect (No-Code Platform Builder)

Route: `/architect` (gated by `OracleWorkspaceGuard`).

Sections: PageBuilder, FormBuilder, WorkflowBuilder, AIBuilder, DashboardBuilder, ReportBuilder, ThemeBuilder, MenuBuilder, ComponentLibrary, PermissionBuilder, VersionControl, Workspace, ConfigManager.

**Entities:** `ArchitectConfig`, `ArchitectProject`. **State:** `src/lib/architect/editorState.js`, `configStore.js`.

## 8.2 Oracle Engineering Directives

`src/lib/oracle/engineeringDirective.js` + `engineeringConstitution.js` — governance for engineering decisions. Oracle reviews code and design.

## 8.3 Builder & Compiler

Code generation via `InvokeLLM`. Compilation via platform build step (Vite). No separate builder package.

## 8.4 Reviewer

Oracle code review directive. `Reviewer` agent role in specialist agents.

## 8.5 Repository

`base44/entities/` (JSON schemas as source of truth). `ArchitectConfig`, `ArchitectProject` entities for project config.

## 8.6 Version Control

`CollaborationVersion` entity. Architect VersionControl section.

## 8.7 DevOps

Platform-owned. Deploy via platform publish. No custom CI/CD pipeline.

## 8.8 Runtime

Base44 platform runtime — Vite + React frontend; Deno backend functions.

## 8.9 Documentation

`Scribe` agent role (defined in specialist agents). Scattered `.md` files to be consolidated into this master spec.

## 8.10 Plugin Engine

`Architect` ComponentLibrary + `base44/agents/` for AI agent extension + `base44/functions/` for backend extension.

---

# Volume 9 — Developer Platform

## 9.1 Developer Portal

Route: `/architect` (gated). The developer experience is the Architect no-code builder + backend function authoring.

## 9.2 Backend Functions

`base44/functions/{functionName}/entry.ts` — HTTP handlers for external APIs. 27 functions exist. Shared logic in `base44/shared/`.

**Authoring guide:** `get_capability_guide("backend_functions")` — runtime constraints, validation, SDK usage, secrets flow, webhooks, testing.

## 9.3 SDK

Pre-initialized `base44` client (`@/api/base44Client`). `@base44/sdk` package.

**Entity SDK:** `base44.entities.<Name>.<Operation>` (list, filter, get, create, update, delete, bulkCreate, bulkUpdate, updateMany, deleteMany, subscribe).

**Integration SDK:** `base44.integrations.Core.*` (InvokeLLM, UploadFile, UploadPrivateFile, CreateFileSignedUrl, SendEmail, GenerateImage, GenerateSpeech, GenerateVideo, TranscribeAudio, ExtractDataFromUploadedFile).

**Auth SDK:** `base44.auth.*` (isAuthenticated, me, updateMe, logout, redirectToLogin, loginViaEmailPassword, loginWithProvider, register, verifyOtp, resendOtp, resetPasswordRequest, resetPassword).

**Users SDK:** `base44.users.inviteUser(email, role)`.

**Analytics SDK:** `base44.analytics.track({ eventName, properties })`.

## 9.4 API Architecture

| Component | Implementation |
|---|---|
| **API Gateway** | Backend functions (auto-exposed HTTP endpoints) |
| **Registry** | Function input schemas auto-document endpoints |
| **Authentication** | Platform auth (Bearer token) |
| **Monitoring** | `ProviderLog` entity + `ProviderHub` |
| **Rate Limits** | Platform-owned |
| **External APIs** | Stripe, Google Calendar, OAuth connectors (TikTok, Discord, GitHub) |
| **Internal APIs** | `base44.integrations.Core.*` |
| **SDK** | Pre-initialized `base44` client |

## 9.5 Connectors

**Authorized:** Google Calendar (events, calendar, email scopes; webhook support).

**Workspace-registered:** TikTok ("UNIBUD TikTok"), Discord ("UNIBUD Discord"), GitHub ("Vantoris GitHub").

**Available (not yet connected):** 90+ connector types (Slack, Notion, Salesforce, HubSpot, LinkedIn, Instagram, Gmail, Google Drive, etc.).

## 9.6 Workflows (Developer Extension)

CNCF SWF v1.0 workflows in `base44/workflows/`. Authoring via `get_workflow_guide`. Triggers: scheduled, entity, connector, in_app_agent, app_user_auth, app_publish.

## 9.7 In-App Agents (Developer Extension)

`base44/agents/*.jsonc` configs. Authoring via `get_capability_guide("agents")`. Permissions via `request_agent_tool_permissions`.

---

# Volume 10 — Deployment, Operations, Monitoring

## 10.1 Deployment Pipeline

```
Development  →  Sandbox  →  Testing  →  Staging  →  Production  →  Recovery  →  Archive
```

| Stage | Implementation |
|---|---|
| **Development** | Base44 builder (live preview) |
| **Sandbox** | Test mode (Stripe sandbox, connector test scopes) |
| **Testing** | Vitest unit/integration tests + Testing Agent (test-tube panel) |
| **Staging** | Pre-publish preview |
| **Production** | Platform publish (iOS/Android/web from same code) |
| **Recovery** | Platform-owned (failover, backups) |
| **Archive** | `manage_workflow(action: 'archive')` for workflows; entity `is_archived` flags |

## 10.2 Monitoring

| Component | Implementation |
|---|---|
| **Health Dashboard** | `OracleDashboard` + `OracleOverview` + `HealthMonitoring` + `HealthGrid` |
| **Metrics** | `AIServiceMetric` entity |
| **Logs** | `ProviderLog` entity + structured console |
| **Alerts** | `SmartNotifications` + `Notification` entity (priority levels) |
| **AI Monitoring** | `AIMonitoring` Oracle section + `SparkAgentObservability` + `SparkExecutionLog` |
| **Performance** | `@tanstack/react-query` cache + `oracleHealthScan` |
| **Queue Monitoring** | Workflow run history + `AutomationRun` entity |
| **API Monitoring** | `ProviderHub` (Health, Providers, Webhooks, Secrets tabs) |
| **Database Monitoring** | Oracle registry metrics (`registryMetrics.js`) |

## 10.3 Operations

| Component | Implementation |
|---|---|
| **Oracle** (Platform Operating Center) | `/oracle` route |
| **Management** (Institution HQ) | `/management` route |
| **Operator** (Execution Workspace) | `/operator` route |
| **Finance** (Financial Platform) | `/finance` route |
| **Security Center** | `/security` route |
| **Admin Hub** | `/admin` route |
| **Automation Center** | `/automation` route |

## 10.4 Data Platform

| Component | Implementation |
|---|---|
| **Database** | Base44 entity store — 90+ JSON-schema entities |
| **Object Storage** | `UploadFile` / `UploadPrivateFile` + `CreateFileSignedUrl` |
| **Cache** | `@tanstack/react-query` + `src/lib/realm/cache.js` |
| **Search** | `studentSearch` + `NaturalLanguageSearch` + `GlobalSearch` + command palette |
| **Audit** | `AuditLog` entity + `logExecutiveAction` |
| **Analytics** | `base44.analytics.track()` + `AIServiceMetric` |
| **Backup** | Platform-owned |
| **Recovery** | Platform-owned |

## 10.5 Marketplace (Future Ecosystem)

| Module | Implementation |
|---|---|
| **Modules** | `PlatformModule` entity + `ProductRegistry` |
| **Plugins** | Architect ComponentLibrary + `base44/agents/` |
| **AI Authorities** | `SparkAgent` registry |
| **Extensions** | Architect + `base44/functions/` |
| **SDK** | `@base44/sdk` + pre-initialized client |
| **Templates** | `collaboration/templates.js` + `TemplateGallery` |

## 10.6 Notification Framework

| Component | Implementation |
|---|---|
| **Notification entity** | `Notification` (type, priority, category, is_read, snoozed_until, batch_key) |
| **Preferences** | `NotificationPreference` (muted categories, quiet hours, digest mode, reminder frequency, Bud tone) |
| **Priority engine** | `src/lib/notifications/priorityEngine.js` |
| **Smart notifications** | `src/lib/notifications/useSmartNotifications.js` |
| **Bud push** | `src/lib/notifications/useBudPush.js` |
| **Bud daily digest** | `BudDailyDigest` component |
| **Engine** | `budNotificationEngine` backend function |

## 10.7 Search & Indexing

- `studentSearch` backend function (student search)
- `NaturalLanguageSearch` component (knowledge search)
- `GlobalSearch` / `CommandPalette` (Oracle global search)
- `UnifiedMessageSearch` (communication search)

---

# Appendices

## Appendix A — Constitutions

All constitutions are folded into Volume 1 (Governance) and Volume 4 (Security). No separate constitution documents. This master spec is the single source.

## Appendix B — Events

Entity realtime events: `{ id, type: 'create'|'update'|'delete', data }`. Connector webhook events via workflow triggers. `WebhookEvent` entity for financial webhooks.

## Appendix C — Syscalls

| Category | Operations |
|---|---|
| **Entity** | `list`, `filter`, `get`, `create`, `update`, `delete`, `bulkCreate`, `bulkUpdate`, `updateMany`, `deleteMany`, `subscribe` |
| **Integration** | `InvokeLLM`, `UploadFile`, `UploadPrivateFile`, `CreateFileSignedUrl`, `SendEmail`, `GenerateImage`, `GenerateSpeech`, `GenerateVideo`, `TranscribeAudio`, `ExtractDataFromUploadedFile` |
| **Auth** | `isAuthenticated`, `me`, `updateMe`, `logout`, `redirectToLogin`, `loginViaEmailPassword`, `loginWithProvider`, `register`, `verifyOtp`, `resendOtp`, `resetPasswordRequest`, `resetPassword` |
| **Users** | `inviteUser(email, role)` |
| **Analytics** | `track({ eventName, properties })` |
| **Connectors** | `getConnection('<type>')` — OAuth access token |

## Appendix D — Data Models (Canonical Core Entities)

All entities are JSON schemas in `base44/entities/*.jsonc`. Built-in attributes (never declared): `id`, `created_date`, `updated_date`, `created_by_id`. 90+ entities total.

### Core Entities

| Entity | Key Fields | Relationships |
|---|---|---|
| **User** (built-in) | id, email, full_name, role | Owner of all user-scoped data |
| **Institution** | name, type, logo_url, branding | Tenant scope |
| **Course** | code, title, credits, department, instructor_id | → CourseMaterial, Enrollment |
| **Assignment** | course_id, title, due_date, status | → Course |
| **Community** | name, type, owner_id, member_count | → CommunityMember, QuadPost |
| **Conversation** | type, participants[], last_message | → Message |
| **Message** | conversation_id, author_id, content | → Conversation |
| **Notification** | user_id, type, priority, is_read | → User |
| **CalendarEvent** | title, start/end_time, organizer_id | → CalendarInvitee |
| **Wallet** | user_id, balance, currency | → FinancialTransaction |
| **FinancialTransaction** | wallet_id, type, amount, reference_id | → Wallet |
| **AuditLog** | actor_id, action, detail, meta | Standalone (admin-only) |
| **BudMemory** | user_id, type, content, metadata | → User |
| **SparkAgent** | agent_id, name, division, role, permissions | Standalone (admin-only) |
| **TaskManagement** | title, assignee_ids[], member_ids[], status | → TaskComment, TaskActivity |
| **Workspace** | name, members[], type | → CollaborationItem |
| **Presence** | user_id, status, last_active | → User |
| **CrashReport** | message, stack, url, user_id, severity | Standalone |
| **SecurityEvent** | type, severity, user_id | Standalone (admin-only) |

### Tenant Scoping
Entities with `institution_id`: Course, Assignment, Community, CampusEvent, FoodItem, FootballMatch, CourseMaterial, OfficeHoursSlot, Podcast, TaskManagement, MarketplaceListing, LibraryResource, and more.

## Appendix E — Repositories

Entity SDK is the repository layer. Domain wrappers:
- `src/lib/academic/academicApi.js`
- `src/lib/social/socialApi.js`
- `src/lib/finance/paymentService.js`, `walletService.js`, `bankingService.js`, `cardService.js`
- `src/lib/collaboration/collabEngine.js`
- `src/lib/knowledge/knowledgeEngine.js`
- `src/lib/communication/useSmartInbox.js`

## Appendix F — APIs (Backend Functions)

27 backend functions in `base44/functions/`:
activateAnnouncements, budNotificationEngine, budReminders, deadlineReminders, deleteAccount, eventReminders, examReminders, googleCalendarSync, logExecutiveAction, oracleHealthScan, outreachFollowup, providerSecrets, runAutomation, socialProfile, streakReminders, stripePayment, studentSearch, studyGroupEventBridge, taskReminders, transcribeEpisode, trustProfile, universityConnectBgSync, universityConnectSync, updateProfile, validatePlatformAccess, verifyAuthorityCode, welcomeNewStudent.

## Appendix G — Permissions & Roles

| Role | Authority | Access |
|---|---|---|
| **Founder** (A0) | Full | All portals, all authority codes |
| **Admin** | Institution-level | Oracle, Management, Admin |
| **Operator** | Execution | Operator portal |
| **Lecturer** | Academic | Lecturer portal |
| **Student** (default 'user') | Standard | AppShell routes |

## Appendix H — Workflows

8+ CNCF-SWF workflows in `base44/workflows/`: Bud Notification Engine, Bud Reminders, Deadline Reminders, Event Reminders, Study Streak Reminders, Exam Countdown, Welcome New Student, Outreach Follow-up, University Connect Background Sync, Activate Scheduled Announcements, Study Group Message/Task Notifications, Task Deadline Reminders.

## Appendix I — Error Codes

- `CrashReport` entity (severity: error/warn/info) for frontend crashes
- `ErrorBoundary` component
- `UDSErrorState` / `PageNotFound` for UI states
- Backend function errors bubble to frontend (no silent catch unless user-facing form/auth)

## Appendix J — Design Tokens

### Colors (Midnight — dark-only)

**Foundation:**
| Token | Value | Usage |
|---|---|---|
| `--background` | `0 0% 0%` (#000000) | App root |
| `--foreground` | `0 0% 100%` (#FFFFFF) | Headlines |
| `--card` | `0 0% 7.8%` (#141414) | Cards |
| `--popover` | `0 0% 3.9%` (#0A0A0A) | Modals |
| `--primary` | `0 0% 100%` (#FFFFFF) | Interactive |
| `--secondary` | `0 0% 12%` (#1E1E1E) | Elevated |
| `--muted` | `0 0% 7.8%` | Muted bg |
| `--muted-foreground` | `0 0% 64%` (#A3A3A3) | Body text |
| `--border` | `0 0% 18%` | Borders |
| `--input` | `0 0% 12%` | Inputs |

**Status:**
| Token | Value | Usage |
|---|---|---|
| `--success` | `142 71% 45%` | Success |
| `--warning` | `53 96% 50%` | Warnings |
| `--destructive` / `--error` | `0 84% 60%` | Errors only |
| `--information` | `217 91% 60%` | Info / blue accent |
| `--gold` | `46 74% 55%` | Achievements only |

**Glass materials:**
`--glass-bg`, `--glass-bg-strong`, `--glass-border`, `--glass-border-strong`, `--glass-blur`.

### Typography

Font: **Inter** (heading, body, display). Mono: `ui-monospace`.

| Token | Size | Weight |
|---|---|---|
| `--text-display` | 29px | 700 |
| `--text-heading` | 19px | 700 |
| `--text-title` | 17px | 600 |
| `--text-subtitle` | 14px | 600 |
| `--text-body` | 14px | 400 |
| `--text-caption` | 12px | 500 |
| `--text-label` | 11px | 600 |
| `--text-micro` | 10px | 600, uppercase |

### UI Components

| Component | Implementation |
|---|---|
| **Buttons** | `UDSButton`, `button.jsx`, `.liquid-press`, `.spring-tap` |
| **Cards** | `.glass`, `.crystal-card`, `.liquid-mirror`, `.mirror-glass`, `.frosted-mirror`, `UDSCard` |
| **Inputs** | `GlassInput`, `FloatingLabelInput`, `UDSInput`, `.oracle-input` |
| **Tables** | `table.jsx` (shadcn) |
| **Charts** | recharts + `chartColors.js` |
| **Navigation** | `FloatingNav`, `AdaptiveNav`, `EcosystemRail`, `OracleShell` sidebar |
| **Empty states** | `EmptyState`, `UDSEmptyState` |
| **Error states** | `ErrorBoundary`, `UDSErrorState`, `PageNotFound` |
| **Loading states** | `RouteLoading`, `SkeletonCard`, `UDSLoadingState`, `.shimmer` |
| **Dialogs** | `dialog.jsx`, `sheet.jsx`, `drawer.jsx`, `alert-dialog.jsx` |
| **Icons** | lucide-react only |

### Motion Standards

- Primary easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- AI states: `.ai-thinking`, `.ai-searching`, `.ai-generating`, `.ai-planning`
- Bud states: `.bud-breathe`, `.bud-blink`, `.bud-speak`, `.bud-listen`, `.bud-celebrate`
- `prefers-reduced-motion` gates all animations

### Accessibility

`.reduce-motion`, `.high-contrast`, `.reduce-transparency`, `.ux-large-text`, `:focus-visible`, safe-area insets, keyboard navigation, 16px touch inputs.

## Appendix K — Brand Asset Placeholder Registry

Reserved tokens for Founder-supplied assets. The system never generates these.

| Placeholder | Canonical Component | Status |
|---|---|---|
| `{{UNIBUD_PRIMARY_LOGO}}` | `UnibudLogo.jsx` | Consolidate duplicates |
| `{{UNIBUD_MARK}}` | `UnibudMark.jsx` | Consolidate to one |
| `{{UNIBUD_ICON}}` | `UnibudIcon.jsx` | Favicon + PWA |
| `{{BUD_ICON}}` | `BudOrb.jsx` / `BudAvatar.jsx` | Consolidate |
| `{{ORACLE_ICON}}` | Oracle shell header | Reserve |
| `{{INSTITUTION_LOGO}}` | `InstitutionStatusBadge` | Per-tenant |
| `{{COMMUNITY_ICON}}` | `CommunityHeader.jsx` | Per-community |
| `{{USER_AVATAR}}` | Profile + presence | Fallback initials |
| `{{EMPTY_STATE_IMAGE}}` | `EmptyState.jsx` | Consistent fallback |
| `{{WELCOME_BACKGROUND}}` | `welcomeBackgrounds.js` | Data-driven |

## Appendix L — UI/UX Standards

| Standard | Specification |
|---|---|
| Max screen load time | < 2s first paint; lazy routes use `RouteLoading` |
| Consistent navigation | Single `FloatingNav` + single `AdaptiveNav` |
| Responsive layouts | Mobile-first; widens at `md` (760px) and `lg` (1080px) |
| Offline behavior | `OfflineBanner` + `useOnlineStatus` |
| Progressive loading | Suspense + lazy routes + skeleton + `.shimmer` |
| Accessibility | Motion, contrast, transparency, text, keyboard |
| Mobile-first | Touch-optimized (16px inputs, tap targets) |
| Dark theme | Midnight (dark-only) |
| Light theme | Deferred (known gap) |
| Autosave | All creation flows |
| Error handling | Errors bubble up; `ErrorBoundary` for crashes |
| Image rendering | `Image` component (`@/components/ui/image`) — never plain `<img>` |
| Glass effects | Maximized throughout |

## Appendix M — Feature Registry

Status: ✅ Live · ⚠️ Partial · ❌ Not implemented · 🔒 Platform-dependent

| Module | Status | Version |
|---|---|---|
| Splash / Welcome / Onboarding | ✅ | v1.0 |
| Auth (email/password, Google) | ✅ | v1.0 |
| Auth (MFA, Biometric, Trusted Device) | 🔒 | Deferred |
| Bud Companion | ✅ | v1.0 |
| Oracle Governance | ✅ | v1.0 |
| Academic Hub | ✅ | v1.0 |
| Study Suite | ✅ | v1.0 |
| Exam Platform | ✅ | v1.0 |
| Social (Quad, Shorts, Stories) | ✅ | v1.0 |
| Messaging | ✅ | v1.0 |
| Communities | ✅ | v1.0 |
| Marketplace | ✅ | v1.0 |
| Wallet / Finance | ✅ | v1.0 |
| Collaboration | ✅ | v1.0 |
| Task Management | ✅ | v1.0 |
| Knowledge Hub | ✅ | v1.0 |
| Notifications | ✅ | v1.0 |
| Calendar | ✅ | v1.0 |
| Podcasts | ✅ | v1.0 |
| Creator Studio | ✅ | v1.0 |
| Football Hub | ✅ | v1.0 |
| Campus Hub | ✅ | v1.0 |
| Career Hub | ✅ | v1.0 |
| Mentorship | ✅ | v1.0 |
| Institution Portal | ⚠️ | v1.0 (consolidate) |
| Lecturer Portal | ✅ | v1.0 |
| Management Portal | ✅ | v1.0 |
| Operator Portal | ✅ | v1.0 |
| Architect | ✅ | v1.0 |
| Automation Center | ✅ | v1.0 |
| Security Center | ✅ | v1.0 |
| Admin Hub | ✅ | v1.0 |
| Oracle Dashboard | ✅ | v1.0 |
| Stripe Payments | ✅ | v1.0 (test mode) |
| Google Calendar Sync | ✅ | v1.0 |
| Workflows | ✅ | v1.0 |
| In-app Agents (13) | ✅ | v1.0 |
| Realtime Subscriptions | ✅ | v1.0 |
| Crash Reporting | ✅ | v1.0 |
| Analytics | ✅ | v1.0 |
| Accessibility | ✅ | v1.0 |
| Brand Asset Placeholders | ⚠️ | v1.0 (formalize) |
| i18n | ❌ | Deferred |
| Light Theme | ❌ | Deferred |
| Voice/Video/Streaming | ❌ | Rejected (dead end) |
| Portal Consolidation | ⚠️ | v1.0 freeze blocker |
| Orphaned Page Cleanup | ⚠️ | v1.0 freeze blocker |
| Brand Component Consolidation | ⚠️ | v1.0 freeze blocker |

---

# v1.0 Freeze Verification Checklist

All 22 areas required for a production-ready AI-native operating system:

| # | Area | Documented | Implementation Status |
|---|---|---|---|
| 1 | Core kernel and boot process | ✅ Vol 3 §3.2 | ✅ Splash → Auth → OracleAuthRouter → Portal |
| 2 | Identity, authentication, authorization, session management | ✅ Vol 4 §4.1–4.4 | ✅ (MFA/biometric deferred — platform-dependent) |
| 3 | Canonical data model | ✅ Appendix D | ✅ 90+ entities |
| 4 | Repository architecture | ✅ Appendix E | ✅ Entity SDK + domain wrappers |
| 5 | API architecture and gateway | ✅ Vol 9 §9.4 | ✅ 27 backend functions |
| 6 | Event bus and synchronization | ✅ Vol 3 §3.3, §3.7 | ✅ Realtime subscriptions + sync functions |
| 7 | Workflow engine | ✅ Vol 3 §3.4 | ✅ CNCF SWF workflows |
| 8 | AI command authorities | ✅ Vol 2 §2.4 | ✅ 27 codes, hash-verified |
| 9 | Agent lifecycle | ✅ Vol 2 §2.10 | ✅ 13 agents + SparkAgent registry |
| 10 | Multi-portal architecture | ✅ Vol 7 §7.3, Vol 4 §4.1 | ⚠️ Consolidation required |
| 11 | Native Engineering Platform | ✅ Vol 8 | ✅ Architect |
| 12 | Monitoring, logging, metrics, auditing | ✅ Vol 10 §10.2 | ✅ CrashReport, AuditLog, ProviderLog, AIServiceMetric |
| 13 | Backup, disaster recovery, rollback | ✅ Vol 10 §10.1 | ✅ Platform-owned |
| 14 | Deployment pipeline | ✅ Vol 10 §10.1 | ✅ Dev → Sandbox → Test → Staging → Prod → Recovery → Archive |
| 15 | Plugin and extension framework | ✅ Vol 8 §8.10 | ✅ Architect + agents + functions |
| 16 | Marketplace and package management | ✅ Vol 10 §10.5 | ✅ PlatformModule + ProductRegistry |
| 17 | Notification framework | ✅ Vol 10 §10.6 | ✅ Notification + preferences + priority engine |
| 18 | Search and indexing | ✅ Vol 10 §10.7 | ✅ studentSearch + NL search + GlobalSearch |
| 19 | Governance and constitutional validation | ✅ Vol 1 §1.7, Vol 2 §2.4 | ✅ Oracle executive authority |
| 20 | Performance, scalability, capacity planning | ✅ Vol 3, Appendix L | ✅ Lazy routes, query cache, platform scaling |
| 21 | Mobile, web, desktop client strategy | ✅ Appendix L | ✅ PWA-responsive (mobile-first, desktop widening) |
| 22 | Welcome & authentication experience | ✅ Vol 4 §4.1 | ✅ (biometric/MFA deferred — platform-dependent) |

**All 22 areas documented.** Implementation is live for 19/22; 3 are platform-dependent (MFA/biometric), deferred (i18n), or require consolidation (portal cleanup).

---

## Pre-Freeze Blockers

Before declaring v1.0 frozen in production:

1. **Orphaned page cleanup** — 112 orphaned pages in `src/pages/`
2. **Portal consolidation** — three parallel portal implementations
3. **Brand component consolidation** — four logo components
4. **i18n** — no runtime (critical gap, or formally defer with Founder sign-off)

---

## Revision Policy

**This is v1.0 — frozen.**

After freeze, changes go through **versioned revisions**:
- **v1.1** — minor additions, no breaking changes
- **v1.2** — incremental enhancements
- **v2.0** — breaking architectural changes (requires Founder approval)

No continual expansion. No new constitutions. This document is the single source of truth.

The focus now shifts from **"What else should we design?"** to **"How do we implement Version 1.0 systematically?"** — preventing architectural drift while allowing UNIBUD to mature through iterative development.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-08-01 | Initial freeze — 10 Volumes + Appendices |
| v1.1 | 2026-08-01 | Added AI Command Authority Constitution (IACP) — see [`UNIBUD_AI_COMMAND_AUTHORITY_CONSTITUTION.md`](./UNIBUD_AI_COMMAND_AUTHORITY_CONSTITUTION.md). Extends Volume 2 with Ultimate Command Authority hierarchy, inter-agent communication protocol, constitutional compliance layer, and acceptance criteria. |
| v1.2 | 2026-08-01 | Added Domain Architecture Specification — see [`UNIBUD_DOMAIN_ARCHITECTURE_v1.2.md`](./UNIBUD_DOMAIN_ARCHITECTURE_v1.2.md) and [`UNIBUD_DOMAIN_ARCHITECTURE_Domains_v1.2.md`](./UNIBUD_DOMAIN_ARCHITECTURE_Domains_v1.2.md). Formalizes the platform into 12 DDD bounded contexts (Identity, Academic, Learning, Research, Community, Campus, Administration, AI, Workflow, Media, Integration, Analytics) with canonical entities, aggregates, domain services, commands, queries, permissions, workflows, AI interactions, and extension points — all mapped to existing implementation. Added Identity & Access Domain Specification (IAD) — see [`UNIBUD_DOMAIN_IDENTITY_ACCESS_v1.md`](./UNIBUD_DOMAIN_IDENTITY_ACCESS_v1.md). Added Academic Domain Specification (ADS) — see [`UNIBUD_DOMAIN_ACADEMIC_v1.md`](./UNIBUD_DOMAIN_ACADEMIC_v1.md). |

---

*UNIBUD OS Core Architecture v1.0 — Frozen 2026-08-01*
*Single source of truth for Base44 and UNIBUD's engineering platform.*
*Revisions tracked above. No in-place amendments to v1.0.*