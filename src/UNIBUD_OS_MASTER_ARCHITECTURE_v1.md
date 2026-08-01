# UNIBUD OS — Master Architecture Specification v1.0

> **Status:** Frozen · **Version:** 1.0 · **Date:** 2026-08-01
> This document supersedes all prior constitutions, manifest drafts, and scattered `.md` files.
> Changes after this point go through **versioned revisions** (v1.1, v1.2, …) — the v1.0 blueprint is not amended in place.
> It describes the architecture **as it exists and runs today** on the Base44 platform, mapping each requested concept to its real, native implementation.

---

## PART I — Foundation

### Vision
UNIBUD is an intelligent, multi-dimensional University Operating System that unifies the social, academic, professional, and operational life of a university into one premium, AI-native experience — governed invisibly by Oracle and accessed through Bud, the trusted companion.

### Mission
To save every student time, reduce stress, and improve academic success by orchestrating all campus systems, relationships, and opportunities through a single, calm, intelligent interface that feels personal rather than institutional.

### Design Principles
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

### Core Philosophy
The platform operates as a **living operating system**, not a collection of static apps. Bud is a supportive mentor — never referred to as an AI, GPT, LLM, or chatbot. Oracle governs silently. Every experience is student-centric and autonomous.

### Platform Objectives
- Unify academic, social, professional, and operational domains in one OS.
- Deliver an Apple-quality, US-banking-grade welcome and daily experience.
- Enforce a 16-level Oracle Executive Authority governance hierarchy.
- Maintain autonomous AI intelligence across a unified design language.
- Maximize glass and mirror UI effects throughout all components.
- Operate every capability through Bud as the single entry point.

### Terminology
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

---

## PART II — Platform Constitution

### Core Constitution
The platform is a living OS. All engineering, design, and operations are orchestrated autonomously by Oracle and specialist agents per the Master Builder Constitution. Oracle is invisible. All sessions are authenticated and routed via Oracle's invisible logic. Founders/admins never manually assign work to agents.

### Governance Constitution
Oracle enforces a 16-level (A0–A4 tier) executive authority hierarchy with 27 authority codes. Human administrators interact exclusively with Bud to delegate tasks to background agents. Every executive action is audit-logged. Authority codes are hash-verified with replay protection.

### Security Constitution
- RLS on every entity; no open writes.
- `SecurityCenter`, `SecurityEvent`, `Device`, `ApiKey` entities for security operations.
- Authority code verification backend (no plaintext storage, hash-based deduplication, replay protection).
- Crash reporting via `CrashReport` entity.
- Consent management keyed by `{{user.id}}`.

### Privacy Constitution
- Student-centric autonomous OS model (no parent/guardian portals).
- Presence "offline" status hides the user from peer reads.
- `matriculationPrivacy.js` governs academic record visibility.
- `ConsentLink` entity for consent management.
- `TrustScore` and `ContentReport` for community moderation.

### Compliance Constitution
- `AuditLog` entity for all executive actions.
- `KYCRecord`, `RefundRequest`, `PaymentAttempt`, `WebhookEvent` for financial compliance.
- `VerificationRequest` entity for identity verification.
- All financial transactions tracked with `FinancialTransaction` + `WalletLedger`.

### Experience Isolation Constitution
Each portal (User, Operator, Institution, Founder, Developer) is an independent experience. No portal interferes with another. Portals are gated by `OracleWorkspaceGuard` and role-based access. Navigation, layout, and data scoping are isolated per portal.

### Native Engineering Constitution
Build exclusively on Base44 primitives. Do not reinvent platform-owned infrastructure (ORM, auth backend, API server, vector store, model loader). Logic shared by multiple backend functions lives in `base44/shared/` modules. Backend functions are the only integration layer for external APIs without built-in integrations.

### Progressive Experience Constitution
Onboarding is conversational and progressive — Bud captures identity contextually rather than through multi-step forms. Experiences load progressively; autosave and clear feedback are standard. Features unlock as the user's profile matures.

### Adaptive Visibility Constitution
Navigation adapts to context: `AdaptiveNav` surfaces the most relevant tabs per screen. `FloatingNav` provides persistent top navigation. The Ecosystem Rail offers accessibility and mode toggles. `ContextPulse` and `EdgeContextSwipe` provide contextual surfacing. Classroom mode gates Bud when appropriate.

---

## PART III — Core Operating System

The Core OS maps to real, running modules. Concepts from prior monorepo blueprints (runtime, workflow-engine, repository-engine, event-bus, scheduler, queues, synchronization, monitoring, logging, diagnostics, recovery) are **implemented natively by the platform** — listed here with their concrete resolution.

| OS Component | Native Implementation |
|---|---|
| **Oracle Kernel** | `src/lib/oracle/` — orchestration engine, executive authority, health monitor, authority codes & levels, specialist agents, management centers |
| **Bud Shell** | `src/lib/bud/` — orchestrator, conversation, personality, constitution, system prompt, context builder, actions (reason, recall, store) |
| **Command Connection Layer** | `src/lib/bud/orchestrator.ts` → `InvokeLLM` → agent routing; `src/lib/spark/orchestrator.js` |
| **Intelligent Execution Layer** | `base44/agents/` agent configs + `src/lib/spark/` provider/agent/intelligence modules |
| **Event Bus** | Entity realtime subscriptions (`entity.subscribe((event) => …)`) |
| **Workflow Engine** | `base44/workflows/` (CNCF SWF v1.0 — triggers, conditions, branching, durable waits) |
| **Scheduler** | Scheduled workflow triggers + backend functions (`deadlineReminders`, `eventReminders`, `examReminders`, `streakReminders`, `budReminders`, `taskReminders`) |
| **Repository Manager** | `base44.entities.<Name>` SDK — list, filter, create, update, bulkUpdate, updateMany, deleteMany, subscribe |
| **Memory Engine** | `BudMemory` entity + `src/hooks/useBudMemory.js` + `MemoryDashboard` page |
| **Knowledge Engine** | `src/lib/knowledge/` + `KnowledgeHub` page + `NaturalLanguageSearch` |
| **Synchronization Engine** | Entity realtime subscriptions + `universityConnectSync` / `universityConnectBgSync` functions |
| **Runtime Engine** | Base44 platform runtime (Vite + React frontend; Deno backend functions) |
| **Monitoring** | `CrashReport`, `AuditLog`, `ProviderLog`, `AIServiceMetric`, `SparkExecutionLog` + `oracleHealthScan` |
| **Logging** | `ProviderLog` entity + structured console in backend functions |
| **Diagnostics** | `SparkExecutionLog` entity |
| **Recovery** | Platform-owned (backups, failover) |

---

## PART IV — AI System

### Bud
The user-facing companion. Lives in `src/lib/bud/` with orchestrator, conversation, personality, constitution, system prompt, context builder, and actions. Accessed via `BudCompanion`, `BudLivingOrb`, `BudPanel`, `BudHome`. Never referred to as AI/chatbot.

### Oracle
The hidden governance core. `src/lib/oracle/` with orchestration engine, 16-level executive authority, health monitor, 27 authority codes, specialist agents, management centers. Oracle pages are gated by `OracleWorkspaceGuard`.

### Command Authorities
27 authority codes across 5 tiers (A0–A4). Hash-verified by `verifyAuthorityCode` backend function. `ExecutiveVerificationGate` component. `logExecutiveAction` for audit trail.

### Super Agents (in-app agents)
`base44/agents/`: `bud`, `oracle`, `spark`, `study`, `career`, `campus`, `quad`, `pulse`, `library`, `admin`, `search`, `security`, `notification`.

### Worker Agents
`SparkAgent` entity registry + `src/lib/spark/agents/` (definitions, registry, runner). Specialist agents defined in `src/lib/oracle/specialistAgents.js`.

### AI Registry
`SparkAgent` entity (agent_id, name, division, role, responsibilities, tools, permissions, input/output schemas, validation rules, success criteria, handoff rules). `SparkAgentRegistry` + `SparkAgentObservability` in Oracle.

### AI Marketplace
`Architect` page (no-code platform builder) + `PlatformModule` entity. Future: module/plugin marketplace via `ProductRegistry`.

### AI Memory
`BudMemory` entity (episodic, semantic). `useBudMemory` hook. `MemoryDashboard` page. Context built in `src/lib/bud/context/buildContext.ts`.

### AI Learning
`LearningPath` entity + `src/lib/spark/learning/`. `src/lib/bud/actions/` for reasoning, planning, knowledge search.

### AI Collaboration
`src/lib/spark/orchestrator.js` — multi-agent orchestration. `SparkExecutionLog` for run tracking. `src/lib/oracle/orchestrationEngine.js`.

### AI Lifecycle
Agent configs versioned in `base44/agents/*.jsonc`. `enabled`, `order`, `retry_max`, `failure_handling`, `handoff_rules` fields on `SparkAgent`. Observability via `SparkAgentObservability`.

---

## PART V — Identity Platform

| Component | Implementation |
|---|---|
| **Identity** | Built-in `User` entity (id, email, full_name, role, created_date). `StudentIdentifier`, `StudentRecord`, `DigitalBadge` for academic identity. |
| **RBAC** | `Role` entity + `OperatorRole` + `OperatorAssignment`. User.role defaults to 'admin'/'user'. RLS `user_condition: { role: "admin" }` patterns. |
| **Sessions** | Platform-owned auth (tokens, sessions, email verification). `base44.auth` SDK. |
| **MFA** | Platform-dependent — not natively available. Documented as known limitation. |
| **Biometrics** | Platform-dependent. UI toggle reserved but not functional until platform supports. |
| **Device Trust** | `Device` entity. Trusted-device management is platform-dependent. |
| **User Login** | `src/pages/Login.jsx` — email+password, Google OAuth, forgot link. |
| **Operator Login** | `OracleWorkspaceGuard` → `Operator` page. Role-gated. |
| **Admin Login** | `OracleWorkspaceGuard` → `Oracle` / `Management` / `AdminHub` pages. |
| **Founder Login** | A0 authority code verification → Oracle full access. |
| **Developer Login** | `Architect` page (gated). |

**Known platform limitations:** Biometric login, MFA, trusted-device management, and a user-controlled "keep me signed in" toggle are not natively implementable on the current Base44 Auth schema. These are documented as platform-dependent and deferred until the platform supports them.

---

## PART VI — Portal Architecture

Each portal is an independent, role-gated experience. No portal interferes with another.

| Portal | Route | Gate | Purpose |
|---|---|---|---|
| **User Portal** | `/home`, `/bud`, `/social`, `/academics`, etc. | `AppShell` (auth check) | Student experience |
| **Operator Portal** | `/operator` | `OracleWorkspaceGuard` | Execution workspace |
| **Institution Portal** | `/institution/console` | `OracleWorkspaceGuard` | Institution operational HQ |
| **Organization Portal** | (via Institution Portal sections) | `OracleWorkspaceGuard` | Department/faculty ops |
| **Platform Portal** | `/management` | `OracleWorkspaceGuard` | Institution operational management |
| **Founder Portal** | `/oracle` | `OracleWorkspaceGuard` + A0 | Platform operating center |
| **Developer Portal** | `/architect` | `OracleWorkspaceGuard` | No-code platform builder |

**Consolidation requirement (v1.0 freeze blocker):** Three parallel portal implementations exist (`src/pages/portal/`, `src/components/institution/`, `src/components/uni-portal/`). These must be consolidated into one canonical portal system before v1.0 freeze.

---

## PART VII — Academic Platform

| Module | Entity / Page |
|---|---|
| **Courses** | `Course`, `CourseMaterial`, `CourseMaterialProgress` → `/courses`, `/course/:id` |
| **Assignments** | `Assignment` → `/assignments` |
| **Projects** | `Project`, `FYPProject`, `ResearchProject` → `/projects` |
| **Research** | `ResearchHub`, `ResearchAssistant` → `/research`, `/study/research` |
| **Office Hours** | `OfficeHoursSlot`, `OfficeHoursBooking` → `/office-hours` |
| **Calendar** | `CalendarEvent` → `/calendar` |
| **Messaging** | `Conversation`, `Message` → `/messages` |
| **Student Services** | `StudentSupport` → `/student-support` |
| **Library** | `LibraryResource` → `/study/library` |
| **Communities** | `Community` → `/communities`, `/community/:id` |
| **Timetable** | `TimetableEntry`, `InstitutionTimetable` → `/timetable` |
| **Exams** | `Exam`, `ExamPaper`, `ExamQuestion`, `ExamAttempt`, `ExamCertificate` → `/exam/*` |
| **AI Learning** | `LearningPath`, `StudySession`, `StudyGoal`, `Flashcard`, `QuizAttempt` → `/study/*` |

Additional: `AttendanceRecord`, `AttendanceSession`, `LiveClass`, `StudentGrade`, `Grade`, `Milestone`, `Citation`.

---

## PART VIII — Engineering Platform

The Native Engineering Platform is embodied in the **Architect** (no-code platform builder) and the **Oracle** engineering directives.

| Module | Implementation |
|---|---|
| **Architect** | `src/pages/architect/Architect.jsx` + `src/components/architect/` (PageBuilder, FormBuilder, WorkflowBuilder, AIBuilder, DashboardBuilder, ReportBuilder, ThemeBuilder, MenuBuilder, ComponentLibrary, PermissionBuilder, VersionControl, Workspace) |
| **Builder** | Code generation via `InvokeLLM` + `Architect` config store |
| **Compiler** | Platform build step (Vite) |
| **Reviewer** | Oracle code review directive (`src/lib/oracle/engineeringDirective.js`) |
| **Deployment** | Platform publish flow |
| **Monitoring** | `oracleHealthScan` + Oracle dashboard + `AIMonitoring` section |
| **Repository** | `base44/entities/` (JSON schemas) + `ArchitectConfig`, `ArchitectProject` entities |
| **DevOps** | Platform-owned (deploy via publish) |
| **Runtime** | Base44 platform runtime |
| **Version Control** | `Architect` VersionControl section + `CollaborationVersion` entity |
| **Documentation** | `Scribe` agent role (defined in specialist agents) |
| **Plugin Engine** | `Architect` ComponentLibrary + `base44/agents/` extension |

---

## PART IX — Data Platform

| Component | Implementation |
|---|---|
| **Database** | Base44 entity store — 90+ JSON-schema entities in `base44/entities/`. No ORM, no migrations. |
| **Object Storage** | `UploadFile` / `UploadPrivateFile` integrations + `CreateFileSignedUrl` for private files |
| **Cache** | `@tanstack/react-query` (query cache) + `src/lib/realm/cache.js` |
| **Search** | `studentSearch` backend function + `NaturalLanguageSearch` + `GlobalSearch` + command palette |
| **Audit** | `AuditLog` entity + `logExecutiveAction` function |
| **Analytics** | `base44.analytics.track()` + `AIServiceMetric`, `AIServiceRecommendation` entities |
| **Data Lake** | Not applicable — platform owns storage. `FinancialTransaction`, `WalletLedger` for financial data lake. |
| **Backup** | Platform-owned |
| **Recovery** | Platform-owned |

---

## PART X — API Platform

| Component | Implementation |
|---|---|
| **API Gateway** | Backend functions (`base44/functions/*/entry.ts`) are auto-exposed HTTP endpoints |
| **Registry** | Function input schemas auto-document endpoints; `providerSecrets` for credentials |
| **Authentication** | Platform auth (Bearer token via `base44.auth`); `validatePlatformAccess` function |
| **Monitoring** | `ProviderLog` entity + `ProviderConnection` + `providerSecrets` function |
| **Rate Limits** | Platform-owned |
| **External APIs** | Stripe (`stripePayment`), Google Calendar (`googleCalendarSync`), OAuth connectors (TikTok, Discord, GitHub) |
| **Internal APIs** | `base44.integrations.Core.*` (InvokeLLM, UploadFile, SendEmail, GenerateImage, GenerateSpeech, GenerateVideo, TranscribeAudio, ExtractDataFromUploadedFile) |
| **SDK** | Pre-initialized `base44` client (`@/api/base44Client`) + `@base44/sdk` |

---

## PART XI — User Experience

### Welcome Screen

Premium. Minimal. Apple quality. US banking quality (Chase, Capital One, Amex, Revolut) — without copying their branding.

**Flow:**
```
UNIBUD
Learn. Connect. Thrive.
────────────
[ Sign In ]      [ Create Account ]
────────────
☐ Keep me signed in
☑ Use Face ID / Fingerprint when available
[ Continue ]
```

- Animation under two seconds.
- Login remembers user preference only on trusted devices.
- "Keep me signed in" is opt-in only — never auto-enabled.

**Implementation:** `src/pages/Splash.jsx` → `src/pages/Welcome.jsx` → `Login.jsx` / `Register.jsx` → `MeetBud.jsx` → `ModeSelector.jsx` → `OnboardingConversation.jsx` → `OnboardingSecurity.jsx` → `OnboardingPreparing.jsx` → `OracleAuthRouter.jsx` (role detection → correct portal).

**Welcome screen elements:** Reserved `{{UNIBUD_PRIMARY_LOGO}}` placeholder, headline, platform description, Sign In / Create Account buttons, accessibility options (Ecosystem Rail), privacy notice (`/privacy`), terms acknowledgement (`/terms`).

**Platform-dependent (documented):** "Keep me signed in" toggle, biometric login, MFA, trusted-device management — not natively available on current Base44 Auth schema.

### UX Standards
- **Max screen load time:** < 2s first paint; lazy routes use `RouteLoading` fallback.
- **Consistent navigation:** Single `FloatingNav` (top) + single `AdaptiveNav` (bottom) + `EcosystemRail`.
- **Responsive layouts:** Mobile-first; `.app-content` widens at `md` and `lg` breakpoints.
- **Offline behavior:** `OfflineBanner` + `useOnlineStatus`; entity writes queue via platform.
- **Progressive loading:** Suspense + lazy routes + skeleton states + `shimmer`.
- **Accessibility:** Reduced motion, high contrast, reduce transparency, text scaling, focus-visible, safe-area insets, keyboard navigation.
- **Mobile-first design:** Touch-optimized (16px inputs, tap targets, `touch-action: manipulation`).
- **Dark and light themes:** Dark-only (Midnight). Light theme is a known gap — out of v1.0 scope unless Founder requests.

---

## PART XII — Monitoring

| Component | Implementation |
|---|---|
| **Health Dashboard** | `OracleDashboard` + `OracleOverview` + `HealthMonitoring` + `HealthGrid` |
| **Metrics** | `AIServiceMetric` entity + `DefaultMetrics`-pattern helpers |
| **Logs** | `ProviderLog` entity + structured console |
| **Alerts** | `SmartNotifications` + `Notification` entity (priority: critical/high/normal/low/silent) |
| **AI Monitoring** | `AIMonitoring` Oracle section + `SparkAgentObservability` + `SparkExecutionLog` |
| **Performance** | `@tanstack/react-query` cache + `oracleHealthScan` function |
| **Queue Monitoring** | Workflow run history (dashboard) + `AutomationRun` entity |
| **API Monitoring** | `ProviderHub` (Health, Providers, Webhooks, Secrets tabs) |
| **Database Monitoring** | Entity-level via Oracle registry metrics (`registryMetrics.js`) |

---

## PART XIII — Deployment

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

---

## PART XIV — Marketplace

Future ecosystem:

| Module | Implementation / Reservation |
|---|---|
| **Modules** | `PlatformModule` entity + `ProductRegistry` Oracle section |
| **Plugins** | `Architect` ComponentLibrary + `base44/agents/` extension |
| **AI Authorities** | `SparkAgent` entity registry (agent marketplace) |
| **Extensions** | `Architect` no-code builder + `base44/functions/` |
| **SDK** | `@base44/sdk` + pre-initialized client |
| **Templates** | `collaboration/templates.js` + `TemplateGallery` |

---

## PART XV — Appendices

### Events
Entity realtime events: `{ id, type: 'create'|'update'|'delete', data }`. Connector webhook events via workflow triggers. `WebhookEvent` entity for financial webhooks.

### Syscalls
`base44.entities.<Name>.<Operation>` (list, filter, get, create, update, delete, bulkCreate, bulkUpdate, updateMany, deleteMany, subscribe). `base44.integrations.<Pkg>.<Endpoint>`. `base44.auth.*`. `base44.analytics.track()`.

### Database Models
90+ entities in `base44/entities/`. Canonical models listed in Appendix D below.

### Repositories
Entity SDK is the repository layer — no separate repository classes. `src/lib/academic/academicApi.js`, `src/lib/social/socialApi.js`, `src/lib/finance/*` provide domain-specific service wrappers.

### APIs
27 backend functions in `base44/functions/`. Core integrations: InvokeLLM, UploadFile, UploadPrivateFile, CreateFileSignedUrl, SendEmail, GenerateImage, GenerateSpeech, GenerateVideo, TranscribeAudio, ExtractDataFromUploadedFile.

### Permissions
RLS per entity (`read`, `create`, `update`, `delete`). Template variables: `{{user.id}}`, `{{user.data.institution_id}}`, `user_condition: { role: "admin" }`. Agent permissions via `base44/agents/*.jsonc` + `request_agent_tool_permissions`.

### Roles
- **Founder** (A0) — full Oracle access
- **Admin** — institution-level management
- **Operator** — execution workspace
- **Lecturer** — lecturer portal access
- **Student** (default 'user') — standard experience

### Commands
Bud natural language → orchestrator → InvokeLLM → agent routing. Authority code verification for executive actions.

### Workflows
8 CNCF-SWF workflows in `base44/workflows/`: Bud Notification Engine, Bud Reminders, Deadline Reminders, Event Reminders, Study Streak Reminders, Exam Countdown, Welcome New Student, Outreach Follow-up, University Connect Background Sync, Activate Scheduled Announcements, Study Group Message/Task Notifications, Task Deadline Reminders.

### Error Codes
- `CrashReport` entity (severity: error/warn/info) for frontend crashes.
- `ErrorBoundary` component.
- `UDSErrorState` / `PageNotFound` for UI states.
- Backend function errors bubble to frontend (no silent catch unless user-facing form/auth flow).

### Design Tokens
See **Section 4 (Design System)** below for the complete token specification. Defined in `src/index.css` (`:root` + `.dark`), mapped in `tailwind.config.js`.

### UI Standards
See **Section 4 (Design System)** and **Section 3 (UI/UX Standards)** below.

---

---

## Section 1 — Design System (Complete UI Specification)

### Colors (Midnight — dark-only)

**Foundation:**
| Token | Value | Usage |
|---|---|---|
| `--background` | `0 0% 0%` (#000000) | App root |
| `--foreground` | `0 0% 100%` (#FFFFFF) | Headlines |
| `--card` | `0 0% 7.8%` (#141414) | Cards |
| `--popover` | `0 0% 3.9%` (#0A0A0A) | Modals |
| `--primary` | `0 0% 100%` (#FFFFFF) | Interactive elements |
| `--secondary` | `0 0% 12%` (#1E1E1E) | Elevated surfaces |
| `--muted` | `0 0% 7.8%` | Muted backgrounds |
| `--muted-foreground` | `0 0% 64%` (#A3A3A3) | Body/secondary text |
| `--border` | `0 0% 18%` | Subtle borders |
| `--input` | `0 0% 12%` | Input backgrounds |

**Status (sparingly):**
| Token | Value | Usage |
|---|---|---|
| `--success` | `142 71% 45%` (#22C55E) | Success states |
| `--warning` | `53 96% 50%` (#FACC15) | Warnings |
| `--destructive` / `--error` | `0 84% 60%` (#EF4444) | Errors only |
| `--information` | `217 91% 60%` (#3B82F6) | Information / blue accent |
| `--gold` | `46 74% 55%` | Achievements only |

**Glass materials:**
- `--glass-bg`: `rgba(255,255,255,0.04)`
- `--glass-bg-strong`: `rgba(255,255,255,0.08)`
- `--glass-border`: `rgba(255,255,255,0.06)`
- `--glass-border-strong`: `rgba(255,255,255,0.10)`
- `--glass-blur`: `20px`

### Typography
Font: **Inter** (heading, body, display). Mono: `ui-monospace, SFMono-Regular`.

| Token | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| `--text-display` | 29px | 1.1 | 700 | -0.02em |
| `--text-heading` | 19px | 1.2 | 700 | -0.01em |
| `--text-title` | 17px | 1.25 | 600 | — |
| `--text-subtitle` | 14px | 1.3 | 600 | — |
| `--text-body` | 14px | 1.5 | 400 | — |
| `--text-caption` | 12px | 1.4 | 500 | — |
| `--text-label` | 11px | 1.3 | 600 | 0.01em |
| `--text-micro` | 10px | 1.3 | 600 | 0.04em, uppercase |

### Icons
**lucide-react** only. Only icons that exist. Import from `lucide-react`. Alias collisions (e.g., `Home as HomeIcon`).

### Buttons
- `UDSButton` — primary button primitive
- `button.jsx` (shadcn) — base button
- `.liquid-press` — tactile feedback (scale 0.96 on active)
- `.spring-tap` — snappy tap (scale 0.96 on active, 0.985 on desktop)
- Pill shape (`rounded-full`), outlined for primary CTAs, uppercase tracking for emphasis

### Cards
| Variant | Class | Usage |
|---|---|---|
| Standard glass | `.glass` / `.glass-card` | Default cards |
| Strong glass | `.glass-strong` | Modals, elevated |
| Crystal | `.crystal-card` | Premium cards with reflection |
| Liquid mirror | `.liquid-mirror` | Wet glossy premium cards |
| Mirror glass | `.mirror-glass` | Reflective surfaces |
| Frosted mirror | `.frosted-mirror` | Heavy frost |
| Chrome reflect | `.chrome-reflect` | Metallic edge |
| UDS card | `UDSCard` | Design system card |
| Hover lift | `.hover-lift` / `.card-hover` | Interactive cards |

### Inputs
- `GlassInput` — glass-styled input
- `FloatingLabelInput` — floating label
- `UDSInput` — design system input
- `.oracle-input` — Oracle form control
- 16px font on touch devices (prevents iOS zoom)
- `textarea.jsx` for multi-line

### Tables
`table.jsx` (shadcn) — standard table primitive.

### Charts
**recharts** library. Colors via `src/lib/academics/chartColors.js`. Chart keyframes: `.chart-rise` (scaleY 0→1).

### Navigation
| Component | Position | Purpose |
|---|---|---|
| `FloatingNav` | Top (fixed) | Primary navigation |
| `AdaptiveNav` | Bottom (fixed) | Context-adaptive tab bar |
| `EcosystemRail` | Side | Accessibility/mode toggles |
| `OracleShell` sidebar | Side (Oracle) | Admin navigation |
| Command palette | Overlay | Global search/commands |

### Empty States
`EmptyState.jsx` + `UDSEmptyState.jsx` — icon, title, description, Bud guidance, optional action. Reserved `{{EMPTY_STATE_IMAGE}}` placeholder.

### Error States
`ErrorBoundary` (crash boundary), `UDSErrorState`, `PageNotFound`. `CrashReport` entity logs errors.

### Loading States
`RouteLoading` (route transitions), `SkeletonCard`, `UDSLoadingState`, `.shimmer` animation. `fade-in-up` entrance.

### Motion & Animations
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (primary)
- Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- AI states: `.ai-thinking`, `.ai-searching`, `.ai-generating`, `.ai-planning`
- Bud states: `.bud-breathe`, `.bud-blink`, `.bud-speak`, `.bud-listen`, `.bud-celebrate`
- Entrance: `.fade-in-up`, `.slide-in-right`, `float-in`
- `prefers-reduced-motion` gates all animations
- Depth: `.depth-float`, `.breathe`, `.glow-pulse`

### Accessibility
- `.reduce-motion` — disables all animations/transitions
- `.high-contrast` — solid surfaces, full-tone borders
- `.reduce-transparency` — flattens glass to solid
- `.ux-large-text` — 1.13× zoom
- `:focus-visible` — 2px outline
- Safe area insets (`.safe-area-pt/pb/px`)
- Keyboard navigation support
- 16px inputs on touch devices

---

## Section 2 — Database Schema (Canonical Data Model)

All entities are JSON schemas in `base44/entities/*.jsonc`. Built-in attributes (never declared): `id`, `created_date`, `updated_date`, `created_by_id`. Below are the canonical core entities with key relationships.

### Core Entities

| Entity | Key Fields | Relationships |
|---|---|---|
| **User** (built-in) | id, email, full_name, role, created_date | Owner of all user-scoped data |
| **Institution** | name, type, logo_url, branding | Tenant scope (`institution_id`) |
| **Course** | code, title, credits, department, instructor_id | → CourseMaterial, Enrollment, Schedule |
| **Assignment** | course_id, title, due_date, status | → Course, submissions |
| **Community** | name, type, owner_id, member_count | → CommunityMember, QuadPost |
| **Conversation** | type, participants[], last_message | → Message, ConversationParticipant |
| **Message** | conversation_id, author_id, content | → Conversation |
| **Notification** | user_id, type, priority, is_read | → User |
| **CalendarEvent** | title, start/end_time, organizer_id | → CalendarInvitee |
| **Wallet** | user_id, balance, currency | → Transaction (FinancialTransaction) |
| **FinancialTransaction** | wallet_id, type, amount, reference_id | → Wallet |
| **AuditLog** | actor_id, action, detail, meta | Standalone (admin-only) |
| **BudMemory** | user_id, type, content, metadata | → User |
| **SparkAgent** | agent_id, name, division, role, permissions | Standalone (admin-only) |
| **TaskManagement** | title, assignee_ids[], member_ids[], status | → TaskComment, TaskActivity |
| **Workspace** | name, members[], type | → CollaborationItem, CollaborationActivity |
| **Presence** | user_id, status, last_active | → User |
| **CrashReport** | message, stack, url, user_id, severity | Standalone |
| **SecurityEvent** | type, severity, user_id, ip | Standalone (admin-only) |

### Tenant Scoping
Entities with `institution_id` field: `Course`, `Assignment`, `Community`, `CampusEvent`, `FoodItem`, `FootballMatch`, `CourseMaterial`, `OfficeHoursSlot`, `Podcast`, `TaskManagement`, `MarketplaceListing`, `LibraryResource`, and more.

### RLS Patterns
1. **Ownership** — `created_by_id: "{{user.id}}"`
2. **Role-based** — `user_condition: { role: "admin" }`
3. **Tenant** — `data.institution_id: "{{user.data.institution_id}}"`
4. **Member-based** — `data.member_ids: "{{user.id}}"` (collaboration)
5. **Status-based** — `data.status: "published"` (public content)

Full schemas are in `base44/entities/*.jsonc` — 90+ entities total.

---

## Section 3 — UI/UX Standards

| Standard | Specification |
|---|---|
| **Max screen load time** | < 2s first paint; lazy routes use `RouteLoading` |
| **Consistent navigation** | Single `FloatingNav` (top) + single `AdaptiveNav` (bottom); no redundant bars |
| **Responsive layouts** | Mobile-first; `.app-content` widens at `md` (760px) and `lg` (1080px) |
| **Offline behavior** | `OfflineBanner` + `useOnlineStatus`; writes queue via platform |
| **Progressive loading** | Suspense + lazy routes + skeleton states + `.shimmer` |
| **Accessibility** | Reduced motion, high contrast, reduce transparency, text scaling, keyboard nav, focus-visible, safe areas |
| **Mobile-first design** | Touch-optimized (16px inputs, tap targets, `touch-action: manipulation`, no tap highlight) |
| **Dark theme** | Midnight (dark-only) — primary design language |
| **Light theme** | Not implemented — known gap, out of v1.0 scope |
| **Autosave** | All creation flows feature autosave and clear feedback |
| **Error handling** | Errors bubble up (no try/catch unless user-facing form/auth); `ErrorBoundary` for crashes |
| **Image rendering** | All content images via `Image` component (`@/components/ui/image`) — never plain `<img>` |
| **Glass effects** | Maximize glass/mirror UI throughout; `.glass`, `.crystal-card`, `.liquid-mirror`, `.mirror-glass`, `.frosted-mirror` |
| **Brand assets** | Placeholder registry (see below); Founder supplies later |

---

## Section 4 — Feature Registry

Status legend: ✅ Live · ⚠️ Partial · ❌ Not implemented · 🔒 Platform-dependent

| Module | Status | Owner | Dependencies | Version |
|---|---|---|---|---|
| **Splash / Welcome / Onboarding** | ✅ | App | Auth | v1.0 |
| **Auth (email/password, Google)** | ✅ | Platform | — | v1.0 |
| **Auth (MFA, Biometric, Trusted Device)** | 🔒 | Platform | — | Deferred |
| **Bud Companion** | ✅ | App | InvokeLLM | v1.0 |
| **Oracle Governance** | ✅ | App | Auth, AuditLog | v1.0 |
| **Academic Hub** | ✅ | App | Course, Assignment entities | v1.0 |
| **Study Suite** | ✅ | App | LearningPath, Flashcard | v1.0 |
| **Exam Platform** | ✅ | App | ExamPaper, ExamAttempt | v1.0 |
| **Social (Quad, Shorts, Stories)** | ✅ | App | QuadPost, ShortVideo, Story | v1.0 |
| **Messaging** | ✅ | App | Conversation, Message | v1.0 |
| **Communities** | ✅ | App | Community entity | v1.0 |
| **Marketplace** | ✅ | App | MarketplaceListing | v1.0 |
| **Wallet / Finance** | ✅ | App | Wallet, Stripe | v1.0 |
| **Collaboration (Workspaces)** | ✅ | App | Workspace, CollaborationItem | v1.0 |
| **Task Management** | ✅ | App | TaskManagement | v1.0 |
| **Knowledge Hub** | ✅ | App | UploadFile, ExtractData | v1.0 |
| **Notifications** | ✅ | App | Notification entity | v1.0 |
| **Calendar** | ✅ | App | CalendarEvent, Google Calendar | v1.0 |
| **Podcasts** | ✅ | App | Podcast, PodcastEpisode | v1.0 |
| **Creator Studio** | ✅ | App | Podcast, ShortVideo | v1.0 |
| **Football Hub** | ✅ | App | FootballMatch, FootballNews | v1.0 |
| **Campus Hub** | ✅ | App | CampusEvent, Club | v1.0 |
| **Career Hub** | ✅ | App | Opportunity, CompanyPage | v1.0 |
| **Mentorship** | ✅ | App | Mentor, MentorshipRequest | v1.0 |
| **Institution Portal** | ⚠️ | App | Institution entity | v1.0 (consolidate) |
| **Lecturer Portal** | ✅ | App | Course, OfficeHours | v1.0 |
| **Management Portal** | ✅ | App | ManagementTask, Staff | v1.0 |
| **Operator Portal** | ✅ | App | OperatorAssignment | v1.0 |
| **Architect (No-code Builder)** | ✅ | App | ArchitectConfig | v1.0 |
| **Automation Center** | ✅ | App | Automation entity | v1.0 |
| **Security Center** | ✅ | App | SecurityEvent, Device | v1.0 |
| **Admin Hub** | ✅ | App | AdminInsights | v1.0 |
| **Oracle Dashboard** | ✅ | App | AuditLog, CrashReport | v1.0 |
| **Stripe Payments** | ✅ | App | stripePayment function | v1.0 (test mode) |
| **Google Calendar Sync** | ✅ | App | googlecalendar connector | v1.0 |
| **Workflows** | ✅ | App | base44/workflows/ | v1.0 |
| **In-app Agents (13)** | ✅ | App | base44/agents/ | v1.0 |
| **Realtime Subscriptions** | ✅ | Platform | — | v1.0 |
| **Crash Reporting** | ✅ | App | CrashReport entity | v1.0 |
| **Analytics** | ✅ | App | base44.analytics | v1.0 |
| **Accessibility (motion/contrast/text)** | ✅ | App | CSS classes | v1.0 |
| **Brand Asset Placeholders** | ⚠️ | App | brandAssets.js | v1.0 (formalize) |
| **i18n** | ❌ | App | — | Deferred (critical gap) |
| **Light Theme** | ❌ | App | — | Deferred |
| **Voice/Video/Streaming** | ❌ | Platform | WebRTC | Rejected (dead end) |
| **Portal Consolidation** | ⚠️ | App | — | v1.0 freeze blocker |
| **Orphaned Page Cleanup** | ⚠️ | App | — | v1.0 freeze blocker |
| **Brand Component Consolidation** | ⚠️ | App | — | v1.0 freeze blocker |

---

## Brand Asset Placeholder Registry

Reserved tokens for Founder-supplied assets. The system never generates these. Every rendering path should resolve through a single canonical component per placeholder.

| Placeholder | Canonical Component | Status |
|---|---|---|
| `{{UNIBUD_PRIMARY_LOGO}}` | `UnibudLogo.jsx` | Consolidate duplicates |
| `{{UNIBUD_MARK}}` | `UnibudMark.jsx` / `BrandMark.jsx` | Consolidate to one |
| `{{UNIBUD_ICON}}` | `UnibudIcon.jsx` | Favicon + PWA + touch icons |
| `{{BUD_ICON}}` | `BudOrb.jsx` / `BudAvatar.jsx` | Consolidate |
| `{{ORACLE_ICON}}` | Oracle shell header | Reserve |
| `{{INSTITUTION_LOGO}}` | `InstitutionStatusBadge` | Per-tenant logo field |
| `{{COMMUNITY_ICON}}` | `CommunityHeader.jsx` | Per-community avatar |
| `{{USER_AVATAR}}` | Profile + presence | Fallback initial-letter |
| `{{EMPTY_STATE_IMAGE}}` | `EmptyState.jsx` / `UDSEmptyState.jsx` | Consistent fallback |
| `{{WELCOME_BACKGROUND}}` | `welcomeBackgrounds.js` | Already data-driven |

---

## Version Freeze Checklist

Before declaring **UNIBUD OS Core Architecture v1.0 Frozen**:

- [ ] All 112 orphaned pages deleted; no unresolved imports
- [ ] Single portal implementation; parallel portals removed
- [ ] One brand component per `{{PLACEHOLDER}}`; duplicates removed
- [ ] Brand asset placeholder registry formalized in one module
- [ ] i18n runtime selected and string extraction complete (or formally deferred with Founder sign-off)
- [ ] Redundant nav components removed
- [ ] No `console.log`/debug scaffolding in production paths
- [ ] All entities have RLS reviewed (no open writes)
- [ ] All backend functions tested via `test_backend_function`
- [ ] All workflows have at least one successful run logged
- [ ] Stripe checkout tested end-to-end in sandbox (test card 4242)
- [ ] Google Calendar sync verified with authorized connector
- [ ] Crash reporting confirmed capturing real errors
- [ ] Accessibility pass: reduced-motion, high-contrast, keyboard navigation
- [ ] Bundle size audit after orphan cleanup
- [ ] Founder sign-off on deferred platform-dependent items

---

## Revision Policy

**This is v1.0 — frozen.**

After freeze, changes go through **versioned revisions**:
- **v1.1** — minor additions, no breaking changes
- **v1.2** — incremental enhancements
- **v2.0** — breaking architectural changes (requires Founder approval)

No continual expansion of the original blueprint. No new constitutions that could create contradictions. This document is the single source of truth.

---

*UNIBUD OS Core Architecture v1.0 — Frozen 2026-08-01*