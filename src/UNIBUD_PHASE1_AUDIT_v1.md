# UNIBUD OS — Phase 1 Codebase Audit

> **Date:** 2026-08-01
> **Scope:** Full Base44 project audit against frozen architecture
> **Status:** Phase 1 Complete — Ready for Phase 2 (Architecture Conformance)

---

## Executive Summary

The UNIBUD codebase is **substantial and mostly functional**, but suffers from accumulated complexity: orphaned pages, duplicate implementations, and a critical split in the AI runtime (two parallel Bud orchestration paths, only one wired). The foundation is sound — real LLM calls, persistent entities, RLS enforcement, proper auth — but needs stabilization before production hardening.

**Critical finding:** There are **two Bud orchestration pipelines** — only one is wired to the UI.

---

## 1. Project Structure

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 + custom design tokens |
| UI Components | shadcn/ui (Radix primitives) |
| State | React Context + @tanstack/react-query 5 |
| Routing | react-router-dom 6 |
| Animation | framer-motion 11 |
| Charts | recharts 2 |
| AI | Base44 `InvokeLLM` integration |
| Backend | Base44 entities + backend functions (Deno) |
| Auth | Base44 platform auth (`base44.auth.*`) |

### Package Count

- **Dependencies:** 65 production packages
- **DevDependencies:** 17 dev packages
- **Total:** 82 packages

### Directory Structure

```
src/
├── pages/              # ~120 page components (many orphaned)
├── components/         # ~200 UI components
├── lib/                # ~100 library modules
│   ├── bud/            # Bud orchestration (TypeScript, port-based)
│   ├── spark/          # Spark orchestration (JavaScript, LLM-based)
│   ├── oracle/         # Oracle governance
│   ├── auth/           # Auth routing + guards
│   ├── academic/       # Academic domain
│   ├── social/         # Social domain
│   ├── finance/        # Finance domain
│   ├── collaboration/  # Collaboration domain
│   ├── knowledge/      # Knowledge domain
│   ├── notifications/  # Notification engine
│   ├── classroom/      # Live classroom
│   ├── institution/    # Institution domain
│   ├── providers/      # AI provider abstractions
│   ├── production/      # Production logging
│   └── ...             # Other domain modules
├── hooks/              # ~30 React hooks
├── data/               # Static data (universities, courses, etc.)
├── utils/              # Utility functions
└── api/                # base44Client (pre-initialized SDK)

base44/
├── entities/           # ~90 JSON schema entities
├── functions/          # 27 backend functions
├── agents/             # 13 in-app agent configs
└── workflows/          # 13 CNCF SWF workflows
```

---

## 2. Runtime Architecture

### Boot Sequence

```
main.jsx
  → initNotificationEngine(base44)    # Spark notification bootstrap
  → initProductionLogging()            # Error capture
  → ErrorBoundary wraps <App />
  → <App /> = AuthProvider → ThemeProvider → PlatformProvider → QueryClientProvider → DemoModeProvider → ExperienceProvider → Router
  → <Routes> with lazy-loaded pages
```

### Auth Flow

```
Splash (/)
  → base44.auth.isAuthenticated()
    → Not authed → Welcome → Login/Register → OTP → MeetBud → ModeSelector → OnboardingConversation
    → Authed → OracleAuthRouter (/auth-router)
      → resolveWorkspace(user) — role-based routing
      → window.location.href = workspace.path
```

### Workspace Routing

| Role | Route | Guard |
|---|---|---|
| Student / Postgraduate / Alumni / Guest | `/home` | `AppShell` (auth check) |
| Future Student | `/onboarding/conversation` | AppShell |
| Lecturer / Dean / HOD | `/lecturer/portal` | `OracleWorkspaceGuard` |
| Institution Admin | `/institution/console` | `OracleWorkspaceGuard` |
| Operator / Moderator | `/operator` | `OracleWorkspaceGuard` |
| Finance Manager | `/finance` | `OracleWorkspaceGuard` |
| Super Admin / Platform Admin / Oracle / Executive | `/oracle` | `OracleWorkspaceGuard` |
| Developer | `/architect` | `OracleWorkspaceGuard` |

### Oracle Guard

`OracleWorkspaceGuard` silently redirects unauthorized users to their correct workspace. Route access is defined in `oracleGuard.js` as a prefix-to-roles map. Platform staff (`super_admin`, `platform_admin`, `oracle`) have universal access.

---

## 3. Dependency Graph

### Core Runtime Dependencies

```
App.jsx
  ├── AppShell (authenticated shell)
  │   ├── BudLauncherContext (Bud panel state)
  │   ├── UnibudContext (global app context)
  │   ├── ClassroomModeProvider (classroom Bud gating)
  │   ├── FloatingNav, AdaptiveNav, EcosystemRail (navigation)
  │   ├── BudCompanion, BudLivingOrb (Bud UI)
  │   └── LiveReflectionProvider (realtime sync)
  └── OracleWorkspaceGuard (workspace enforcement)

BudPanelContext.jsx (Bud chat)
  ├── routeAgents() from agentRegistry.js (keyword routing)
  ├── orchestrate() from spark/orchestrator.js (LLM routing + response)
  ├── BudConversation entity (persistence)
  └── UploadFile integration (attachments)

Spark Orchestrator (src/lib/spark/orchestrator.js)
  ├── loadActiveAgents() from spark/agents/registry.js
  ├── InvokeLLM (planning, agent execution, validation, merge)
  └── SparkExecutionLog entity (run logging)
```

### Critical Split: Two Bud Pipelines

```
PATH A (WIRED — actually used):
  BudPanelContext.jsx
    → routeAgents() [keyword matching, agentRegistry.js]
    → orchestrate() [LLM planner, spark/orchestrator.js]
    → InvokeLLM [real LLM calls]
    → BudConversation.create [persistence]

PATH B (NOT WIRED — dead code):
  src/lib/bud/orchestrator.ts
    → buildContext() → recallMemory() → searchKnowledge()
    → reason() → planIfNeeded() → generateResponse() → storeInteraction()
    → Uses BudSparkPort interface + liveSparkAdapter.ts
    → NOT called by any UI component
```

**Impact:** Path B is a cleaner, port-based design but is completely disconnected. Path A works but uses a simpler keyword + LLM planner approach. This is the #1 architectural inconsistency.

---

## 4. AI Runtime Status

### What's Real and Working

| Component | Implementation | Status |
|---|---|---|
| **Bud Chat UI** | `BudPanelContext.jsx` + `BudPanel.jsx` | ✅ Wired, functional |
| **Spark Orchestrator** | `src/lib/spark/orchestrator.js` | ✅ Real LLM calls, persistent logging |
| **Agent Registry** | `src/lib/spark/agents/registry.js` | ✅ Entity-backed, config-driven |
| **Agent Routing** | `routeAgents()` in `agentRegistry.js` | ⚠️ Keyword-based (simplistic) |
| **LLM Planning** | Spark orchestrator `PLANNER_SCHEMA` | ✅ LLM-based task planning |
| **Validation** | Spark orchestrator `VALIDATOR_SCHEMA` | ✅ LLM-based conflict detection |
| **Bud Memory** | `BudMemory` entity + `BudConversation` entity | ✅ Persistent |
| **Spark Notifications** | `src/lib/spark/notifications/` | ✅ Bootstrapped in main.jsx |
| **In-app Agents** | 13 agent configs in `base44/agents/` | ✅ Configured |
| **SparkAgent Entity** | Admin-editable agent registry | ✅ Seeded from code defaults |

### What's NOT Wired (Dead Code)

| Component | Path | Issue |
|---|---|---|
| **Bud Port Pipeline** | `src/lib/bud/orchestrator.ts` | Not called by any UI |
| **BudSparkPort Adapter** | `src/lib/bud/adapters/liveSparkAdapter.ts` | Only consumed by dead orchestrator.ts |
| **Bud Actions** | `src/lib/bud/actions/*.ts` (reason, recallMemory, etc.) | Only consumed by dead orchestrator.ts |
| **Bud Context Builder** | `src/lib/bud/context/buildContext.ts` | Only consumed by dead orchestrator.ts |
| **Bud Prompts** | `src/lib/bud/prompts/*.ts` | Only consumed by dead actions |
| **Bud Personality** | `src/lib/bud/personality.ts` | Not imported by wired code |
| **Bud Constitution** | `src/lib/bud/constitution.ts` | Not imported by wired code |

### Spark Intelligence Modules (Partially Wired)

| Module | Path | Status |
|---|---|---|
| Learning | `src/lib/spark/learning/` | ✅ Has interface + local implementation |
| Summaries | `src/lib/spark/intelligence/summaries/` | ✅ Interface + local |
| Writing | `src/lib/spark/intelligence/writing/` | ✅ Interface + local |
| Translation | `src/lib/spark/intelligence/translation/` | ✅ Interface + local |
| Personalization | `src/lib/spark/intelligence/personalization/` | ✅ Interface + local |
| Organization | `src/lib/spark/intelligence/organization/` | ✅ Interface + local |
| Search | `src/lib/spark/intelligence/search/` | ✅ Interface + local |
| Knowledge | `src/lib/spark/knowledge/` | ✅ Interface + local |
| Memory | `src/lib/spark/memory/` | ✅ Interface + local |
| Recommendations | `src/lib/spark/recommendations/` | ✅ Used by `useAcademicRecommendations` |
| Context | `src/lib/spark/context/` | ✅ Interface + local |
| Trust/Privacy | `src/lib/spark/trust/privacy/` | ✅ Interface + local |
| Trust/Security | `src/lib/spark/trust/security/` | ✅ Interface + local |
| Core/Reasoning | `src/lib/spark/core/reasoning/` | ✅ Interface + local |
| Core/Identity | `src/lib/spark/core/identity/` | ✅ Interface + local |
| Core/Planning | `src/lib/spark/core/planning/` | ✅ Interface + local |
| Automation | `src/lib/spark/automation/` | ✅ Interface + local |
| Notifications | `src/lib/spark/notifications/` | ✅ Bootstrapped |
| Providers | `src/lib/spark/providers/` | ⚠️ Has OpenAI, Anthropic, Gemini, mock, local — but orchestrator uses `InvokeLLM` directly |

### Verdict

The AI runtime is **functional through Path A** (Spark orchestrator + keyword routing + InvokeLLM). Path B (Bud port pipeline) is architecturally superior but disconnected. The Spark intelligence modules have interface + local implementations but are **not consumed by the Spark orchestrator** — the orchestrator makes raw `InvokeLLM` calls instead of routing through `spark.writing.draft()`, `spark.reasoning.analyze()`, etc.

---

## 5. Screen Inventory

### Routes in App.jsx

**Public routes (no auth):** 14
- `/`, `/welcome`, `/register`, `/login`, `/meet-bud`, `/mode-select`, `/forgot-password`, `/reset-password`, `/auth-router`, `/onboarding/conversation`, `/onboarding/security`, `/onboarding/preparing`, `/privacy`, `/terms`, `/about`

**Authenticated routes (AppShell):** ~70 routes under `<Route element={<AppShell />}>`

**Guarded routes (OracleWorkspaceGuard):** 8
- `/institution/console`, `/lecturer/portal`, `/oracle`, `/management`, `/operator`, `/finance`, `/architect`, `/security`

**Total routes:** ~92

---

## 6. Component Inventory

### UI Primitives (shadcn/ui)

~40 components in `src/components/ui/` — all standard shadcn primitives (button, input, dialog, sheet, tabs, etc.)

### Custom Components

~200 components across:
- `src/components/bud/` — Bud companion UI (15 components)
- `src/components/oracle/` — Oracle dashboard sections (25+ components)
- `src/components/layout/` — Shell, navigation, context (20 components)
- `src/components/academics/` — Academic UI (15 components)
- `src/components/collaboration/` — Workspace UI (15 components)
- `src/components/operator/` — Operator portal sections (12 components)
- `src/components/management/` — Management portal sections (6 components)
- `src/components/lecturer/` — Lecturer portal sections (14 components)
- `src/components/institution/` — Institution portal sections (16 components)
- `src/components/architect/` — Architect builder sections (12 components)
- `src/components/finance/` — Finance portal sections (8 components)
- `src/components/wallet/` — Wallet sections (12 components)
- `src/components/home/` — Home dashboard widgets (20 components)
- `src/components/study/` — Study suite components (15 components)
- `src/components/exam/` — Exam platform components (8 components)
- `src/components/career/` — Career components (8 components)
- `src/components/messaging/` — Chat components (12 components)
- `src/components/community/` — Community sections (9 components)
- `src/components/connect/` — Connect feed (7 components)
- `src/components/discover/` — Discovery feed (10 components)
- `src/components/quad/` — Social feed (10 components)
- `src/components/notifications/` — Notification components (8 components)
- `src/components/knowledge/` — Knowledge hub (5 components)
- `src/components/security/` — Security center (5 components)
- `src/components/tasks/` — Task management (8 components)
- `src/components/podcast/` — Podcast components (3 components)
- `src/components/shorts/` — Short video (4 components)
- `src/components/stories/` — Stories (4 components)
- `src/components/weather/` — Weather (6 components)
- `src/components/wellness/` — Wellness (4 components)
- `src/components/marketplace/` — Marketplace (7 components)
- `src/components/football/` — Football hub (4 components)
- `src/components/campus/` — Campus life (6 components)
- `src/components/identity/` — Identity/timeline (5 components)
- `src/components/brand/` — Brand assets (5 components)
- `src/components/foundation/` — Foundation (4 components)
- `src/components/portal/` — Legacy portal quick-actions (10 components)
- `src/components/realtime/` — Realtime (1 component)
- `src/components/shared/` — Shared utilities (3 components)
- `src/components/uds/` — UDS design system (12 components)

---

## 7. Missing Features

### Documented as Deferred (Known)

- MFA / Biometric login — platform-dependent
- Voice/Video/Screen Share — no WebRTC backend
- Light theme — dark-only (Midnight)
- i18n — no runtime
- Email change/verification flow — auth schema limitation

### Potentially Missing (Need Verification)

| Feature | Status | Notes |
|---|---|---|
| Real-time Bud streaming (token-by-token) | ❌ | Bud shows typing indicator, not streamed tokens |
| Push notifications (mobile) | ❌ | No PWA push; in-app only |
| Offline study mode | ❌ | Requires connectivity |
| Collaborative document editing | ❌ | No WebRTC/CRDT backend |
| Real adaptive learning algorithm | ⚠️ | Heuristic, not trained |
| Flashcard push reminders | ❌ | No scheduled push for due cards |

---

## 8. Dead Code

### Confirmed Dead (Not Wired to Any Route or Component)

| File | Type | Issue |
|---|---|---|
| `src/lib/bud/orchestrator.ts` | Module | Not called by any UI component |
| `src/lib/bud/adapters/liveSparkAdapter.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/adapters/sparkPort.ts` | Module | Type definitions for dead pipeline |
| `src/lib/bud/actions/reason.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/actions/recallMemory.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/actions/searchKnowledge.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/actions/planIfNeeded.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/actions/generateResponse.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/actions/storeInteraction.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/context/buildContext.ts` | Module | Only consumed by dead orchestrator.ts |
| `src/lib/bud/prompts/systemPrompt.ts` | Module | Only consumed by dead actions |
| `src/lib/bud/prompts/userPrompt.ts` | Module | Only consumed by dead actions |
| `src/lib/bud/personality.ts` | Module | Not imported by wired code |
| `src/lib/bud/constitution.ts` | Module | Not imported by wired code |
| `src/lib/bud/config.ts` | Module | Not imported by wired code |
| `src/lib/bud/types.ts` | Module | Type definitions for dead pipeline |
| `src/lib/bud/index.ts` | Module | Barrel export for dead pipeline |

**Note:** The entire `src/lib/bud/` directory (except `orchestrator.ts` which is consumed by the BudPanelContext via `buildBudPrompt`) is part of the disconnected Path B pipeline. However, `src/lib/budScreenContext.js` and `src/lib/bud/contextPulse.js` ARE used by the wired code. The TypeScript pipeline files are dead.

### Potentially Dead (Need Verification)

| Component | Issue |
|---|---|
| `src/components/portal/quick-actions/*` (10 files) | Legacy portal quick actions — may be superseded by institution portal sections |
| `src/lib/aee/aeeEngine.js` | AEE engine — unclear if consumed |
| `src/lib/realm/cache.js` | Referenced in architecture doc as cache layer — verify if used |
| `src/lib/spark/providers/openai.ts`, `anthropic.ts`, `gemini.ts` | Provider implementations — orchestrator uses `InvokeLLM` directly, not these |
| `src/lib/spark/providers/mock.ts`, `local.ts` | Mock/local providers — verify if used in tests |

---

## 9. Duplicate Code

### Confirmed Duplicates

| Duplicate | Files | Resolution |
|---|---|---|
| **Bud orchestration** | `src/lib/spark/orchestrator.js` (wired) vs `src/lib/bud/orchestrator.ts` (dead) | Pick one; wire the other or delete |
| **MeetBud page** | `src/pages/MeetBud.jsx` (routed at `/meet-bud`) vs `src/pages/onboarding/MeetBud.jsx` (not routed) | Delete the orphaned one |
| **BudMemory page** | `src/pages/BudMemory.jsx` (not routed) vs `src/pages/ai/MemoryDashboard.jsx` (routed at `/memory`) | Delete the orphaned one |
| **Brand logo** | Multiple: `UnibudLogo.jsx`, `UnibudMark.jsx`, `UnibudIcon.jsx`, `BrandLogo.jsx`, `BrandMark.jsx` | Consolidate (documented as freeze blocker) |
| **Bud orb** | `BudOrb.jsx`, `BudAvatar.jsx`, `BudCharacter.jsx`, `BudLivingOrb.jsx`, `BudFigure.jsx` | Consolidate (documented as freeze blocker) |
| **Portal implementations** | `src/components/portal/`, `src/components/institution/`, `src/components/uni-portal/` | Consolidate (documented as freeze blocker) |

### Potential Duplicates (Need Verification)

| Area | Files |
|---|---|
| Operator pages | `src/pages/operator/OperatorHome.jsx` etc. (not routed) vs `src/pages/operator/Operator.jsx` (routed) |
| Agent state | `localStorage` in `agentRegistry.js` vs `SparkAgent` entity |
| Navigation | `FloatingNav`, `AdaptiveNav`, `BottomNav`, `EcosystemRail`, `ContextNavigator` — multiple nav systems |

---

## 10. Orphaned Pages (Not in Router)

### Confirmed Orphaned (File exists, no route in App.jsx)

| File | Notes |
|---|---|
| `src/pages/AcademicHub.jsx` | Path doesn't exist — real one is `src/pages/academics/AcademicHub.jsx` (routed) |
| `src/pages/LiveHome.jsx` | Navigates to `/live/class/:id` (route doesn't exist; App has `/live/:streamId`) |
| `src/pages/BudMemory.jsx` | Duplicate of `src/pages/ai/MemoryDashboard.jsx` (routed at `/memory`) |
| `src/pages/UniversityConnect.jsx` | Navigates to `/university-selection` and `/student-profile` (neither exists) |
| `src/pages/ConnectedAccounts.jsx` | No route |
| `src/pages/UniversityStaffLogin.jsx` | No route — login is via `src/pages/Login.jsx` |
| `src/pages/PlatformStaffLogin.jsx` | No route — login is via `src/pages/Login.jsx` |
| `src/pages/onboarding/MeetBud.jsx` | Duplicate of `src/pages/MeetBud.jsx` (routed) |
| `src/pages/operator/OperatorHome.jsx` | Navigates to `/operator/tasks`, `/operator/calendar`, `/operator/profile` (none exist) |
| `src/pages/operator/OperatorTasks.jsx` | No route |
| `src/pages/operator/OperatorCalendar.jsx` | No route |
| `src/pages/operator/OperatorProfile.jsx` | No route |
| `src/pages/operator/OperatorTaskDetail.jsx` | No route |

**Count:** ~13 confirmed orphaned pages

### Impact

Orphaned pages with broken navigation (`LiveHome.jsx`, `UniversityConnect.jsx`, `OperatorHome.jsx`) would crash if a user somehow reached them — they navigate to routes that don't exist.

---

## 11. Missing Routes

### Routes Referenced by Code but Not in App.jsx

| Referenced Route | Source | Issue |
|---|---|---|
| `/university-selection` | `UniversityConnect.jsx` | Route doesn't exist |
| `/student-profile` | `UniversityConnect.jsx` | Route doesn't exist |
| `/live/class/:id` | `LiveHome.jsx` | Route doesn't exist (App has `/live/:streamId`) |
| `/operator/tasks` | `OperatorHome.jsx` | Route doesn't exist |
| `/operator/calendar` | `OperatorHome.jsx` | Route doesn't exist |
| `/operator/profile` | `OperatorHome.jsx` | Route doesn't exist |

These are only reachable if the orphaned pages are somehow rendered — which they currently aren't.

---

## 12. Missing Services

### Services Referenced in Architecture but Not Implemented

| Service | Spec Reference | Status |
|---|---|---|
| `LearningPathService` | LDS v1.2 §9 | Not implemented as a module |
| `SpacedRepetitionService` | LDS v1.2 §9 | Not implemented (flashcards use inline SM-2) |
| `StudySessionService` | LDS v1.2 §9 | Not implemented as a module |
| `ProgressTracker` | LDS v1.2 §9 | Not implemented as a module |
| `CompetencyAssessor` | LDS v1.2 §9 | Not implemented |
| `AdaptiveLearning` | LDS v1.2 §9 | Not implemented |
| `LearningAnalyticsService` | LDS v1.2 §9 | Not implemented |

> **Note:** These are documented in the Learning Domain Spec as "proposed" — they're roadmap items, not regressions.

---

## 13. Build/Runtime Errors

### Package Mismatch

| Package | package.json | System Prompt |
|---|---|---|
| `react-quill` | `^2.0.0` | `react-quill-new` |

**Risk:** `react-quill` v2 has known compatibility issues with React 18 strict mode. The system prompt says `react-quill-new` should be installed. This may cause runtime warnings or build issues.

### Potential Issues

1. **`html2canvas` + `jspdf`** — Heavy packages used for PDF export; verify tree-shaking
2. **`three` (0.171)** — Large 3D library; verify it's actually used (not just installed)
3. **`react-leaflet`** — Maps library; verify usage
4. **`next-themes`** — Theme provider, but app is dark-only; may be unnecessary
5. **`canvas-confetti`** — Used for celebrations; verify it doesn't bloat the bundle

### No Confirmed Build Errors

The Vite config is standard, plugins are minimal (`@base44/vite-plugin` + `react()`). No obvious build-breaking issues from config.

---

## Summary Statistics

| Metric | Count |
|---|---|
| Total routes in App.jsx | ~92 |
| Orphaned pages (not routed) | ~13 |
| Dead modules (bud pipeline) | ~17 files |
| Duplicate implementations | 6 confirmed |
| Missing routes (referenced) | 6 |
| Backend functions | 27 |
| Entity schemas | ~90 |
| In-app agents | 13 |
| Workflows | 13 |
| UI components | ~200+ |
| Page components | ~120 |
| Library modules | ~100+ |

---

## Phase 1 Priorities for Phase 2 (Architecture Conformance)

### Critical (Must Fix First)

1. **Resolve the dual Bud pipeline** — Either wire `src/lib/bud/orchestrator.ts` (Path B) and delete Path A, or delete Path B and keep Path A. This is the single biggest architectural inconsistency.
2. **Delete 13 orphaned pages** — They're dead code with broken navigation.
3. **Delete 17 dead Bud pipeline files** — If keeping Path A, delete Path B entirely.

### High Priority

4. **Consolidate brand components** — 5 logo components, 5 Bud orb components (documented freeze blocker).
5. **Consolidate portal implementations** — 3 parallel portal systems (documented freeze blocker).
6. **Fix `react-quill` package** — Replace with `react-quill-new` or remove if unused.

### Medium Priority

7. **Wire Spark intelligence modules** — Orchestrator should route through `spark.writing.draft()` etc., not raw `InvokeLLM`.
8. **Verify `three`, `react-leaflet`, `next-themes` usage** — Remove if unused.
9. **Document operator/ pages decision** — Either route them or delete them.

---

*Phase 1 Audit Complete — Ready for Phase 2 Architecture Conformance Review.*