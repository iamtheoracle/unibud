# UNIBUD — Contributor Guide

| Field | Value |
|---|---|
| Status | ACTIVE |
| Version | v1 |
| Effective Date | 2026-08-03 |
| Governing Document | UNIBUD_ARCHITECTURE_FREEZE_v1.md |
| Amendment Process | Same tiered system as Architecture Freeze |

---

## Purpose

This document defines how contributors add features, extend services, submit changes, and satisfy governance. It does not modify the Architecture Freeze — it guides work within it.

---

## 1. Before You Write Code

### The Pre-Implementation Checklist

Answer these questions before writing any code:

1. **Can an existing component own this responsibility?** If yes, extend it.
2. **Does the change touch a Tier A contract?** If yes, stop — MAJOR amendment required.
3. **Does the change alter a Tier B interface?** If yes, architecture review required.
4. **Is this a Tier C extension within an existing contract?** If yes, proceed with normal engineering review.

### The No Feature Factory Test

Every new feature must define:

| Question | Answer Required |
|---|---|
| Which Layer owns this? | Platform Core, Intelligence, or Experience |
| Which Experience presents this? | Campus, Square, Connect, Quad, Lens, Services, or Me |
| Which Shared Module implements this? | An existing registered module |
| Which Authority governs this? | Bud, Oracle, Guardian, or Institution |

If you cannot answer all four, the feature is not ready for implementation.

---

## 2. Architecture Tiers (Quick Reference)

| Tier | What Lives Here | Change Requires |
|---|---|---|
| A — Immutable Contracts | Runtime pipeline, Bud as sole AI, shared response schema, governance criteria | MAJOR amendment (all 5 gate criteria) |
| B — Core Platform | Oracle, Guardian, Nexus, PlatformCore, Spark, Orbit, EventBus, Realtime, Service Registry, Health, Audit, Telemetry, Constitutional Validator | Architecture review for interface changes; normal review for internal improvements |
| C — Domain Services | 9 intelligence engines + sub-services | Normal engineering review |

### Rule of Thumb

- If it touches Tier A → stop and get MAJOR amendment approval.
- If it changes a Tier B interface → architecture review.
- If it extends a Tier C engine within its contract → normal engineering work.

---

## 3. Where Things Belong

### Feature Ownership Map

| Feature Area | Owning Experience | Owning Module/Service | Owning Authority |
|---|---|---|---|
| Academic help | Campus | Academic modules + Student Routing Engine | Bud |
| Social feed | Quad | Social modules | Bud |
| Messaging | Connect | Communication modules | Bud |
| Discovery | Lens | Discovery modules | Bud |
| Services | Services | Service modules | Bud |
| Profile/identity | Me | Identity modules | Bud |
| Opportunities | Lens | Opportunity Engine Service | Bud |
| Clubs | Quad | Social modules | Bud |
| Events | Campus | Event Recommendation Service | Bud |
| Study groups | Campus | Study Group Service | Bud |
| Marketplace | Services | Service modules | Bud |
| Finance/Wallet | Services | Finance modules | Institution |
| Exams | Campus | Academic modules | Institution |
| Timetable | Campus | Academic modules | Institution |
| Notifications | All | Notification Service | Bud |
| Wellness | Me | (Future Tier C extension) | Bud |

### If a Feature Doesn't Fit

If you cannot find an existing owner:
1. Search the module registry (`moduleRegistry.js`).
2. Search the experience contracts (`experienceContract.js`).
3. Search the service registry (`src/lib/runtime/services/index.js`).
4. Check the manifest (`src/lib/os/manifest.js`).
5. If genuinely no owner exists → submit an Architecture Review Gate request.

---

## 4. How to Add a Feature

### Step 1: Define Ownership

Identify the owning Layer, Experience, Module, and Authority (see Section 1).

### Step 2: Check the Freeze

Verify your feature doesn't require:
- A new orchestration engine (Tier A)
- A new core platform component (Tier B interface change)
- A second user-facing AI (Tier A)

### Step 3: Implement

| What | Where |
|---|---|
| Entity | `base44/entities/{Name}.jsonc` |
| Backend function | `base44/functions/{name}/entry.ts` |
| Workflow | `base44/workflows/{Name}.jsonc` |
| Agent | `base44/agents/{name}.jsonc` |
| Page | `src/pages/{Name}.jsx` |
| Component | `src/components/{area}/{Name}.jsx` (≤50 lines) |
| Hook | `src/hooks/{useName}.js` |
| Service logic | `src/lib/{area}/{name}.js` |
| Shared backend logic | `base44/shared/{name}.ts` |

### Step 4: Register

- New modules must be registered in `moduleRegistry.js`.
- New experiences must be registered in `experienceRegistry.js`.
- New services must be registered in `src/lib/runtime/services/index.js`.
- New navigation items must be added to the manifest (`src/lib/os/manifest.js`).
- New routes must be added to `src/App.jsx`.

### Step 5: Add RLS (if entity has user/institution data)

Load the RLS guide via `get_capability_guide("rls")` before writing RLS rules. Every entity storing user or institution-scoped data must have RLS.

### Step 6: Test

- Test backend functions via `test_backend_function`.
- Verify entity CRUD operations work end-to-end.
- Check loading, empty, and error states.
- Verify the feature works on mobile and desktop.

### Step 7: Review

Run through the code review checklist (see Engineering Standards, Section 6).

---

## 5. How to Extend an Existing Engine

### Tier C Extension Process

1. **Identify the engine** — Which of the 9 intelligence engines owns this domain?
2. **Verify the contract** — The shared response schema must be preserved.
3. **Extend, don't duplicate** — Add capability to the existing engine, don't create a parallel one.
4. **Test the output** — Verify recommendations are valid and well-formed.
5. **Update telemetry** — Ensure new capabilities are measurable.

### Engine Extension Directions

| Engine | Extend By |
|---|---|
| Campus Intelligence | Smarter routing, better sub-service coordination |
| Academic Planning | Richer forecasting, deeper prerequisite analysis |
| Opportunity Engine | Better matching, broader discovery |
| Career Intelligence | Deeper guidance, alumni connections |
| Student Success | Stronger predictions, earlier interventions |
| Campus Digital Twin | More accurate space/availability tracking |
| Cross-Space Intelligence | Richer cross-domain recommendations |
| Autonomous Task Engine | Broader automation coverage |
| Personal Knowledge Graph | Deeper personalization over time |

---

## 6. How to Add a Backend Function

### When to Create a New Function

- When no existing function covers the need.
- When integrating with an external API that has no built-in connector.
- When processing data that can't be done client-side.

### When NOT to Create a New Function

- When a built-in integration covers it (e.g., `SendEmail`, `UploadFile`).
- When an existing function already does what you need — reuse it.
- When the logic can live in `base44/shared/` and be imported by existing functions.

### Process

1. Load the backend functions guide: `get_capability_guide("backend_functions")`.
2. Declare required secrets: `set_secrets`.
3. Create `base44/functions/{name}/entry.ts`.
4. Shared logic → `base44/shared/{name}.ts`.
5. Test: `test_backend_function`.
6. Frontend calls the function via the Base44 SDK.

---

## 7. How to Add a Workflow

### Process

1. Load the workflow guide: `get_workflow_guide`.
2. Create any needed backend functions first.
3. Authorize any required connectors first.
4. Write `base44/workflows/{Name}.jsonc`.
5. Validate — fix any reported workflow errors.
6. Monitor runs via `get_workflow_run`.

### Workflow Rules

- Each write creates a new version.
- Running workflows keep their starting version.
- Connector triggers require an authorized connector.
- Scheduled triggers use cron or interval format.

---

## 8. How to Add an Agent

### When to Create an Agent

- When the task needs entity access, backend function tools, complex workflows, or proactive behavior.
- When the task needs WhatsApp/Telegram channels.
- For lighter LLM calls, use `InvokeLLM` (or the AI gateway for new code).

### Process

1. Load the agent guide: `get_capability_guide("agents")`.
2. Create `base44/agents/{name}.jsonc`.
3. Configure tool permissions (entity access, backend functions, connectors).
4. Build conversation UI if the agent is user-facing outside the dashboard.
5. Request permissions via `request_agent_tool_permissions`.

### Agent Rules

- Bud is always the user-facing AI. Other agents operate behind the scenes.
- Agents must never expose internal orchestration to students.
- Agent permissions must be minimal — only what's needed for the task.

---

## 9. Submission and Review

### What to Submit

For every change:
- Clear description of what was built and why.
- Which tier it touches (A, B, or C).
- Which existing component owns the responsibility.
- Test results (backend functions, entity operations, user flows).
- Screenshots for UI changes.

### Review Criteria

| Criterion | Question |
|---|---|
| Ownership | Does an existing component own this? |
| Duplication | Is this duplicating an existing capability? |
| Architecture | Does it conform to the freeze? |
| Completeness | Are all states handled (loading, empty, error)? |
| Security | Is data properly secured (RLS, auth)? |
| Performance | Is it efficient? |
| Quality | Is the code clean and maintainable? |

### Common Rejection Reasons

- "This duplicates an existing module/service."
- "This introduces a new orchestration layer."
- "This exposes internal AI routing to users."
- "This feature has no defined owner."
- "This contains demo/placeholder data."
- "This changes a Tier A contract without a MAJOR amendment."
- "This entity has no RLS rules."

---

## 10. Frozen Runtime Constraints

### What You Cannot Do

- Add a new experience (7 permanent experiences are frozen).
- Add a secondary floating navigation dock.
- Render social icons outside Settings > Connected Accounts.
- Use non-UNIBUD icon families.
- Generate synthetic, demo, or placeholder data in production.
- Bypass Bud as the user-facing AI.
- Introduce an alternative runtime pipeline.
- Create a parallel module registry or experience contract.

### What You Can Do

- Extend any Tier C engine within its contract.
- Add capabilities to Tier B components without changing interfaces.
- Add features within existing experiences.
- Improve data quality, ranking, prompts, and UI.
- Add backend functions, workflows, and agents as needed.
- Extend entities with new fields (without changing RLS semantics).

---

## 11. Getting Help

| Need | Resource |
|---|---|
| Architecture question | `UNIBUD_ARCHITECTURE_FREEZE_v1.md` |
| Engineering standards | `UNIBUD_ENGINEERING_STANDARDS_v1.md` |
| Bud behavior | `UNIBUD_AI_BEHAVIOR_SPEC_v1.md` |
| Operations | `UNIBUD_SYSTEM_OPERATIONS_v1.md` |
| Platform features | `search_base44_docs` |
| Backend function guide | `get_capability_guide("backend_functions")` |
| RLS guide | `get_capability_guide("rls")` |
| Agent guide | `get_capability_guide("agents")` |
| AI gateway guide | `get_capability_guide("ai_gateway")` |
| Workflow guide | `get_workflow_guide` |
| Connector info | `get_connectors_info` |

---

*This document implements the Contributor Guide companion to the Architecture Freeze. All contributor work must conform to both this document and the Architecture Freeze. Version: v1. Status: ACTIVE.*