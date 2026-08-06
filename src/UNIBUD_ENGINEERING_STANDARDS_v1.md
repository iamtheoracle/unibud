# UNIBUD — Engineering Standards

| Field | Value |
|---|---|
| Status | ACTIVE |
| Version | v1 |
| Effective Date | 2026-08-03 |
| Governing Document | UNIBUD_ARCHITECTURE_FREEZE_v1.md |
| Amendment Process | Same tiered system as Architecture Freeze |

---

## Purpose

This document defines how code is written, organized, reviewed, and tested across UNIBUD. It does not modify the Architecture Freeze — it implements it.

---

## 1. Project Structure

### Allowed Locations

| Path | Purpose |
|---|---|
| `src/pages/` | React page components |
| `src/components/` | Reusable UI components (one per file, ≤50 lines) |
| `src/lib/` | Business logic, hooks, contexts, services |
| `src/hooks/` | Custom React hooks |
| `src/data/` | Static data, constants, registries |
| `base44/entities/` | Entity schemas (JSON) |
| `base44/functions/` | Backend functions (Deno entry.ts) |
| `base44/workflows/` | Workflow definitions (JSONC) |
| `base44/agents/` | Agent configurations (JSONC) |
| `base44/shared/` | Shared backend logic used by multiple functions |

### Naming Conventions

- **Pages**: PascalCase (e.g., `AcademicHub.jsx`)
- **Components**: PascalCase (e.g., `PostCard.jsx`)
- **Hooks**: camelCase prefixed with `use` (e.g., `useTasks.js`)
- **Lib modules**: camelCase (e.g., `taskService.js`)
- **Entities**: PascalCase (e.g., `Task.jsonc`)
- **Backend functions**: camelCase (e.g., `stripePayment`)

### File Rules

- One component per file. No exceptions.
- Components must be ≤50 lines. If larger, split into sub-components.
- Every page/component is exported as default, named same as its file.
- No dead imports. No unused variables.
- No `console.log` in production code — use the logger.

---

## 2. Import Rules

### Path Aliases

- Always use `@/` alias for imports. Never use relative paths with `../`.
- Exception: files within the same directory may use `./`.

### Import Order

1. React and framework imports
2. Third-party packages (lucide-react, framer-motion, etc.)
3. `@/` lib imports
4. `@/` component imports
5. `@/` data imports
6. Styles (if applicable)

### Prohibited Imports

- Never import from `@/utils` for `cn` — use `@/lib/utils`.
- Never import `cn` from any file other than `@/lib/utils`.
- Never import a name that collides with a local declaration.
- Never import from a shadcn file expecting a re-export — each UI primitive is in its own file.
- Only use packages from the approved installed list. No exceptions.

---

## 3. Coding Standards

### Language

- JavaScript (JSX) for frontend.
- TypeScript for backend functions (`entry.ts`).
- ESM only — never use `require()` or `module.exports`.
- No JSX in `.js` files — only in `.jsx` or `.tsx`.

### React Rules

- Hooks are called only at the top level of a component. Never conditionally, in loops, or inside handlers.
- Early returns must come after all hooks have been called.
- Use `useState`, `useEffect`, `useMemo`, `useCallback` appropriately.
- Avoid inline objects in dependency arrays — extract to `useMemo` or `useCallback`.
- Every `useEffect` must have a cleanup function if it subscribes to anything.

### Error Handling

- Let errors bubble up. No try/catch unless:
  - User-facing form/auth flows that need inline error display.
  - Explicitly requested by the user.
- Backend functions: catch and log errors, return structured error responses.

### Styling

- Tailwind CSS classes only — no inline styles unless dynamic values require them.
- Use design tokens (`bg-primary`, `text-foreground`, `font-heading`, etc.) — never hardcoded color values.
- Write Tailwind classes as literal strings — dynamic class names are purged by the build.
- `@apply` in `index.css` only with classes that `tailwind.config.js` actually defines.

### Entity Operations

- Prefer batch operations (`bulkCreate`, `bulkUpdate`, `updateMany`, `deleteMany`) over loops of single operations.
- Never call `deleteMany` with an empty or broad query — always use a specific filter.
- Never store large content (base64, PDFs, blobs) in entity fields — upload and store the URL.

---

## 4. Backend Function Standards

### Structure

```
base44/functions/{functionName}/
  entry.ts    ← Single entry point
```

### Rules

- Shared logic used by multiple functions lives in `base44/shared/`.
- Never copy logic between functions — extract to shared.
- Secrets are declared via `set_secrets` before writing code.
- Always include `base44_app_id` in Stripe metadata.
- Log errors for debugging — never silently swallow.
- Test every function with `test_backend_function` after writing or editing.

### API Key/Secret Flow

1. Declare required secrets using `set_secrets`.
2. User provides secret values securely.
3. Access in code via `Deno.env.get("SECRET_NAME")`.
4. Never hardcode secrets in source.

---

## 5. Testing Standards

### What to Test

| Type | Coverage |
|---|---|
| Backend functions | Every function tested via `test_backend_function` |
| Entity operations | CRUD flows verified end-to-end |
| Critical user flows | Login, registration, Bud conversation, data persistence |
| Edge cases | Empty states, error states, loading states |

### Testing Approach

- Write tests that reflect real usage, not implementation details.
- Test the happy path first, then edge cases.
- Every test should be self-contained — no cross-test dependencies.
- Test files live in `tests/` directory.

---

## 6. Code Review Requirements

### Before Submitting

- [ ] Does the change touch a Tier A contract? If yes, stop — MAJOR amendment required.
- [ ] Does the change alter a Tier B interface? If yes, architecture review required.
- [ ] Is this a Tier C extension within an existing contract? If yes, normal review.
- [ ] Can an existing component own this responsibility? If yes, extend it.
- [ ] Are there any unused imports or variables?
- [ ] Do all imports resolve to real files or packages?
- [ ] Are there any hardcoded values that should be tokens?
- [ ] Is every new component ≤50 lines?
- [ ] Are loading, empty, and error states handled?

### Review Priorities

1. **Correctness** — Does it work?
2. **Security** — Does it expose data or vulnerabilities?
3. **Architecture** — Does it conform to the freeze?
4. **Performance** — Is it efficient?
5. **Readability** — Is it clear?

---

## 7. Dependency Management

### Approved Packages Only

Only packages from the installed list may be used. If a new package is needed:
1. The user must explicitly request it by name.
2. It must be installed via `install_npm_package`.
3. A stable version with caret (`^`) is preferred.

Never uninstall `@base44/sdk` or `@base44/vite-plugin`.

---

## 8. Data Quality Rules

- Zero tolerance for demo, placeholder, or synthetic data in production builds.
- All externally sourced content must carry explicit provenance.
- Entity records must have correct `institution_id` for tenant scoping.
- RLS rules must be present on every entity that stores user or institution data.
- Never insert User records — invite users via `base44.users.inviteUser`.

---

## 9. Performance Guidelines

- Lazy-load pages using `React.lazy()` and `Suspense`.
- Use `@tanstack/react-query` for data fetching and caching.
- Avoid unnecessary re-renders — memoize expensive computations.
- Prefer batch entity operations over sequential calls.
- Keep bundle size small — no heavy dependencies without justification.
- Images must use the `Image` component from `@/components/ui/image` for optimization.

---

## 10. Accessibility

- Touch targets minimum 44×44px.
- Color contrast must meet WCAG AA.
- All interactive elements must be keyboard accessible.
- Forms must have associated labels.
- Respect `prefers-reduced-motion` for animations.
- Support platform accessibility features (high contrast, reduced transparency, large text).

---

*This document implements the Engineering Standards companion to the Architecture Freeze. All engineering decisions must be consistent with both this document and the Architecture Freeze. Version: v1. Status: ACTIVE.*