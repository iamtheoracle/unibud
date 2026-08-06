# UNIBUD OS v4 — Architecture Recovery Audit & Refactoring Plan

> **Deliverables 1–5**: Architecture audit, responsibility audit, duplication report,
> recovery report, and refactoring plan for transforming the existing UNIBUD project
> into the final UNIBUD OS v4 architecture.

---

## 1. Architecture Audit

### 1.1 Current State Summary

| Dimension | Status | Notes |
|---|---|---|
| **Routes** | ~150+ routes in `src/App.jsx` | Flat structure, not workspace-organized |
| **Entities** | ~120+ entities in `base44/entities/` | Properly RLS-scoped by `institution_id` |
| **Components** | ~600+ files in `src/components/` | Heavy duplication, no module registry |
| **Backend Functions** | 38 functions in `base44/functions/` | Well-organized, properly classified |
| **Workflows** | 12 workflows in `base44/workflows/` | Properly triggered, ecosystem-classified |
| **Agents** | 10 in-app agents in `base44/agents/` | bud, oracle, spark, security, etc. |
| **Design System** | `src/index.css` — comprehensive | Liquid Glass, token-based, 527 lines |
| **Runtime** | `src/lib/runtime/` — full kernel | Bud, Oracle, Nexus, Guardian, Spark, Orbit |
| **Auth** | `src/lib/AuthContext.jsx` | Standard Base44 auth + public settings |
| **Navigation** | 4-tab bottom nav (Bud·Social·Academics·Me) | Contradicts v4 constitution |

### 1.2 Architecture Misalignments with v4 Constitution

| # | Current State | v4 Target | Severity |
|---|---|---|---|
| A1 | Navigation has "Bud" as a permanent tab | Bud is NOT navigation — it's omnipresent | **High** |
| A2 | `platformManifest.js` defines 10 "platforms" with agents "forge/atlas/echo" | v4 defines 7 experiences + hidden services | **High** |
| A3 | `ecosystems/manifest.js` uses "Academic/Social" ecosystem model | v4 uses "Campus/Square" workspace model with context lenses | **Medium** |
| A4 | `adaptiveNavConfig.js` defines 3-tab nav (Social/Academic/Me) | v4 defines 7 permanent experiences | **High** |
| A5 | Routes are flat — `/academics`, `/social`, `/marketplace` are siblings | v4 wants workspace-scoped route trees | **Medium** |
| A6 | Multiple navigation config files exist simultaneously | v4 requires ONE navigation truth | **High** |
| A7 | Marketplace and Wallet have permanent routes | v4 hides them as contextual services | **Medium** |
| A8 | Runtime has Orbit as "execution management" kernel | v4 defines Orbit as intelligence infrastructure | **Medium** |
| A9 | Runtime has Spark as "knowledge intelligence" kernel | v4 defines Spark as execution engine | **Medium** |

### 1.3 What Already Aligns with v4

| Component | Alignment | Notes |
|---|---|---|
| `bud/orchestrator.ts` | ✅ Strong | Proper pipeline: context→memory→knowledge→reason→plan→generate→store, delegates to Spark port |
| `agents/domainRegistry.js` | ✅ Strong | Academic/Campus/Social agents invisible to users, routed through Oracle→Bud |
| `base44/functions/` | ✅ Strong | 38 functions, ecosystem-classified |
| `base44/workflows/` | ✅ Strong | 12 workflows, properly triggered |
| Entity RLS | ✅ Strong | Institution-scoped, role-based |
| Design system tokens | ✅ Strong | Comprehensive HSL token system in `index.css` |
| `MotionProvider` / `useMotion` | ✅ Strong | DI-based motion engine, tokenized |
| `Zero Demo Policy` enforcement | ✅ Strong | `EmptyState`, `ProductionState`, `DemoModeContext` exist |

---

## 2. Responsibility Audit

### 2.1 Ownership Conflicts Found

| Conflict | Current Owner | v4 Target Owner | Action |
|---|---|---|---|
| Navigation config | 3 files (`platformManifest`, `adaptiveNavConfig`, `MainTabBar`) | ONE file | Consolidate |
| Search | `src/lib/search/` + `src/lib/SearchContext.jsx` (legacy) | Platform Service: Search | Migrate to one |
| Notifications | `src/lib/notifications/` + `src/hooks/useNotificationCenter.js` + `src/components/notifications/` | Platform Service: Notifications | Consolidate |
| Media handling | Spread across `src/components/media/`, `src/components/podcast/`, `src/components/shorts/`, `src/components/live/` | Shared Module: Media | Extract to shared |
| Community shell | `src/components/community/` + `src/components/organization/` + `src/components/study/` (partial) | Shared Module: Communities | Unify |
| Identity/Profile | Spread across `src/components/profile/`, `src/components/me/`, `src/components/identity/`, `src/lib/identity/` | Platform Service: Identity | Consolidate |
| Marketplace route | Permanent `/marketplace` | Hidden Service, accessed via Lens/Services | Demote from nav |
| Wallet route | Permanent `/wallet` | Hidden Service, accessed via Lens/Services/payment flows | Demote from nav |

### 2.2 Bud Responsibility Check

| v4 Rule | Current State | Compliant? |
|---|---|---|
| Bud owns conversation | `bud/orchestrator.ts` handles full conversation pipeline | ✅ |
| Bud owns planning | `bud/actions/planIfNeeded.ts` exists | ✅ |
| Bud owns memory | `bud/actions/recallMemory.ts` + `bud/memoryBank.js` | ✅ |
| Bud owns recommendations | `bud/capabilityRouter.js` + recommendation hooks exist | ✅ |
| Bud does NOT own feeds | Bud delegates to workspaces for feed rendering | ✅ |
| Bud does NOT own navigation | Bud is accessed via `FloatingBudButton` (omnipresent) | ⚠️ Bud is also a nav tab — must remove |
| Bud does NOT own communities | No community code in bud module | ✅ |

### 2.3 Orbit Responsibility Check

| v4 Rule | Current State | Compliant? |
|---|---|---|
| Orbit is not navigation | Not in nav | ✅ |
| Orbit is not a workspace | No Orbit workspace exists | ✅ |
| Orbit provides discovery | `src/lib/orbit/` has populator, study planner | ⚠️ Partial — needs enrichment engine |
| Orbit provides ranking | `src/lib/workspace/cardRanker.js` exists | ⚠️ Not under Orbit namespace |
| Orbit never fabricates | Zero Demo Policy enforced | ✅ |

### 2.4 Spark Responsibility Check

| v4 Rule | Current State | Compliant? |
|---|---|---|
| Spark executes workflows | `src/lib/spark/` has automation, workflows | ✅ |
| Spark does OCR/processing | `transcribeEpisode` function exists | ✅ |
| Spark handles scheduling | Workflow system + scheduled functions | ✅ |
| Spark never owns UI | No UI components in spark module | ✅ |
| Spark does search indexing | `src/lib/spark/intelligence/search/` exists | ✅ |

---

## 3. Duplication Report

### 3.1 Duplicate Navigation Configurations

| File | Model | Status |
|---|---|---|
| `src/lib/platformManifest.js` | 10 platforms + 8-item floating nav | **DELETE** — contradicts v4 |
| `src/lib/navigation/adaptiveNavConfig.js` | 3-tab (Social/Academic/Me) | **DELETE** — contradicts v4 |
| `src/components/layout/MainTabBar.jsx` | 4-tab (Bud/Social/Academics/Me) | **REFACTOR** → v4 7-experience nav |
| `src/components/layout/GlobalNavDock.jsx` | Another floating nav variant | **DELETE** if exists and unused |

### 3.2 Duplicate Search Systems

| File | Purpose | Action |
|---|---|---|
| `src/lib/search/SearchContext.jsx` | New universal search with overlay | **KEEP** — this is the v4 Platform Search |
| `src/lib/SearchContext.jsx` (legacy) | Old search context | **DELETE** — superseded |
| `src/hooks/useUniversalSearch.js` | Hook wrapping the new search | **KEEP** |
| `src/lib/search/universalSearch.js` | Search engine logic | **KEEP** |
| `src/components/search/UniversalSearchOverlay.jsx` | Search UI | **KEEP** |

### 3.3 Duplicate Empty State Components

| File | Action |
|---|---|
| `src/components/ui/EmptyState.jsx` | **KEEP** — premium version with Bud guidance |
| `src/components/academics/EmptyState.jsx` | **DELETE** — duplicate |
| `src/components/resilience/EmptyWithSuggestions.jsx` | **MERGE** into shared EmptyState |
| `src/components/layout/EditorialEmptyState.jsx` | **MERGE** or delete if unused |

### 3.4 Duplicate Card Components

| File | Action |
|---|---|
| `src/components/ui/PremiumCard.jsx` | **KEEP** — canonical |
| `src/components/ui/GlassCard.jsx` | **MERGE** into PremiumCard variants |
| `src/components/ui/card.jsx` (shadcn) | **KEEP** — base primitive |
| `src/components/layout/EditorialCard.jsx` | **KEEP** if used by editorial pages |

### 3.5 Duplicate Identity/Profile Code

| Area | Files | Action |
|---|---|---|
| Profile header | `src/components/profile/ProfileHeader.jsx` + `src/components/profile/PremiumProfileHero.jsx` | **CONSOLIDATE** |
| Profile view page | `src/pages/social/ProfileView.jsx` + `src/pages/Me.jsx` | **KEEP both** — ProfileView is public, Me is private |
| Identity service | `src/lib/identity/profileService.js` + `src/lib/identity/useIdentity.js` | **CONSOLIDATE** |

### 3.6 Duplicate Motion Systems

| File | Status |
|---|---|
| `src/lib/motion/motionTokens.js` | ✅ Canonical — KEEP |
| `src/lib/motion/motionEngine.js` | ✅ Canonical — KEEP |
| `src/lib/motion/MotionProvider.jsx` | ✅ Canonical — KEEP |
| `src/lib/motion/motionPresets.js` | ✅ Canonical — KEEP |
| `src/lib/motion/useMotion.js` | ✅ Canonical — KEEP |

Motion system is already clean — no duplication.

---

## 4. Recovery Report

### 4.1 Screens & Routes Recovered

**Total routes: 150+** across `src/App.jsx`

| Category | Routes | Count |
|---|---|---|
| Auth & Onboarding | `/`, `/welcome`, `/register`, `/login`, `/meet-bud`, `/mode-select`, `/forgot-password`, `/reset-password`, `/auth-router`, `/onboarding/*` | 10 |
| Main Tab Pages | `/bud`, `/social`, `/academics`, `/me` | 4 |
| Social Ecosystem | `/quad`, `/connect`, `/services`, `/shorts`, `/podcasts`, `/podcasts/:showId`, `/creator-studio`, `/studio`, `/messages`, `/communities`, `/community/:id`, `/clubs`, `/marketplace`, `/lost-found`, `/discover`, `/lens`, `/square`, `/scholar`, `/football`, `/campus`, `/campus-v2`, `/wallet`, `/wallet-v2` | 23 |
| Academic | `/courses`, `/course/:id`, `/agenda`, `/weather`, `/academic-timeline`, `/timetable`, `/calendar`, `/assignments`, `/projects`, `/exams`, `/achievements`, `/attendance`, `/office-hours`, `/notes`, `/study-sessions`, `/study/*` (12 sub-routes), `/academics/*` | 30+ |
| Professional | `/opportunities`, `/scholarships`, `/research`, `/career`, `/career-center`, `/companies`, `/portfolio`, `/cv-builder`, `/challenges`, `/student-government`, `/student-support` | 11 |
| Institution | `/institution/onboard`, `/onboarding/university`, `/institution/console` | 3 |
| Exam Platform | `/exam`, `/exam/start/:paperId`, `/exam/take/:attemptId`, `/exam/result/:attemptId`, `/exam/analytics`, `/exam/coach`, `/exam/author` | 7 |
| Smart Classroom | `/classroom/:classId`, `/live`, `/live/:streamId`, `/call`, `/call/:contactId` | 5 |
| Notifications | `/smart-notifications`, `/bud/notifications`, `/notifications` | 3 |
| Knowledge & Collaboration | `/knowledge`, `/memory`, `/collaboration`, `/collaboration/:id`, `/tasks`, `/tasks/:id` | 6 |
| Operations (governance) | `/oracle`, `/management`, `/operator`, `/finance`, `/architect`, `/automation`, `/automation/builder`, `/security`, `/admin`, `/launch-readiness`, etc. | 20+ |
| Identity & Campus | `/campus-services`, `/safety`, `/digital-id`, `/accessibility`, `/gpa-calculator`, `/library`, `/campus-map` | 7 |
| Legal | `/privacy`, `/terms`, `/about` | 3 |

### 4.2 Entities Recovered

**Total entities: 120+** — all in `base44/entities/`

Key entity clusters:
- **Academic**: Course, Assignment, Exam, Grade, TimetableEntry, StudySession, Note, Project, Flashcard, QuizAttempt, Citation, etc.
- **Social**: QuadPost, Story, ShortVideo, Community, Club, CampusEvent, Conversation, Message, etc.
- **Identity**: User (built-in), StudentRecord, StudentIdentifier, VerificationRequest, DigitalBadge
- **Institution**: Institution, Faculty, Department, CourseCatalogEntry, AcademicCalendarEvent, ExamSchedule, EmergencyNotice
- **Finance**: Wallet, WalletLedger, Card, FeeStructure, FinancialTransaction, PaymentAttempt, RefundRequest, KYCRecord
- **Marketplace**: MarketplaceListing, MarketplaceReview
- **Governance**: Role, ApiKey, SecurityEvent, AuditLog, Automation, AutomationRun
- **AI**: BudConversation, BudMemory, AIServiceMetric, AIServiceRecommendation, SparkAgent, SparkExecutionLog

### 4.3 Backend Functions Recovered (38 total)

| Function | Purpose | v4 Layer |
|---|---|---|
| `budReminders` | Bud proactive notifications | Platform Core (Bud) |
| `budNotificationEngine` | Notification routing | Platform Service (Notifications) |
| `deadlineReminders` | Assignment deadline alerts | Domain (Academic) |
| `examReminders` | Exam countdown alerts | Domain (Academic) |
| `streakReminders` | Study streak nudges | Domain (Academic) |
| `taskReminders` | Task due alerts | Domain (Academic) |
| `eventReminders` | Event reminders | Domain (Social) |
| `socialProfile` | Social profile sync | Domain (Social) |
| `studyGroupEventBridge` | Study group → event sync | Domain (Social) |
| `transcribeEpisode` | Podcast transcription | Platform Service (Spark) |
| `googleCalendarSync` | Calendar integration | Integration Layer |
| `universityConnectSync` | University data sync | Integration Layer |
| `universityConnectBgSync` | Background university sync | Integration Layer |
| `syncAcademicCalendar` | Calendar sync | Integration Layer |
| `stripePayment` | Payment processing | Integration Layer (Finance) |
| `purchaseEventTicket` | Event ticket purchase | Hidden Service (Wallet) |
| `purchaseTutorSession` | Tutor session purchase | Hidden Service (Wallet) |
| `checkAchievements` | Achievement detection | Platform Service (Gamification) |
| `autoCreateAcademicTasks` | Auto-task from academic data | Platform Service (Spark) |
| `welcomeNewStudent` | Onboarding automation | Platform Service (Spark) |
| `outreachFollowup` | Outreach automation | Platform Service (Spark) |
| `activateAnnouncements` | Scheduled announcement activation | Platform Service (Notifications) |
| `seedCampusFeed` | Feed seeding | Domain (Social) |
| `smartUserSearch` | User search backend | Platform Service (Search) |
| `studentSearch` | Student directory search | Platform Service (Search) |
| `socialProfile` | Social profile enrichment | Domain (Social) |
| `trustProfile` | Trust scoring | Platform Service (Identity) |
| `discoverUniversity` | University discovery | Platform Service (Search) |
| `getUniversityProfileOfficial` | Official university data | Integration Layer |
| `validatePlatformAccess` | Access validation | Governance |
| `verifyAuthorityCode` | Authority code verification | Governance |
| `logExecutiveAction` | Audit logging | Governance |
| `oracleHealthScan` | System health monitoring | Governance |
| `providerSecrets` | Provider credential management | Integration Layer |
| `runAutomation` | Automation execution | Platform Service (Spark) |
| `updateProfile` | Profile updates | Platform Service (Identity) |
| `usernameService` | Username management | Platform Service (Identity) |
| `deleteAccount` | Account deletion | Platform Service (Identity) |
| `launchSimulation` | Launch simulation | **DELETE** — dead ends list |

### 4.4 Workflows Recovered (12 total)

All in `base44/workflows/` — properly triggered (scheduled, entity, connector).

### 4.5 Agents Recovered (10 total)

bud, oracle, spark, security, career, library, pulse, notification, search, campus, quad, study, admin.

### 4.6 Services Recovered

| Service | Location | v4 Status |
|---|---|---|
| Runtime kernel | `src/lib/runtime/` | ✅ Exists — needs role alignment |
| Bud orchestration | `src/lib/bud/` | ✅ Exists — clean pipeline |
| Spark engine | `src/lib/spark/` | ✅ Exists — comprehensive |
| Realtime sync | `src/lib/realtime/` | ✅ Exists |
| Motion engine | `src/lib/motion/` | ✅ Exists — clean DI |
| Search | `src/lib/search/` | ✅ Exists — needs legacy cleanup |
| Notifications | `src/lib/notifications/` | ✅ Exists |
| Finance | `src/lib/finance/` | ✅ Exists |
| Wallet | `src/lib/wallet/` | ✅ Exists |
| Collaboration | `src/lib/collaboration/` | ✅ Exists |

### 4.7 Dead Code & Incomplete Modules Detected

| Item | Location | Status | Action |
|---|---|---|---|
| `LaunchSimulation` engine | `base44/functions/launchSimulation/` + `base44/workflows/Launch Simulation Engine.jsonc` | Dead end — on rejected list | **DELETE** |
| Legacy `SearchContext.jsx` | `src/lib/SearchContext.jsx` | Superseded by `search/SearchContext.jsx` | **DELETE** |
| `DemoModeContext` | `src/lib/DemoModeContext.jsx` + `src/components/DemoModeBanner.jsx` | Contradicts Zero Demo Policy | **EVALUATE** — may be needed for ProtectedRoute |
| `platformManifest.js` | `src/lib/platformManifest.js` | Contradicts v4 architecture | **REPLACE** with v4 manifest |
| `adaptiveNavConfig.js` | `src/lib/navigation/adaptiveNavConfig.js` | Contradicts v4 navigation | **DELETE** |
| Duplicate mock data | `src/lib/academic/mockData.js`, `src/lib/social/mockData.js`, `src/lib/mock/` | Contradicts Zero Demo Policy | **DELETE** all mock data |
| `OrbitCamera.jsx` | `src/components/camera/OrbitCamera.jsx` | Camera feature — not in v4 scope | **EVALUATE** |

---

## 5. Refactoring Plan

### Phase 1: Governance & Manifest Alignment (Priority: Critical)

**Goal:** Establish the v4 architecture as the single source of truth.

| Step | Action | Files |
|---|---|---|
| 1.1 | Create v4 Platform Manifest | `src/lib/os/manifest.js` (NEW) |
| 1.2 | Delete legacy manifests | Delete `platformManifest.js`, `adaptiveNavConfig.js` |
| 1.3 | Update `ecosystems/manifest.js` to v4 model | Refactor to workspace model |
| 1.4 | Delete dead code | Delete `launchSimulation`, mock data, legacy SearchContext |

### Phase 2: Navigation Refactoring (Priority: Critical)

**Goal:** Align navigation with v4 constitution.

| Step | Action | Details |
|---|---|---|
| 2.1 | Define v4 permanent experiences | Square, Campus, Quad, Connect, Lens, Services, Me |
| 2.2 | Remove Bud from navigation tab | Bud remains omnipresent via FloatingBudButton |
| 2.3 | Demote Marketplace & Wallet | Remove from any permanent nav; access via Lens/Services |
| 2.4 | Refactor `MainTabBar.jsx` | 7-experience adaptive dock |
| 2.5 | Update route guards | Ensure hidden services are context-gated |

**Navigation target:**
```
Permanent: Square · Campus · Quad · Connect · Lens · Services · Me
Omnipresent: Bud (floating button, not a tab)
Hidden Services: Marketplace · Wallet (contextual access only)
```

### Phase 3: Route Tree Reorganization (Priority: High)

**Goal:** Organize flat routes into workspace-scoped trees.

| Workspace | Current Routes | v4 Route Prefix |
|---|---|---|
| Square (Social) | `/social`, `/quad`, `/square`, `/shorts`, `/podcasts`, `/communities`, `/clubs`, `/messages`, `/discover`, `/events`, etc. | `/square/*` |
| Campus (Academic) | `/academics`, `/courses`, `/assignments`, `/exams`, `/timetable`, `/calendar`, `/notes`, `/study`, etc. | `/campus/*` |
| Quad (Discovery) | `/discover`, `/scholar`, `/lens` | `/quad/*` |
| Connect (Communication) | `/connect`, `/messages`, `/call`, `/classroom` | `/connect/*` |
| Lens (Command Center) | `/lens`, `/search` | `/lens/*` |
| Services | `/campus-services`, `/marketplace`, `/wallet`, `/lost-found`, `/services` | `/services/*` |
| Me | `/me`, `/settings`, `/notifications`, `/security`, `/digital-id` | `/me/*` |

**Backward compatibility:** Use React Router redirects from old paths to new prefixes.

### Phase 4: Platform Service Consolidation (Priority: High)

**Goal:** Unify duplicated platform services.

| Service | Action |
|---|---|
| Identity | Consolidate `src/lib/identity/` + `src/components/profile/` + `src/components/me/` into unified identity service |
| Search | Delete legacy `SearchContext.jsx`; keep `search/SearchContext.jsx` |
| Notifications | Consolidate `lib/notifications/` + `hooks/useNotificationCenter.js` + `components/notifications/` |
| Media | Extract shared media module from `components/media/`, `components/podcast/`, `components/shorts/`, `components/live/` |

### Phase 5: Shared Module Extraction (Priority: Medium)

**Goal:** Build each capability once, reuse everywhere.

| Module | Source Components | Target |
|---|---|---|
| Community Shell | `components/community/`, `components/organization/`, `components/study/StudyGroup*` | `src/modules/community/` |
| Posts | `components/quad/PostCard.jsx`, `PostComposer.jsx`, `CommentSection.jsx` | `src/modules/posts/` |
| Stories | `components/stories/`, `components/highlights/` | `src/modules/stories/` |
| Podcast | `components/podcast/` | `src/modules/podcast/` |
| Live | `components/live/` | `src/modules/live/` |
| Events | `components/events/`, `components/campus/EventCard.jsx` | `src/modules/events/` |
| Media Viewer | `components/media/` | `src/modules/media/` |

### Phase 6: Integration Layer Hardening (Priority: Medium)

**Goal:** Ensure no workspace communicates directly with external APIs.

| Action | Details |
|---|---|
| Audit direct API calls | Search for `fetch(`, `axios`, direct provider URLs in `src/pages/` and `src/components/` |
| Route through Integrator | All external calls must go through `base44/functions/` backend functions |
| Supported Sources Registry | Create `src/lib/os/sourcesRegistry.js` as platform component |

### Phase 7: Dead Code Cleanup (Priority: Low)

| Item | Action |
|---|---|
| Mock data files | Delete all `mockData.js`, `mock/` directories |
| `launchSimulation` | Delete function + workflow |
| Unused components | Audit for components not imported anywhere |
| Duplicate empty states | Merge into single `EmptyState` |

### Phase 8: Context Lens Implementation (Priority: Low — depends on Phase 2-3)

**Goal:** Social and Academic lenses change priority, not features.

| Action | Details |
|---|---|
| Create ContextLensProvider | Manages active context (social/academic/neutral) |
| Implement priority reflow | When context changes, workspace reorders module priority |
| Adaptive Services | Services module adapts based on context (exam period → library, past questions, printing) |

---

## Execution Priority

1. **Immediate (this session):** Phase 1.1 — Create v4 manifest; Phase 1.4 — Delete dead code
2. **Next:** Phase 2 — Navigation refactoring
3. **Then:** Phase 3 — Route tree reorganization with redirects
4. **Then:** Phase 4 — Platform service consolidation

---

*This audit covers deliverables 1–5. Deliverables 6–15 (updated architecture, folder structure,
component hierarchy, routing changes, database changes, shared module implementation,
integration plan, performance review, accessibility review, production-ready implementation)
will be produced as each phase executes.*