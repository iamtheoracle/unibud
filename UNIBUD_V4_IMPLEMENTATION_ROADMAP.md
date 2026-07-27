# UNIBUD v4.0 — Founder Implementation Roadmap

> **Status:** Founder-Approved Master Implementation Guide
> **Authority:** Executive Founding Team — Founder, CPO, CDO, Head of UX, Principal Engineer, Platform Architect, Oracle System, Spark, Bud
> **Effective Date:** 2026-07-27
> **Purpose:** The single source of truth for every future coding prompt. No implementation prompt may deviate from this roadmap without Founder approval via the Product Governance Protocol.

---

## 0. Governing Principles

### 0.1 Feature Preservation (Mandatory & Non-Negotiable)

UNIBUD is feature-complete. The v4.0 program **enriches, never shrinks**.

- ❌ Do NOT remove any approved feature
- ❌ Do NOT merge features
- ❌ Do NOT hide functionality
- ❌ Do NOT simplify by deleting capabilities
- ❌ Do NOT rename existing systems
- ❌ Do NOT delete existing dashboards
- ❌ Do NOT replace working workflows
- ✅ Improve hierarchy, layout, visual language, interactions, accessibility, responsiveness, performance, consistency

### 0.2 What We Preserve (Every Item)

- Every Page, Dashboard, Portal, Workspace, Registry, Service
- Every AI capability (Bud, Spark, Oracle, Atlas, Sage, Nova, Pulse, Nexus, Sentinel)
- Every Navigation path, User flow, Database structure, Backend logic, Business rule
- Every Security model, Permission set, Feature flag, API, Integration

### 0.3 What We Improve

| Dimension | Direction |
|---|---|
| Hierarchy | Tighter information architecture; clearer parent-child relationships |
| Layout | Per-workspace spatial fingerprints; less generic skeleton reuse |
| Visual Language | Liquid Glass v5.0; Deep Midnight Blue signature; crystal materials |
| Interactions | Spring physics; momentum; shared transitions; liquid morphing |
| Accessibility | AAA readability; reduced-motion; high-contrast; large-text |
| Responsiveness | iPhone-first; tablet widening; desktop pointer affordances |
| Performance | Registry-driven data; single-fanout queries; code-splitting |
| Consistency | Unified tokens; one design language across every surface |

### 0.4 Execution Rules for Future Prompts

1. Every implementation prompt references a Phase ID from this roadmap.
2. No prompt implements across phases out of order unless dependencies allow.
3. Every change is additive or a pure upgrade — never a deletion of approved capability.
4. Any deviation requires a PVR (Product Variance Report) filed against the Blueprint.
5. All work must demonstrably save time, reduce stress, or improve academic success.

---

## 1. Master Implementation Roadmap

Phases are sequenced by dependency. Each phase below uses the canonical 13-field template.

---

### Phase 1 — Foundation

**Purpose:** Harden the design-system bedrock (tokens, glass materials, motion primitives, shared utilities) so every later phase inherits a consistent substrate.

**Dependencies:** None — this is the root.

**Features affected:** Design tokens, Liquid Glass material library, motion primitives, ambient backgrounds, shared UI primitives (UDSButton, UDSInput, UDSCard, UDSEmptyState, UDSLoadingState, UDSErrorState).

**Components affected:** `src/index.css`, `tailwind.config.js`, `src/components/foundation/*`, `src/components/uds/*`, `src/components/layout/AmbientBackground.jsx`, `src/lib/glassPresets.js`, `src/lib/uds/tokens.js`.

**APIs affected:** None.

**Registry updates:** None.

**Database impact:** None.

**AI impact:** None.

**UI impact:** Unified token map; all surfaces inherit v5.0 "Midnight" palette; glass material consistency; spring easing standard.

**Testing requirements:** Visual regression on token surfaces; contrast audit (AAA target); reduced-motion path verified.

**Acceptance criteria:**
- Every color/typography/radius/shadow resolves through a token.
- No hardcoded hex/rgb in JSX.
- Light + dark modes both pass AAA on primary text.
- `prefers-reduced-motion` disables all decorative animation.

**Risks:** Token rename cascades into broken classes across legacy components.

**Founder approval required:** Token palette changes; glass material spec changes.

---

### Phase 2 — Authentication

**Purpose:** Premium, calm, conversion-optimized auth surface preserving every existing flow (email/password, Google, OTP, reset, forgot).

**Dependencies:** Phase 1.

**Features affected:** Login, Register, ForgotPassword, ResetPassword, MeetBud, Splash, Welcome, ProtectedRoute, AuthLayout.

**Components affected:** `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/ForgotPassword.jsx`, `src/pages/ResetPassword.jsx`, `src/pages/MeetBud.jsx`, `src/pages/Splash.jsx`, `src/pages/Welcome.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/auth/*`.

**APIs affected:** `loginViaEmailPassword`, `register`, `verifyOtp`, `resendOtp`, `resetPasswordRequest`, `resetPassword`, `loginWithProvider`, `isAuthenticated`, `logout`.

**Registry updates:** None.

**Database impact:** None — User entity is built-in and read-only.

**AI impact:** Bud greeting on MeetBud preserved.

**UI impact:** Glass auth surfaces; spring entrance; OTP multi-step retained (never shortcut to login); post-login `returnTo` resolution preserved.

**Testing requirements:** Full register→OTP→verify→redirect flow; reset token flow; Google OAuth; unverified-user guard; forgot-password generic-success behavior.

**Acceptance criteria:**
- Every auth flow completes end-to-end with real backend.
- No unverified session breakage.
- Hard redirects (not `navigate()`) after auth state changes.
- All visible strings localized to user language.

**Risks:** Auth template recreation; returnTo regression.

**Founder approval required:** Any change to post-login destination; any flow shortening.

---

### Phase 3 — Onboarding

**Purpose:** Adaptive, Bud-guided onboarding that personalizes the first run without removing any existing step.

**Dependencies:** Phase 1, Phase 2.

**Features affected:** Welcome, UniversityDirectory, InstitutionOnboarding, Interests, AcademicGoals, LearningPreferences, StudySchedule, Permissions, BiometricSetup, SecurePin, LanguageRegion, PersonalizedLoading, CampusTutorial, IntroCarousel, MeetBud.

**Components affected:** `src/pages/onboarding/*`, `src/components/onboarding/*`, `src/pages/institution/InstitutionOnboarding.jsx`, `src/pages/onboarding/UniversityDirectory.jsx`.

**APIs affected:** `base44.auth.updateMe`, `base44.entities.Institution`, university connect sync functions.

**Registry updates:** None.

**Database impact:** User extra-data writes via `updateMe`; institution linkage.

**AI impact:** Bud onboarding narrative; Spark personalization seeding.

**UI impact:** Spatial onboarding journey; Bud as guide; progress persistence; resumable steps.

**Testing requirements:** Resume-after-quit; institution selection; interest→recommendation seeding; language switch.

**Acceptance criteria:**
- Onboarding resumable from last completed step.
- All steps retained (no merge).
- Bud narrative consistent and non-technical.

**Risks:** Step-order coupling; loss of state on refresh.

**Founder approval required:** Step ordering; institution picker scope.

---

### Phase 4 — Campus Experience (Home)

**Purpose:** Bud's adaptive dashboard — context-aware widget orchestration, prioritized insight over redundant density.

**Dependencies:** Phase 1, Phase 3.

**Features affected:** Home dashboard, TodayCard, QuickActions, AcademicSnapshot, UpcomingDeadlines, BudCard, WeatherWidget, HeroAcademicCard, LivingBudCard, AcademicPulseWidget, HomeMessages, HomePayments, HomeCommunity, FloatingSearch, BudContextBar, ToolRecommendationStrip, PullToRefresh.

**Components affected:** `src/pages/Home.jsx`, `src/components/home/*`, `src/components/unibud/*`, `src/components/weather/*`, `src/components/spark/ToolRecommendationStrip.jsx`, `src/lib/bud/homeOrchestrator.js`, `src/lib/UnibudContext.jsx`, `src/hooks/useHomeContext.js`.

**APIs affected:** Course, Assignment, Exam, StudySession, CalendarEvent, Notification, Wallet/Fee, QuadPost, Conversation entities; weather hook.

**Registry updates:** Home widget registry (order, priority, visibility conditions).

**Database impact:** Read-only aggregations.

**AI impact:** Bud context pulse; Spark tool recommendations; adaptive widget ordering.

**UI impact:** One-rhythm feed; hero academic card; living Bud; pulse widget; no redundant stacks.

**Testing requirements:** Widget ordering changes by context; pull-to-refresh invalidates queries; empty/loading states; recommendation cooldown.

**Acceptance criteria:**
- Dashboard reorders by context (deadline proximity, exam proximity, time of day).
- Every widget has loading + empty states.
- Single query fanout; no per-widget refetch storms.

**Risks:** Over-orchestration causing layout thrash.

**Founder approval required:** Default widget order; which contexts trigger reordering.

---

### Phase 5 — Quad

**Purpose:** Collapse Quad to one-rhythm feed with interstitials; preserve all post types, stories, shorts, traditions, celebrations, communities preview, trending.

**Dependencies:** Phase 1, Phase 4.

**Features affected:** Quad feed, PostComposer, PostCard, StoryBar, Shorts, CampusTraditionsGallery, CommunitiesPreview, TrendingSection, CelebrationsCarousel, reactions, comments, shares.

**Components affected:** `src/pages/Quad.jsx`, `src/components/quad/*`, `src/components/stories/*`, `src/components/shorts/*`.

**APIs affected:** QuadPost, QuadComment, Story, StoryView, StoryReply, ShortVideo, ShortVideoComment, CampusTradition, Celebration, Community.

**Registry updates:** Feed interstitial registry; post-type registry.

**Database impact:** None.

**AI impact:** Spark feed ranking (optional); content moderation (Sentinel).

**UI impact:** Single rhythm; interstitials between posts; shared-element transitions; reaction spring animations.

**Testing requirements:** Infinite scroll; new-posts banner; compose all post types; story viewer; short video player; report flow.

**Acceptance criteria:**
- Feed renders demo + live modes.
- All post types compose + display.
- Interstitials do not duplicate or break infinite scroll.

**Risks:** Interstitial injection breaking virtualization.

**Founder approval required:** Interstitial cadence; which content qualifies as interstitial.

---

### Phase 6 — Connect

**Purpose:** People-first portals replacing the launcher grid; preserve messages, study matching, groups, mentorship, events, career network, safety.

**Dependencies:** Phase 1, Phase 4.

**Features affected:** Connect hub, Messages, Friends, Following, StudyGroups, Mentorship, MentorProfile, CareerHub, Companies, Opportunities, SafetyBanner.

**Components affected:** `src/pages/Connect.jsx`, `src/components/connect/*`, `src/components/messaging/*`, `src/pages/Messages.jsx`, `src/pages/social/*`.

**APIs affected:** Conversation, Message, SocialConnection, FriendRequest, Follow, StudyGroup, StudyGroupMessage, Mentor, MentorshipRequest, MentorReview, Opportunity, CompanyPage, UniversityConnection.

**Registry updates:** Connect portal registry.

**Database impact:** None.

**AI impact:** Spark study matching; Bud people suggestions.

**UI impact:** People-first portals; conversation-first; presence indicators; shared transition to profiles.

**Testing requirements:** Start conversation; send/receive; reactions; study match; mentor request; follow/unfollow.

**Acceptance criteria:**
- All connect portals reachable; no launcher-only dead ends.
- Presence real-time; messages persist.

**Risks:** Presence global-read privacy (known issue — preserve current behavior).

**Founder approval required:** Portal ordering; safety banner prominence.

---

### Phase 7 — Me

**Purpose:** Three-zone identity (who I am / what I've done / what I manage) — preserve all profile sections, settings, documents, memory, achievements, timeline, goals, guardian access.

**Dependencies:** Phase 1, Phase 4.

**Features affected:** Me dashboard, ProfileHeader, AcademicSummary, AcademicHistory, AcademicProgressSection, AchievementsSection, BadgesSection, GoalsSection, BudMemorySection, LearningInsights, DocumentLibrary, DownloadsSection, GuardianAccessSection, SettingsSection, EditProfileModal, StudyStatsSection, CampusLifeSection, MatriculationCard, StreakShowcase, AcademicTimeline.

**Components affected:** `src/pages/Me.jsx`, `src/components/me/*`, `src/components/identity/*`, `src/pages/identity/*`.

**APIs affected:** User (read), StudentRecord, StudentGrade, Assignment, Exam, StudySession, AcademicTimelineEntry, PortfolioItem, DigitalBadge, StudentAchievement, StudentDocument, BudMemory, ConsentLink, StudentGoal.

**Registry updates:** Profile zone registry (3 zones).

**Database impact:** None.

**AI impact:** Bud memory surface; Spark learning insights.

**UI impact:** 3-zone identity layout; shared-element into detail; profile completeness nudge.

**Testing requirements:** Edit profile; manage guardian access; export documents; timeline CRUD; goal CRUD.

**Acceptance criteria:**
- All profile sections retained and grouped into 3 zones.
- No section removed or merged.

**Risks:** Zone grouping hiding low-frequency sections.

**Founder approval required:** Zone assignment of each section.

---

### Phase 8 — Bud

**Purpose:** Bud as the sole visible companion — living, listening, reasoning, planning states; preserve all Bud surfaces (panel, orb, voice, memory, proactive, categories, suggested prompts).

**Dependencies:** Phase 1, Phase 4.

**Features affected:** BudHome, BudPanel, BudCompanion, BudVoiceOrb, BudLivingOrb, BudVoiceMode, BudMemoryTimeline, BudContextCards, BudSheet, BudOrbPrefsSheet, ProactiveBud, BudCategories, SuggestedPrompts, QuickActions, BudWelcome, BudFigure, BudCharacter, BudAvatar, BudThinking, ChatMessage, ConversationHistory, AgentActivityIndicator, BudComposer, ChatInput.

**Components affected:** `src/pages/bud/*`, `src/components/bud/*`, `src/lib/bud/*`.

**APIs affected:** BudConversation, BudMemory, InvokeLLM (via Spark adapter), all specialist services via Oracle orchestration.

**Registry updates:** Bud state animation registry (thinking/listening/reasoning/typing/generating/searching/planning).

**Database impact:** Conversation + memory writes.

**AI impact:** Bud personality, constitution, prompts, orchestrator, Spark port adapter; Oracle orchestration protocol (Bud→Oracle→Specialist→Oracle→Bud).

**UI impact:** Living Bud orb with emotion states; warm mentor tone; never exposes agents/routing; shared transition into Bud panel.

**Testing requirements:** Conversation persistence; memory recall; voice mode; proactive nudges; state animations; reduced-motion fallback.

**Acceptance criteria:**
- Bud never references agents, routing, or architecture.
- All states animate then settle; reduced-motion disables.
- Memory persists across sessions.

**Risks:** Orchestrator latency; provider fallback.

**Founder approval required:** Personality changes; orchestrator routing rules.

---

### Phase 9 — Spark

**Purpose:** Spark as the intelligence engine behind Bud — provider registry, port adapters, runtime fallback (OpenAI↔Mock), memory, reasoning, recommendations, notifications intelligence.

**Dependencies:** Phase 1, Phase 8.

**Features affected:** Spark provider registry, providers (OpenAI, Anthropic, Gemini, Mock, Local), reasoning, planning, writing, translation, summaries, search, recommendations, personalization, knowledge, automation, trust/security, trust/privacy, learning, memory, context, notifications intelligence.

**Components affected:** `src/lib/spark/*`, `src/lib/providers/*`, `src/components/spark/*`.

**APIs affected:** InvokeLLM, AIServiceMetric, AIServiceRecommendation, ProviderConnection, ProviderLog, ToolRecommendation, RecommendationPreference.

**Registry updates:** Provider registry; AI service registry; recommendation-type registry.

**Database impact:** Provider logs, metrics, recommendations, preferences.

**AI impact:** Provider abstraction; runtime fallback; credit-aware model selection; add_context_from_internet gating.

**UI impact:** Tool recommendation strip; AI state animations surface through Bud.

**Testing requirements:** Provider fallback chain; credit cost guardrails; recommendation cooldown; memory interface contract.

**Acceptance criteria:**
- Fallback never breaks a Bud response.
- Non-default model usage is intentional and logged.
- Recommendations respect cooldown + disabled types.

**Risks:** Provider outage; cost blowout from non-default models.

**Founder approval required:** Default model; fallback order; which features may use non-default models.

---

### Phase 10 — Oracle

**Purpose:** Oracle as the knowledge & intelligence core — preserve all Oracle sections; upgrade Live Registry Dashboard, platform health, audit, governance, monitoring.

**Dependencies:** Phase 1, Phase 9.

**Features affected:** Oracle dashboard, Live Registry Dashboard, InstitutionRegistry, ProductRegistry, UserGovernance, AIGovernance, OracleSecurity, IntegrationCenter, ProviderHub, Monitoring, AIMonitoring, AuditCenter, GlobalSearch, OracleShell, CommandPalette, OracleContextSidebar.

**Components affected:** `src/pages/oracle/Oracle.jsx`, `src/components/oracle/*`, `src/lib/oracle/*`, `src/lib/oracleEcosystem.js`.

**APIs affected:** All registry entities (single fanout in `useRegistryMetrics`); AuditLog; AIServiceMetric; ProviderLog; SecurityEvent; AutomationRun; Institution; User.

**Registry updates:** Oracle module registry; metric section registry; live activity event-type registry.

**Database impact:** Read-only aggregations for dashboard.

**AI impact:** Oracle orchestration protocol; agent network visualization.

**UI impact:** Mission-control crystal cards; live health hero; filterable metric grids; live activity feed; 30s auto-refresh + refetch-on-focus.

**Testing requirements:** Admin-only access; metric accuracy vs raw entity counts; filter application per-entity (no zeroing unrelated entities); polling performance at scale.

**Acceptance criteria:**
- Every metric sourced from real registry entities — zero mocks.
- Single React Query fanout; one re-render per refresh.
- Filters apply only where fields exist.

**Risks:** Polling cost at large scale; metric drift.

**Founder approval required:** Health scoring weights; metric definitions.

---

### Phase 11 — Operations Center

**Purpose:** Unified operations execution surface — preserve Operator, Management, Architect, Automation, Security centers; improve hierarchy and cross-center navigation.

**Dependencies:** Phase 1, Phase 10.

**Features affected:** Operator (TaskCenter, SupportDesk, StudentOperations, AdmissionOperations, ExaminationOperations, DocumentCenter, FinanceOperations, OperatorNotifications, GlobalSearch, Performance), Management, Architect, AutomationCenter, WorkflowBuilder, SecurityCenter.

**Components affected:** `src/pages/operator/*`, `src/pages/management/*`, `src/pages/architect/*`, `src/pages/automation/*`, `src/pages/SecurityCenter.jsx`, `src/components/operator/*`, `src/components/management/*`, `src/components/architect/*`.

**APIs affected:** ManagementTask, OperatorAssignment, OperatorRole, SupportTicket, Automation, AutomationRun, ArchitectConfig, ArchitectProject, SecurityEvent, ApiKey, Device, AuditLog.

**Registry updates:** Operations module registry (per center).

**Database impact:** None.

**AI impact:** Oracle agent network; Sentinel moderation; Spark automation.

**UI impact:** Cross-center rail; shared command palette; consistent task workflow; status tabs.

**Testing requirements:** Task lifecycle; automation run; workflow builder; security event triage; role-based visibility.

**Acceptance criteria:**
- All four centers reachable; no merged dashboards.
- Task workflow end-to-end; audit trail intact.

**Risks:** Role overlap ambiguity.

**Founder approval required:** Center ordering; role-to-center mapping.

---

### Phase 12 — Management

**Purpose:** Operational management HQ — preserve institution onboarding, approvals, staff, finance, compliance, communications, reporting.

**Dependencies:** Phase 1, Phase 11.

**Features affected:** Management dashboard, Analytics, Communication, Reporting, EntityModule, institution onboarding, approvals, user management, notifications, audit logs, security, settings.

**Components affected:** `src/pages/management/Management.jsx`, `src/components/management/*`.

**APIs affected:** Institution, InstitutionOutreach, Staff, ManagementTask, AuditLog, Notification, Role, Admission, FinancialTransaction.

**Registry updates:** Management module registry.

**Database impact:** None.

**AI impact:** Sentinel compliance; Nova institution intelligence.

**UI impact:** Management shell; entity module grid; approval queues.

**Testing requirements:** Onboarding pipeline; approval flow; staff CRUD; report export.

**Acceptance criteria:**
- All management sections retained; no merges.

**Risks:** Approval state machine regression.

**Founder approval required:** Approval thresholds; staff role definitions.

---

### Phase 13 — Architect

**Purpose:** No-code platform builder — preserve module architecture, feature flags, system health, integrations, entity schema, maintenance, builders (Page, Form, Dashboard, Report, Workflow, Notification, Theme, Menu, Permission, Component, VersionControl).

**Dependencies:** Phase 1, Phase 11.

**Features affected:** Architect shell + all builder sections, ConfigManager, configStore, editorState.

**Components affected:** `src/pages/architect/Architect.jsx`, `src/components/architect/*`, `src/lib/architect/*`.

**APIs affected:** ArchitectConfig, ArchitectProject, PlatformModule, feature flags.

**Registry updates:** Builder tool registry.

**Database impact:** Config writes (architect configs).

**AI impact:** AIBuilder section.

**UI impact:** Builder canvas; consistent tool headers; live preview.

**Testing requirements:** Each builder produces valid output; config persistence; version control.

**Acceptance criteria:**
- All builders retained; no removal.
- Config round-trips save/load.

**Risks:** Config schema migration.

**Founder approval required:** Builder scope; config schema changes.

---

### Phase 14 — Founder Dashboard

**Purpose:** Executive founder surface aggregating Oracle, Management, Architect, Finance into one strategic view.

**Dependencies:** Phase 10, Phase 11, Phase 12, Phase 13.

**Features affected:** Founder aggregate view; executive dashboard; strategic KPIs.

**Components affected:** New executive surface composing existing center summaries (no new business logic).

**APIs affected:** Reuses Oracle registry metrics, Management stats, Finance summaries.

**Registry updates:** Founder KPI registry.

**Database impact:** None (read-only composite).

**AI impact:** Oracle decision intelligence.

**UI impact:** Single executive overview; drill-down into each center.

**Testing requirements:** KPI accuracy vs source centers; drill-down navigation.

**Acceptance criteria:**
- Every KPI traceable to a source center.
- No duplicated logic — composes existing queries.

**Risks:** Stale composite if source centers change.

**Founder approval required:** KPI selection; access roles.

---

### Phase 15 — Institution Portal

**Purpose:** Per-institution operational portal — preserve dashboard, communications, permissions, admissions, branding, records, academic, analytics, Bud admin, results, help desk, timetable, documents.

**Dependencies:** Phase 1, Phase 12.

**Features affected:** InstitutionPortal, InstitutionConsole, PortalShell + all portal sections.

**Components affected:** `src/pages/institution/*`, `src/components/institution/*`, `src/lib/institution/*`.

**APIs affected:** Institution, Staff, Admission, StudentRecord, Course, InstitutionTimetable, InstitutionDocument, StaffAnnouncement, AnnouncementRead, FeeStructure.

**Registry updates:** Institution portal section registry.

**Database impact:** None.

**AI impact:** Nova institution intelligence; Sage lecturer intelligence.

**UI impact:** Institution shell; section grid; branding theming.

**Testing requirements:** RLS by institution_id; announcement publish/schedule; timetable CRUD; branding applies.

**Acceptance criteria:**
- All portal sections retained; RLS enforced; branding consistent.

**Risks:** RLS lock-out; cross-tenant leakage.

**Founder approval required:** Section ordering; branding token scope.

---

### Phase 16 — Parent Portal

**Purpose:** Parent/guardian view of student progress — preserve overview, academic progress, attendance, assignments, upcoming exams, study hours, fees, messaging, notifications, Bud insights, notices.

**Dependencies:** Phase 1, Phase 15.

**Features affected:** ParentPortal, ParentShell + all parent sections, LinkStudent, guardian consent.

**Components affected:** `src/pages/parent/*`, `src/components/parent/*`.

**APIs affected:** parentPortalData function, guardianConsent function, ConsentLink, StudentRecord, StudentGrade, AttendanceRecord, Assignment, Exam, Fee, Wallet.

**Registry updates:** Parent portal section registry.

**Database impact:** Consent links.

**AI impact:** Bud parent insights.

**UI impact:** Parent shell; consent-gated access; calm summary cards.

**Testing requirements:** Link student; consent flow; data scoping to linked student; messaging.

**Acceptance criteria:**
- Parent sees only linked student's data; consent enforced.

**Risks:** Consent regression; over-broad data exposure.

**Founder approval required:** Consent scope; data fields visible to parent.

---

### Phase 17 — Lecturer Portal

**Purpose:** Lecturer teaching workspace — preserve dashboard, courses, classes, attendance, assignments, exams, grades, projects, research, analytics, messages, office hours, Bud, timetable.

**Dependencies:** Phase 1, Phase 15.

**Features affected:** LecturerPortal, LecturerShell + all lecturer sections, LiveClassroom.

**Components affected:** `src/pages/lecturer/*`, `src/components/lecturer/*`, `src/pages/classroom/LiveClassroom.jsx`, `src/components/live/*`, `src/components/classroom/*`.

**APIs affected:** Course, Assignment, Exam, AttendanceRecord, AttendanceSession, LiveClass, LiveRecording, Grade, Project, ResearchProject, BudConversation.

**Registry updates:** Lecturer portal section registry.

**Database impact:** None.

**AI impact:** Sage lecturer intelligence; Bud lecturer OS.

**UI impact:** Lecturer shell; teaching-first layout; live classroom controls.

**Testing requirements:** Start live class; attendance code check-in; grading workflow; analytics.

**Acceptance criteria:**
- All lecturer sections retained; live class orchestration intact.

**Risks:** Live class media constraints (known — WebRTC unsupported; preserve current approach).

**Founder approval required:** Live class capabilities scope.

---

### Phase 18 — Student Portal

**Purpose:** Student academic workspace — preserve Courses, CourseSpace, UnifiedAgenda, Timetable, Calendar, Assignments, Projects, Exams, Attendance, Notes, StudySessions, StudySuite + all study tools, ExamHub + exam platform, KnowledgeHub, CollaborationHub, Wallet, Finance.

**Dependencies:** Phase 1, Phase 4.

**Features affected:** All academic + study + exam + knowledge + collaboration + wallet + finance pages.

**Components affected:** `src/pages/academics/*`, `src/pages/study/*`, `src/pages/exam/*`, `src/pages/knowledge/*`, `src/pages/collaboration/*`, `src/pages/wallet/*`, `src/pages/finance/*`, `src/components/academics/*`, `src/components/study/*`, `src/components/exam/*`, `src/components/knowledge/*`, `src/components/collaboration/*`, `src/components/wallet/*`, `src/components/finance/*`.

**APIs affected:** Course, Assignment, Exam, ExamPaper, ExamQuestion, ExamAttempt, ExamCertificate, TimetableEntry, CalendarEvent, AttendanceRecord, Note, StudentDocument, StudySession, StudyGoal, Flashcard, QuizAttempt, Citation, Project, Workspace, CollaborationItem, CollaborationComment, CollaborationVersion, CollaborationActivity, WorkspacePresence, Wallet, WalletLedger, Card, FinancialTransaction, FeeStructure, Fee, Scholarship, ScholarshipAward, KYCRecord, PaymentAttempt, RefundRequest, WebhookEvent.

**Registry updates:** Academic tool registry; study tool registry; exam stage registry; wallet module registry.

**Database impact:** None.

**AI impact:** Atlas academic intelligence; Spark study tools; Bud exam coach.

**UI impact:** Consistent academic shell; shared transition into CourseSpace; study tool cards; exam staged flow; wallet glass cards.

**Testing requirements:** Course space; assignment lifecycle; exam take→result→certificate; flashcard/quiz; collaboration item CRUD; wallet transactions; fee payment.

**Acceptance criteria:**
- All student tools retained; no merges; staged flows intact.

**Risks:** Exam state machine; payment provider (Stripe, region NG).

**Founder approval required:** Exam strict mode; wallet activation flow; payment provider.

---

### Phase 19 — Analytics

**Purpose:** Unified analytics across student, institution, and platform — preserve Results, SummaryReport, AnalyticsDashboard, ProgressDashboard, registry metrics, finance reports, management reporting.

**Dependencies:** Phase 10, Phase 18.

**Features affected:** Results, SummaryReport, AnalyticsDashboard, ProgressDashboard, StudyGoalsTracker, GradeLogger, report charts, AcademicAnalytics, registry metrics, finance reports, management reporting.

**Components affected:** `src/pages/academics/Results.jsx`, `src/pages/academics/SummaryReport.jsx`, `src/components/academics/report/*`, `src/components/academics/*`, `src/lib/academics/*`.

**APIs affected:** StudentGrade, StudySession, Assignment, Exam, AttendanceRecord, reportEngine aggregations.

**Registry updates:** Analytics registry; report template registry.

**Database impact:** None (computed).

**AI impact:** Spark summaries; Bud report actions.

**UI impact:** Consistent chart palette; export bar; empty chart states.

**Testing requirements:** GPA calculation; streak timeline; export PDF/PNG; empty data states.

**Acceptance criteria:**
- Report metrics match raw entity computation; export works.

**Risks:** GPA scale drift; export bundle size.

**Founder approval required:** GPA scale; report templates.

---

### Phase 20 — Registry System

**Purpose:** Centralize all registries (global, oracle, campus, communication, academics, collaboration, knowledge, career, wallet, social, institution, operator, management, architect) into a coherent, auto-refreshing system.

**Dependencies:** Phase 1.

**Features affected:** globalRegistries, oracle modules, campus registry, communication registry, academics registry, collaboration templates, knowledge engine, career constants, wallet nav, social engines, institution config, operator modules, management modules, architect modules.

**Components affected:** `src/lib/globalRegistries.js`, `src/lib/oracle/modules.js`, `src/lib/campus/registry.js`, `src/lib/communication/registry.js`, `src/lib/academics/registry.js`, `src/lib/collaboration/templates.js`, `src/lib/knowledge/knowledgeEngine.js`, `src/lib/career/careerConstants.js`, `src/components/wallet/walletNav.js`, `src/lib/social/engines.js`, `src/lib/institutionConfig.js`, `src/lib/operator/modules.js`, `src/lib/management/modules.js`, `src/lib/architect/modules.js`.

**APIs affected:** PlatformModule entity; all registries are in-memory constants.

**Registry updates:** Meta-registry of all registries (index + ownership).

**Database impact:** None.

**AI impact:** Oracle indexes registries for orchestration.

**UI impact:** Consistent registry-driven nav + dashboards.

**Testing requirements:** Each registry consumed by its surfaces; no orphaned entries.

**Acceptance criteria:**
- Every dashboard/nav sources from its registry; auto-refresh where live.

**Risks:** Registry drift vs actual entities.

**Founder approval required:** Registry ownership; deprecation policy for ghost entries.

---

### Phase 21 — Notifications

**Purpose:** Smart notification system — preserve NotificationCenter, SmartNotifications, priorityEngine, quiet hours, digest, preference center, persistent banners, daily digest.

**Dependencies:** Phase 1, Phase 9.

**Features affected:** Notifications, SmartNotifications, NotificationCenter, NotificationItem, NotificationFilterBar, SmartNotificationPreferences, PersistentBanner, BudDailyDigest, priorityEngine, quiet hours, digest.

**Components affected:** `src/pages/Notifications.jsx`, `src/pages/notifications/*`, `src/components/notifications/*`, `src/lib/notifications/*`, `base44/shared/notifications.ts`.

**APIs affected:** Notification, NotificationPreference, ReminderPreference, priorityEngine, SendEmail (registered users only).

**Registry updates:** Notification category registry; priority rules.

**Database impact:** Preference writes.

**AI impact:** Spark notifications intelligence; priority engine.

**UI impact:** Unified inbox; filter bar; preference sheet.

**Testing requirements:** Priority routing; quiet hours; digest; mute; persistent banner.

**Acceptance criteria:**
- Priority engine respects thresholds; quiet hours delay non-critical.

**Risks:** Over-notification; email limit to registered users only.

**Founder approval required:** Priority thresholds; quiet hours defaults.

---

### Phase 22 — Security

**Purpose:** Preserve and harden security model — RLS, roles, permissions, verification, security center, devices, sessions, activity, privacy, content reports, trust scores.

**Dependencies:** Phase 1, Phase 10.

**Features affected:** SecurityCenter, SecurityOverview, SecuritySessions, SecurityDevices, SecurityActivity, SecurityPrivacy, ContentReport, TrustScore, VerificationRequest, StudentIdentifier, AuditLog, RLS across all entities.

**Components affected:** `src/pages/SecurityCenter.jsx`, `src/components/security/*`, `src/components/shared/ContentReportModal.jsx`, `src/lib/matriculationPrivacy.js`, `src/lib/identity/*`, RLS configs in every entity.

**APIs affected:** SecurityEvent, AuditLog, ApiKey, Device, TrustScore, ContentReport, VerificationRequest, StudentIdentifier, ConsentLink.

**Registry updates:** Role registry; permission matrix.

**Database impact:** None (RLS is config).

**AI impact:** Sentinel security intelligence.

**UI impact:** Security shell; trust badges; verification composer.

**Testing requirements:** RLS per entity; role-based access; verification flow; content report; trust score.

**Acceptance criteria:**
- No cross-tenant data leakage; no cross-user leakage on personal entities.

**Risks:** RLS lock-out; over-broad read rules.

**Founder approval required:** Role definitions; RLS rule changes.

---

### Phase 23 — Performance

**Purpose:** Platform-wide performance hardening — React Query tuning, code-splitting, dynamic imports, bundle size, polling efficiency, image pipeline.

**Dependencies:** Phase 1.

**Features affected:** QueryClient config, lazy routes, dynamic imports (html2canvas, jsPDF), Image component, registry metrics fanout.

**Components affected:** `src/lib/query-client.js`, `src/App.jsx` (lazy), `src/components/ui/image.jsx`, `src/lib/oracle/useRegistryMetrics.js`.

**APIs affected:** None.

**Registry updates:** None.

**Database impact:** None.

**AI impact:** None.

**UI impact:** Faster first paint; fewer refetch storms.

**Testing requirements:** Bundle size audit; query fanout count; image WebP pipeline; stale-time behavior.

**Acceptance criteria:**
- Single fanout per dashboard; stale time prevents refetch storms; heavy libs dynamically imported.

**Risks:** Over-aggressive stale time causing stale data.

**Founder approval required:** Stale time defaults; polling intervals.

---

### Phase 24 — Accessibility

**Purpose:** AAA-targeted accessibility — contrast, reduced motion, high contrast, reduced transparency, large text, focus management, voice, screen reader semantics.

**Dependencies:** Phase 1.

**Features affected:** Reduced-motion paths, high-contrast mode, reduced-transparency mode, large-text mode, focus-visible, safe areas, platform-native adaptation.

**Components affected:** `src/index.css` (accessibility overrides), `src/hooks/usePrefersReducedMotion.js`, `src/lib/platform/PlatformProvider.jsx`.

**APIs affected:** None.

**Registry updates:** None.

**Database impact:** None.

**AI impact:** None.

**UI impact:** Toggleable accessibility modes; consistent focus rings.

**Testing requirements:** AAA contrast; reduced-motion; high-contrast; large-text; touch target ≥44px.

**Acceptance criteria:**
- All interactive elements reachable by keyboard; contrast passes AAA where possible.

**Risks:** Visual regression in high-contrast mode.

**Founder approval required:** Accessibility mode toggles placement.

---

### Phase 25 — Production Polish

**Purpose:** Final production readiness — error boundaries, offline states, loading states, empty states, toasts, localization, safe areas, PWA manifest, SEO meta, lint/type error cleanup (known: 73 lint, 10 type errors), server-side move of VITE_OPENAI_API_KEY.

**Dependencies:** All prior phases.

**Features affected:** ErrorBoundary, OfflineBanner, RouteLoading, empty states, toaster, index.html meta, manifest, eslint config, server-side OpenAI key.

**Components affected:** `src/components/ErrorBoundary.jsx`, `src/components/layout/OfflineBanner.jsx`, `src/components/RouteLoading.jsx`, `src/components/ui/toaster.jsx`, `index.html`, `public/manifest.webmanifest`, `eslint.config.js`, backend function for OpenAI.

**APIs affected:** New server-side function for OpenAI (move key off client).

**Registry updates:** None.

**Database impact:** None.

**AI impact:** OpenAI key moved server-side (Spark provider).

**UI impact:** Consistent empty/loading/error states; polish animations.

**Testing requirements:** Error boundary; offline; localization; PWA installability; lint/type error count → 0.

**Acceptance criteria:**
- Zero lint/type errors; no client-exposed secrets; PWA installable; all states polished.

**Risks:** Localization coverage; secret migration breaking Spark.

**Founder approval required:** Secret migration; localization scope.

---

## 2. Dependency Graph

```
Phase 1 (Foundation)
 ├─ Phase 2 (Auth)
 │    └─ Phase 3 (Onboarding)
 │         └─ Phase 4 (Campus/Home)
 │              ├─ Phase 5 (Quad)
 │              ├─ Phase 6 (Connect)
 │              ├─ Phase 7 (Me)
 │              ├─ Phase 8 (Bud)
 │              │    └─ Phase 9 (Spark)
 │              │         └─ Phase 10 (Oracle)
 │              │              └─ Phase 11 (Ops Center)
 │              │                   ├─ Phase 12 (Management)
 │              │                   ├─ Phase 13 (Architect)
 │              │                   └─ Phase 14 (Founder Dashboard)
 │              ├─ Phase 15 (Institution Portal)
 │              │    ├─ Phase 16 (Parent Portal)
 │              │    └─ Phase 17 (Lecturer Portal)
 │              └─ Phase 18 (Student Portal)
 ├─ Phase 19 (Analytics) ← depends on 10 + 18
 ├─ Phase 20 (Registry System) ← depends on 1
 ├─ Phase 21 (Notifications) ← depends on 1 + 9
 ├─ Phase 22 (Security) ← depends on 1 + 10
 ├─ Phase 23 (Performance) ← depends on 1
 ├─ Phase 24 (Accessibility) ← depends on 1
 └─ Phase 25 (Production Polish) ← depends on ALL
```

Critical path: **1 → 2 → 3 → 4 → 8 → 9 → 10 → 11 → 14 → 25**

---

## 3. Component Upgrade Matrix

| Component family | Phase | Upgrade (additive) | Preserve |
|---|---|---|---|
| foundation / uds | 1 | Token unification, glass v5 | All primitives |
| auth | 2 | Glass surfaces, spring entrance | All flows |
| onboarding | 3 | Spatial journey, Bud guide | All steps |
| home | 4 | Adaptive orchestration | All widgets |
| quad | 5 | One-rhythm + interstitials | All post types |
| connect / messaging | 6 | People-first portals | All portals |
| me | 7 | 3-zone identity | All sections |
| bud | 8 | Living states | All Bud surfaces |
| spark | 9 | Provider fallback, registry | All capabilities |
| oracle | 10 | Live registry dashboard | All sections |
| operator | 11 | Cross-center rail | All sections |
| management | 12 | Entity module grid | All sections |
| architect | 13 | Builder canvas polish | All builders |
| founder | 14 | Executive composite | (new) |
| institution | 15 | Branding theming | All sections |
| parent | 16 | Consent-gated calm cards | All sections |
| lecturer | 17 | Teaching-first layout | All sections |
| student/academics/study/exam | 18 | Consistent shells | All tools |
| analytics | 19 | Chart palette, export | All reports |
| registry libs | 20 | Meta-registry | All registries |
| notifications | 21 | Unified inbox + priority | All notification types |
| security | 22 | RLS hardening | All security surfaces |
| performance | 23 | Query tuning, code-split | (cross-cutting) |
| accessibility | 24 | AAA modes | (cross-cutting) |
| production | 25 | States, PWA, lint cleanup | (cross-cutting) |

---

## 4. Registry Upgrade Matrix

| Registry | Phase | Upgrade | Preserve |
|---|---|---|---|
| globalRegistries | 20 | Meta-registry index | All entries |
| oracle modules | 10 | Live registry module | All modules |
| oracle metric sections | 10 | Real-entity sourcing | All sections |
| oracle live activity types | 10 | Event-type mapping | All types |
| campus registry | 18 | Tool cards | All tools |
| communication registry | 21 | Priority integration | All channels |
| academics registry | 18 | Tool registry | All tools |
| collaboration templates | 18 | Template gallery | All templates |
| knowledge engine | 18 | Collection composer | All collections |
| career constants | 18 | Card variants | All card types |
| wallet nav | 18 | Module registry | All modules |
| social engines | 6 | People-first | All engines |
| institution config | 15 | Branding tokens | All configs |
| operator modules | 11 | Cross-center rail | All modules |
| management modules | 12 | Entity module grid | All modules |
| architect modules | 13 | Builder registry | All builders |
| notification categories | 21 | Priority rules | All categories |
| role / permission | 22 | Permission matrix | All roles |
| Bud state animations | 8 | State registry | All states |
| Spark providers | 9 | Fallback chain | All providers |

---

## 5. Dashboard Upgrade Matrix

| Dashboard | Phase | Upgrade | Preserve |
|---|---|---|---|
| Home (Campus) | 4 | Adaptive orchestration | All widgets |
| BudHome | 8 | Living orb, daily reorder | All sections |
| Oracle Dashboard | 10 | Live registry metrics | All sections |
| Operator Dashboard | 11 | Cross-center | All sections |
| Management Dashboard | 12 | Entity module grid | All sections |
| Architect Workspace | 13 | Builder canvas | All builders |
| Founder Dashboard | 14 | Executive composite | (new) |
| Institution Portal Dashboard | 15 | Branding | All sections |
| Parent Portal Dashboard | 16 | Consent-gated | All sections |
| Lecturer Dashboard | 17 | Teaching-first | All sections |
| Student Academic Hub | 18 | Consistent shell | All tools |
| Analytics / Results / Report | 19 | Chart palette, export | All reports |
| Wallet Dashboard | 18 | Glass cards | All modules |
| Finance Dashboard | 18 | Glass cards | All sections |
| Exam Hub | 18 | Staged flow | All stages |
| Knowledge Hub | 18 | Collections | All tools |
| Collaboration Hub | 18 | Workspaces | All tools |
| Notifications Center | 21 | Unified inbox | All types |
| Security Center | 22 | RLS hardening | All sections |
| Admin Hub | 11 | Admin launchers | All sections |

---

## 6. AI Upgrade Matrix

| AI agent / capability | Phase | Upgrade | Preserve |
|---|---|---|---|
| Oracle (orchestration) | 10 | Live registry intelligence | All orchestration rules |
| Bud (visible companion) | 8 | Living states, personality | All surfaces, tone |
| Spark (engine) | 9 | Provider fallback, registry | All capabilities |
| Atlas (academic) | 18 | Tool integration | All academic intelligence |
| Sage (lecturer) | 17 | Teaching workflow | All lecturer intelligence |
| Nova (institution) | 15 | Branding intelligence | All institution intelligence |
| Pulse (student) | 7 | Identity insights | All student intelligence |
| Nexus (global) | 14 | Executive intelligence | All global intelligence |
| Sentinel (security) | 22 | RLS intelligence | All security intelligence |
| InvokeLLM usage | 9 | Credit-aware model selection | All integrations |
| Provider fallback | 9 | OpenAI↔Mock chain | Resiliency |
| Memory network | 8 | Bud memory persistence | All memory stores |
| Recommendations | 4,9 | Cooldown + disabled types | All recommendation types |
| Notifications intelligence | 21 | Priority engine | All rules |

---

## 7. Feature Preservation Matrix

| Surface category | Preserve (mandatory) | Upgrade only |
|---|---|---|
| Pages | All routes in App.jsx | Layout, hierarchy, transitions |
| Dashboards | Every dashboard | Visual language, data sourcing |
| Portals | Institution, Parent, Lecturer, Student | Shells, theming |
| Workspaces | Collaboration, Architect | Canvas, templates |
| Registries | All 20 registries | Meta-index, auto-refresh |
| Services | All internal specialist services | Oracle orchestration |
| AI capabilities | Bud, Spark, Oracle, Atlas, Sage, Nova, Pulse, Nexus, Sentinel | States, fallback, intelligence |
| Navigation | All nav (bottom, rail, sidebar, ecosystem) | Consistency, transitions |
| User flows | Every flow end-to-end | Polish, no shortening |
| Database | All entity schemas | None (no schema removal) |
| Backend logic | All functions | None (no logic removal) |
| Business rules | All rules | None |
| Security model | RLS, roles, permissions | Hardening only |
| Feature flags | All flags | None |
| APIs | All SDK methods + functions | None |
| Integrations | Google Calendar (authorized) + workspace connectors (TikTok, Discord, GitHub) | None |

---

## 8. Risk Matrix

| Risk | Phase(s) | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Token rename breaks legacy classes | 1 | Med | High | Audit all literal classes before rename; safelist runtime values only |
| Auth template recreation / returnTo regression | 2 | Low | Critical | Preserve hard redirects + returnTo resolution |
| Onboarding state loss on refresh | 3 | Med | Med | Persist step progress |
| Dashboard over-orchestration thrash | 4 | Med | Med | Debounce reordering; max one reorder per context change |
| Interstitial breaks infinite scroll | 5 | Med | Med | Inject as data rows, not DOM siblings |
| Presence global-read privacy | 6 | Known | Low | Preserve current behavior; flag for future opt-in |
| Profile zone hides low-frequency sections | 7 | Med | Low | Zone assignment approved by Founder |
| Orchestrator latency / provider outage | 8,9 | Med | High | Runtime fallback; timeout budgets |
| Non-default model cost blowout | 9 | Med | Med | Credit guardrails; intentional-only usage |
| Polling cost at scale (Oracle) | 10 | Med | Med | Single fanout; 30s interval; refetch-on-focus |
| Role overlap ambiguity (Ops Center) | 11 | Med | Med | Role-to-center matrix approved |
| Approval state machine regression | 12 | Low | High | Preserve state machine; audit transitions |
| Config schema migration (Architect) | 13 | Med | High | Versioned configs; migration path |
| Stale composite (Founder Dashboard) | 14 | Med | Med | Compose live queries, no cached snapshots |
| RLS lock-out / cross-tenant leak | 15,16,22 | Med | Critical | RLS guide before any rule change; per-entity tests |
| Consent regression (Parent) | 16 | Low | Critical | Consent flow tests |
| Live class media constraints | 17 | Known | Med | Preserve current approach; no WebRTC |
| Exam state machine | 18 | Med | Critical | Preserve staged flow; no shortcuts |
| Payment provider (Stripe, NG) | 18 | Low | High | Stripe only in NG; no Wix family |
| GPA scale drift | 19 | Low | High | Centralized gpaScale.js |
| Registry drift vs entities | 20 | Med | Med | Registry sourced from entities where possible |
| Over-notification | 21 | Med | Med | Priority engine + quiet hours |
| RLS over-broad read | 22 | Med | Critical | RLS guide; least-privilege rules |
| Stale data from aggressive cache | 23 | Med | Med | Tuned stale times; refetch-on-focus |
| High-contrast visual regression | 24 | Low | Low | Visual regression tests |
| Localization coverage | 25 | Med | Med | Translation audit per surface |
| Secret migration breaks Spark | 25 | Low | High | Server-side function before client key removal |
| Lint/type errors (73/10 known) | 25 | Known | Med | Incremental cleanup; zero target |

---

## 9. QA Strategy

### 9.1 Testing Framework
- **Vitest** is the standardized framework (already configured).
- Unit tests for pure logic (reportEngine, gpaScale, priorityEngine, money, courseNormalizer, providerRegistry, searchIntent).
- Integration tests for Bud↔Spark, dashboard, provider fallback.

### 9.2 Per-Phase QA Gates
| Gate | Requirement |
|---|---|
| Visual | Token compliance; no hardcoded values; light+dark pass |
| Functional | Every flow completes end-to-end with real backend |
| Data | Metrics match raw entity counts; no mocks in live dashboards |
| Security | RLS per entity; no cross-tenant/user leakage |
| Performance | Single fanout per dashboard; no refetch storms; bundle within budget |
| Accessibility | AAA contrast where possible; reduced-motion; keyboard reachable |
| Localization | All visible strings localized to user language |
| Lint/Type | Zero new errors; incremental reduction toward zero |

### 9.3 Regression Guards
- No approved feature removed (Feature Preservation Matrix enforced).
- No working flow shortened or merged.
- No entity schema field removed.
- No RLS rule loosened without Founder approval.

### 9.4 Testing Agent Handoff
- For flow verification/QA, hand off to Base44 Testing Agent with plain-English goals (e.g., "Log in as a registered student and reach the Home dashboard"; "Take an exam end-to-end and view the result").

---

## 10. Founder Approval Checklist

Before any phase begins implementation, the Founder must approve:

- [ ] **Phase scope** — which features/components are touched
- [ ] **Feature Preservation** — confirmation no approved feature is removed/merged
- [ ] **Dependencies** — prior phases complete or explicitly waived
- [ ] **Acceptance criteria** — measurable definition of done
- [ ] **Risks** — reviewed and mitigations accepted
- [ ] **Registry/Database impact** — no destructive schema changes
- [ ] **AI impact** — provider/model/credit implications approved
- [ ] **Security impact** — RLS/permission changes approved
- [ ] **Performance budget** — query fanout + bundle size accepted
- [ ] **Localization scope** — which languages
- [ ] **Payment provider** — (Phase 18 only) Stripe confirmed for NG region
- [ ] **PVR filed** — any deviation from this roadmap logged as a Product Variance Report

---

## 11. Operating Cadence for Future Prompts

1. Future implementation prompts **must** reference a Phase ID (e.g., "Implement Phase 4 — Campus Experience, widget orchestration").
2. Prompts execute phases **in dependency order** unless dependencies are explicitly waived.
3. Every change is **additive or a pure upgrade** — never a deletion of approved capability.
4. Any deviation requires a **PVR** filed against this roadmap.
5. At phase completion, run the **QA gates** and update the **Founder Approval Checklist**.

---

## 12. Known Issues Carried Forward (Not Blocking — Tracked)

These are pre-existing and must be preserved (not regressed) during upgrades; resolution is scoped within relevant phases:

- Silent error swallowing in BudPanelContext save/file upload → audit in Phase 8
- googleCalendarSync requires explicit action parameter validation → Phase 10/21
- Email change/verification cannot be implemented natively on current Auth schema → Phase 2 (limitation noted)
- Intermittent "Promise timed out" infrastructure error → Phase 23/25
- Edge-swipe Context Spaces (Wallet/Marketplace) not implemented → Phase 18 (future enhancement, not removal)
- Presence read currently global/non-opt-in → Phase 6 (preserve; future opt-in)
- Redundant Auth/Role logic in UI helpers → Phase 2 cleanup
- Home widget density redundancy → Phase 4 (already addressed in v4 components)
- VITE_OPENAI_API_KEY exposed client-side → Phase 25 (move to server-side function)
- 73 lint errors + 10 type errors → Phase 25 (zero target)

---

> **End of Roadmap.** This document is the only source of truth for all UNIBUD v4.0 implementation work. No coding prompt may deviate without Founder approval and a filed PVR.