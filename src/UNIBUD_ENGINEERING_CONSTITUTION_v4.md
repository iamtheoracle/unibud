# UNIBUD Engineering Constitution (v4)

> **The fifth constitutional document.**
>
> The first four documents define what UNIBUD is; this defines how it is built.
>
> Its purpose is to ensure every developer, AI agent, and future contributor
> builds the platform consistently.

---

## 1. Engineering Principles

* **OS-first, not app-first.** Every feature strengthens the operating system, not a standalone app.
* **Build once, reuse everywhere.** A capability is implemented once and shared across workspaces.
* **Zero Demo Policy.** No fake, placeholder, or fabricated content ever ships to users.
* **Mobile-first.** Design for the smallest screen first, then enhance for larger surfaces.
* **Offline-first where practical.** Core flows must degrade gracefully without connectivity.
* **Accessibility by default.** Every interface meets WCAG AA from the first commit.
* **Performance as a feature.** Speed is a product requirement, not a post-launch optimization.

---

## 2. Project Structure

### Standard Folder Hierarchy

```
src/
  pages/              — Route-level screens (one file per route)
  components/
    ui/               — shadcn primitives and base UI atoms
    shared/           — Cross-workspace reusable components
    layout/           — Shell, navigation, structural wrappers
    os/               — Platform-level components (Lens, Services hub)
  lib/
    os/               — Platform manifest, context system, sources registry
    bud/              — Bud orchestration pipeline
    runtime/          — Kernel, services, registries
    motion/           — Motion engine (DI-based)
    auth/             — Authentication and guard logic
  modules/
    content/          — Posts, Stories, Podcasts, Live, Videos
    community/        — Unified Community module
    communication/    — Chat, Calls, Meetings
    identity/         — Student, Educator, Institution profiles
    discovery/        — Search, Recommendations, Notifications
  hooks/              — Reusable React hooks
  data/               — Static data (institutions, courses, categories)

base44/
  entities/           — JSON schema definitions
  functions/          — Backend function entry points
  workflows/          — Workflow definitions
  agents/             — In-app agent configs
  shared/             — Shared backend logic
```

### Naming Conventions

* **Files:** `PascalCase.jsx` for components, `camelCase.js` for utilities, `kebab-case` for routes.
* **Components:** Named export matching filename, default export at bottom.
* **Hooks:** `use` prefix (e.g., `useStudyProgress`).
* **Entities:** Singular, PascalCase (e.g., `Course`, `QuadPost`).
* **Functions:** `camelCase` matching purpose (e.g., `deadlineReminders`).

### Module Boundaries

* Academic modules do not import Social modules (and vice versa) except through Shared services.
* Shared services are owned by the platform and may be used by either workspace.
* Cross-workspace communication flows through the Event Bus, never direct imports.

### Shared Component Registry

* Every reusable component must be registered in `src/lib/os/componentRegistry.js`.
* Components not registered are considered workspace-private.
* A component may not be duplicated — if a similar component exists, extend it.

### Platform Services

Services live in `src/lib/` and are consumed by workspaces through hooks:

```
Identity · Search · Notifications · Media · Storage · Analytics ·
Permissions · Motion · Realtime Sync · Audit
```

### Workspace Organization

Each of the seven experiences owns its own directory under `src/pages/`:

```
src/pages/square/    — Social workspace
src/pages/campus/    — Academic workspace
src/pages/quad/      — Discovery
src/pages/connect/   — Communication
src/pages/lens/      — Command center
src/pages/services/  — Adaptive service hub
src/pages/me/        — Personal identity
```

---

## 3. Development Workflow

```
Design → Architecture Review → Build → Test → Register → Release
```

### Rules

* **No direct implementation without architectural ownership.** Every feature must map to a layer, experience, module, and authority (Constitution Rule 15).
* **Every feature must map to:**
  1. Which layer owns it?
  2. Which experience presents it?
  3. Which shared module implements it?
  4. Which authority governs it?
* If these cannot be answered, the feature is not built.

### Process

1. **Design** — Define the user experience, data model, and module mapping.
2. **Architecture Review** — Confirm the feature fits the layered architecture and does not duplicate an existing capability.
3. **Build** — Implement against the shared module system, not a standalone solution.
4. **Test** — Unit, integration, accessibility, and performance tests must pass.
5. **Register** — Add the component/module to the shared registry.
6. **Release** — Pass the production readiness checklist.

---

## 4. Code Standards

* **TypeScript-first** where the platform supports it (backend functions, lib modules). JSX for frontend pages and components.
* **Reusable components.** If logic appears in two places, extract to a shared component or hook.
* **No duplicated logic.** A capability is built once. If a second implementation is needed, reuse the first.
* **Dependency injection where appropriate.** The motion engine and runtime services use DI to stay decoupled from React hooks.
* **Clear separation of UI, business logic, and data access.** Components render; hooks manage state; lib services access data. Never mix these in a single file.

### Conventions

* Import via `@/` alias — never relative `../../` paths.
* `cn` comes from `@/lib/utils`.
* Icons from `lucide-react` only — only icons that exist.
* shadcn components imported from their own file paths.
* ESM only — no `require()` or `module.exports`.
* Hooks called only at component top level — never conditionally or in loops.
* JSX only in `.jsx`/`.tsx` files.

---

## 5. Testing Standards

| Type | Scope |
|---|---|
| **Unit tests** | Individual functions, hooks, and utility modules |
| **Integration tests** | Module interactions, entity CRUD, workflow execution |
| **End-to-end tests** | Critical user journeys (login, onboarding, posting, payment) |
| **Accessibility testing** | WCAG AA compliance, screen reader, keyboard navigation |
| **Performance benchmarks** | Load time, interaction latency, bundle size |
| **Security validation** | RLS enforcement, auth boundaries, input sanitization |

### Rules

* Every backend function must be tested with `test_backend_function` before release.
* Every shared module must have at least one integration test.
* Accessibility is tested on every PR — not deferred to QA.

---

## 6. Performance Budget

| Metric | Target |
|---|---|
| **Fast startup** | First meaningful paint under 2s on mid-range mobile |
| **Lazy loading** | All route pages are `lazy()` imported |
| **Code splitting** | Each workspace loads only its own modules |
| **Optimized media** | All images use the `Image` component with WebP + responsive srcset |
| **Background synchronization** | Entity changes propagate via realtime sync, not polling |
| **Intelligent caching** | React Query for all entity data with proper invalidation |

### Rules

* No synchronous heavy computation on the main thread.
* No unoptimized images — always use the `Image` component.
* No polling intervals under 30 seconds — use realtime subscriptions instead.
* Bundle size is monitored; regressions require justification.

---

## 7. Security Standards

* **Least-privilege access.** Every entity has RLS configured. Users see only their institution's data.
* **Audit logging.** Administrative and financial actions are logged via `base44/shared/auditLogger.ts`.
* **Encryption.** Data is encrypted at rest (platform-managed). Secrets never appear in client code.
* **Secure API integration.** All external API calls go through backend functions — never direct `fetch()` from the frontend.
* **Secret management.** API keys and OAuth credentials are stored as app secrets, never committed to source.
* **Role-based permissions.** Institution roles (`institution_owner`, `university_admin`, `registrar`, `dean`, `lecturer`, `student`, etc.) enforce what each user can do.

### Rules

* No `eval()`, no `dangerouslySetInnerHTML` without sanitization.
* No hardcoded API keys, tokens, or credentials in source.
* RLS is mandatory on every new entity — no entity ships without it.
* PII is never logged.

---

## 8. Release Governance

Before any feature reaches production, it must pass:

| Gate | Check |
|---|---|
| **Feature review** | Does it answer the four constitutional questions? |
| **Architecture approval** | Does it fit the layered architecture without duplication? |
| **Security review** | Is RLS configured? Are secrets managed? Is input sanitized? |
| **Performance review** | Does it meet the performance budget? Is media optimized? |
| **Accessibility review** | Does it pass WCAG AA? Keyboard navigable? Screen reader tested? |
| **Production readiness checklist** | Loading states, empty states, error states, offline states all handled |

### Production Readiness Checklist

- [ ] Loading state implemented
- [ ] Empty state implemented (real data, no placeholders)
- [ ] Error state implemented
- [ ] Offline state handled gracefully
- [ ] RLS configured on all new entities
- [ ] Responsive on mobile, tablet, and desktop
- [ ] No console errors or warnings
- [ ] Lazy loaded if not on the critical path
- [ ] Accessible (ARIA labels, keyboard nav, color contrast)
- [ ] Tested via `test_backend_function` if it includes backend logic

---

## 9. Documentation Standards

* **Every module documented.** Each shared module has a header comment explaining its purpose, ownership, and consumers.
* **Every API documented.** Backend function entry points include JSDoc with parameters and return types.
* **Architecture Decision Records (ADRs).** Significant architectural decisions are recorded in `src/docs/adr/`.
* **Changelog and migration guides.** Breaking changes include migration notes.

### Rules

* A module without documentation is not considered complete.
* Entity schemas include descriptions on every field.
* ADRs explain *why* a decision was made, not just *what* was decided.

---

## 10. Engineering Commandments

1. **Never duplicate a capability.** If it exists, reuse it.
2. **Never bypass the Integrator for external APIs.** All third-party calls go through backend functions.
3. **Never expose internal authorities.** Users see only Bud.
4. **Never introduce fake/demo data.** Zero Demo Policy is absolute.
5. **Never violate the layered architecture.** Governance → Platform Core → Integrations → Experiences → Shared Modules.
6. **Every feature must strengthen the OS** rather than behave like a standalone app.

---

## Constitutional Framework

With this document, the core constitutional framework is complete:

| # | Document | Defines |
|---|---|---|
| 1 | **UNIBUD OS Constitution** | The operating system |
| 2 | **UNIBUD Layered Architecture** | Layers and responsibilities |
| 3 | **UNIBUD Shared Module Constitution** | Reusable capabilities |
| 4 | **UNIBUD AI Constitution** | AI governance and collaboration |
| 5 | **UNIBUD Engineering Constitution** | How the platform is engineered |

> These five documents together provide a comprehensive foundation for
> UNIBUD OS v4 and are the governing references for all future development.

---

*This constitution is the fifth and final foundational document. Together with
the OS Constitution, Layered Architecture, Shared Module Constitution, and AI
Constitution, it completes the governance framework for UNIBUD OS v4.*