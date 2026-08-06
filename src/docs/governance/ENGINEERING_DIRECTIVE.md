# UNIBUD Global AI Governance & Engineering Directive

**Version:** 1.0
**Priority:** Highest

---

## Engineering Philosophy

> Build UNIBUD the way world-class AI platforms are built.

- Clear ownership
- Modular architecture
- Event-driven communication
- Shared context
- Strong documentation
- Backward compatibility
- Incremental evolution
- Excellent developer experience
- Excellent student experience

---

## Migration & Preservation Directive

**DO NOT delete existing functionality simply because a new architecture exists.**

Before modifying anything:

1. Understand the existing implementation.
2. Identify what already works correctly.
3. Preserve all stable and working functionality.
4. Refactor instead of rewriting whenever practical.
5. Extend existing systems instead of replacing them.
6. Merge duplicate functionality.
7. Improve architecture without breaking user experience.

**Every change must improve the platform. Never reduce capabilities.**

---

## Existing AI Preservation

Do not remove any existing AI that already performs its responsibility effectively.

Instead:
- Improve it
- Expand it
- Refactor it
- Modernise it
- Optimise it
- Integrate it into the new ecosystem

Only replace an existing AI if:
- It is completely redundant
- Another intelligence fully owns the responsibility
- A documented migration path exists
- Backward compatibility has been considered

---

## Before Every Change

Answer:

1. Why?
2. What changes?
3. What improves?
4. What stays?
5. What breaks?
6. What depends on it?
7. How will it be tested?
8. How will it be documented?

---

## Ecosystem Audit Steps

### Step 1 — Identify What Exists

For every module determine:
- ✅ Implemented and working
- ⚠️ Partially implemented
- ❌ Broken
- 🔄 Duplicate
- 🗑 Deprecated
- 🧪 Experimental
- ❓ Missing

**Never recreate something that already exists.**

### Step 2 — Find Gaps

Look for missing:
- Intelligences, products, features, pages, navigation
- Backend services, APIs, database models
- Security, performance, testing, documentation
- Accessibility, personalisation, design consistency
- Error handling, logging, observability

### Step 3 — Fix the Gaps

- Do NOT replace working code.
- Improve it.
- Refactor it.
- Extend it.

---

## Code Review Standards

Architect reviews every significant change. Checks:

| Standard | Question |
|---|---|
| Correctness | Does it work as intended? |
| Performance | Is it fast enough? |
| Maintainability | Can it be easily changed? |
| Scalability | Will it scale? |
| Security | Is it safe? |
| Accessibility | Is it accessible? |
| Documentation | Is it documented? |
| Testing | Is it tested? |
| Architecture | Is it consistent with the architecture? |
| Standards | Does it follow coding standards? |

---

## Engineering Principles

| Principle | Rule |
|---|---|
| Preservation | Always preserve working functionality unless an intentional breaking change is approved |
| Incremental | Prefer incremental refactoring over unnecessary rewrites |
| Readable | Write readable, understandable code |
| Maintainable | Write maintainable, clean code |
| Secure | Write secure code — never introduce vulnerabilities |
| Scalable | Design for growth from the start |
| Testable | Write testable code with meaningful tests |
| Documented | Document every significant architectural decision |
| Non-duplicate | Never introduce duplicate functionality |
| Modular | Prefer modular, loosely coupled architecture |
| Backward Compatible | Maintain backward compatibility whenever practical |

---

## Intelligence Engineering Requirements

Every intelligence must have:

| Requirement | Location |
|---|---|
| Identity | `registry.ts` or `specialist/registry.ts` |
| Mission | `registry.ts` |
| Primary Responsibility | `registry.ts` |
| Inputs / Outputs | `registry.ts` |
| Events | `bus.ts` |
| Dependencies | `registry.ts` |
| Permissions / Restrictions | `registry.ts` |
| Metrics | `registry.ts` |
| Documentation | `src/docs/intelligence/<name>.md` |
| Interface | `src/lib/<name>/interface.ts` |
| Local Implementation | `src/lib/<name>/local.ts` |
| Public SDK | `src/lib/<name>/index.ts` |
| Version | `registry.ts` |
| Owner | `registry.ts` |

---

## Platform Evolution Rules

Before adding any new AI, answer:

1. Why does it exist?
2. What unique responsibility does it own?
3. Can an existing AI already perform this work?
4. Who will call it?
5. What events will it publish?
6. What events will it subscribe to?
7. What APIs does it expose?
8. How will it be tested?
9. How will it fail?
10. How will it recover?

**If these questions cannot be answered — do not create the AI.**

---

## Final Objective

Transform UNIBUD into a world-class AI-native Student Super App.

- Keep the architecture clean.
- Keep ownership clear.
- Keep workflows efficient.
- Keep the user experience simple.
- Keep the codebase modular.
- Keep documentation complete.

Every improvement must strengthen the ecosystem.

The finished platform should feel like one seamless intelligent operating system rather than a collection of separate applications.
