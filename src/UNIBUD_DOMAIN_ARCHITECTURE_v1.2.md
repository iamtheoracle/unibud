# UNIBUD OS — Domain Architecture Specification

> **Revision:** v1.2 · **Date:** 2026-08-01
> **Parent:** UNIBUD OS Core Architecture v1.0 (frozen) · IACP v1.1
> **Status:** Active Revision
>
> This specification formalizes the Domain Architecture of UNIBUD using Domain-Driven Design (DDD) principles. It maps every business domain to the **existing implementation** (entities, lib modules, pages, backend functions, agents) so engineering teams have an authoritative reference for where code belongs, how domains communicate, and where to extend.
>
> This is a **formalization** of the already-built system, not a greenfield design. The platform is live; this document names what exists and governs what comes next.
>
> **Full domain specifications:** [`UNIBUD_DOMAIN_ARCHITECTURE_Domains_v1.2.md`](./UNIBUD_DOMAIN_ARCHITECTURE_Domains_v1.2.md)

---

## Table of Contents

| Section | File |
|---|---|
| [DDD Structural Conventions](#ddd-structural-conventions) | This file |
| [Core Domains (1-12)](./UNIBUD_DOMAIN_ARCHITECTURE_Domains_v1.2.md) | Domains file |
| [Cross-Domain Rules](#cross-domain-rules) | This file |
| [Domain-to-Code Mapping](#domain-to-code-mapping) | This file |

## The 12 Core Domains

| # | Domain | Purpose | Key Entities |
|---|---|---|---|
| 1 | Identity & Access | Who users are, what they can do | User, Institution, Role, Device |
| 2 | Academic | University academic structure | Course, Assignment, Exam, TimetableEntry, StudentGrade |
| 3 | Learning | Content delivery and study tools | LearningPath, StudySession, Flashcard, Note |
| 4 | Research | Academic research lifecycle | ResearchProject, Citation, FYPProject |
| 5 | Community | Social fabric of campus | QuadPost, ShortVideo, Conversation, Message, Community |
| 6 | Campus | Physical campus experience | CampusEvent, Club, FootballMatch, LibraryResource |
| 7 | Administration | Institutional operations | FinancialTransaction, Wallet, FeeStructure, Scholarship |
| 8 | AI | Bud, Spark, agents, memory | BudMemory, SparkAgent, SparkExecutionLog |
| 9 | Workflow | Tasks, automations, scheduling | TaskManagement, Automation, CalendarEvent, Notification |
| 10 | Media | File storage and processing | Collection, UploadFile, ExtractDataFromUploadedFile |
| 11 | Integration | External systems and connectors | ProviderConnection, ProviderLog, WebhookEvent |
| 12 | Analytics | Dashboards, metrics, insights | AIServiceMetric, AuditLog, TrustScore |

---

## DDD Structural Conventions

Each domain in the [Domains file](./UNIBUD_DOMAIN_ARCHITECTURE_Domains_v1.2.md) is documented with the following structure:

| Attribute | Definition |
|---|---|
| **Purpose** | Why this domain exists in one sentence |
| **Responsibilities** | What this domain owns and does |
| **Scope** | What is explicitly inside vs. outside the bounded context |
| **Bounded Context** | The boundary that defines what this domain is responsible for |
| **Canonical Entities** | Entity names in `base44/entities/` that belong to this domain |
| **Value Objects** | Immutable, comparison-by-value concepts (not separately persisted) |
| **Aggregates** | Consistency boundaries — clusters of entities treated as a single unit |
| **Domain Services** | Stateless operations that don't belong to a single entity (`src/lib/<domain>/`) |
| **Application Services** | Orchestration layer — coordinates domain services, entities, and integrations |
| **APIs** | Backend functions (`base44/functions/`) exposed for this domain |
| **Events** | Realtime entity events + connector webhook events this domain emits or consumes |
| **Commands** | Write operations (create, update, delete, invoke) |
| **Queries** | Read operations (list, filter, get, search) |
| **Permissions** | RLS patterns + authority codes governing access |
| **Workflows** | `base44/workflows/` automations in this domain |
| **AI Interactions** | Agents, Bud capabilities, and LLM integrations this domain uses |
| **Integrations** | External systems this domain connects to |
| **Data Ownership** | Which domain owns each shared entity (prevents duplicate logic) |
| **Security Considerations** | RLS, tenant scoping, audit, privacy rules |
| **Audit Requirements** | What must be logged to `AuditLog` |
| **Extension Points** | Where new features in this domain should be added |

---

# Cross-Domain Rules

## 1. Domain Communication

Domains communicate **only** through governed APIs and events:

| Communication Type | Mechanism |
|---|---|
| Same-domain | Direct entity SDK calls + domain service methods |
| Cross-domain read | Domain service wrapper (e.g., `academicApi.js` calls Academic entities) |
| Cross-domain write | Backend function (governed, audited) |
| Async cross-domain | Entity realtime events + workflow triggers |
| External | Backend functions + Integration domain connectors |

**No domain directly accesses another domain's internal entities.** Cross-domain access goes through the target domain's application services or backend functions.

## 2. Single Ownership

Every entity has exactly one owning domain:

| Shared Entity | Owner | Consumers |
|---|---|---|
| `User` | Identity | All (reference only) |
| `Institution` | Identity | All (tenant scope) |
| `AuditLog` | AI (governance) | All (write), Analytics (read) |
| `Notification` | Workflow | All (consume) |
| `Citation` | Learning | Research |
| `CourseMaterial` | Academic | Learning |
| `CourseMaterialProgress` | Learning | Academic |
| `Staff` | Administration | Academic |
| `KYCRecord` | Administration | Identity |
| `StaffAnnouncement` | Academic | Administration (distribution) |
| `WebhookEvent` | Integration | Administration (financial) |
| `ApiKey` | Identity | Integration |
| `CrashReport` | AI | Analytics, Monitoring |
| `TrustScore` | Community | Analytics |
| `Club` | Campus | Community |
| `LostFoundItem` | Campus | Community |
| `LibraryResource` | Campus | Learning |
| `CalendarEvent` | Workflow | Academic, Integration |
| `StudentDocument` | Learning | Media (storage) |
| `InstitutionDocument` | Administration | Media (storage) |

## 3. No Duplicated Business Logic

- Domain services live in `src/lib/<domain>/` — each capability has one home
- Shared logic lives in `base44/shared/` (imported by multiple functions)
- If two domains need the same logic, extract to `base44/shared/` or the owning domain's service
- The realm abstraction layer (deleted in v1.2 cleanup) was a violation of this rule — do not recreate it

## 4. Bounded Context Preservation

- Each domain's entities, services, and pages are namespaced by directory:
  - Entities: `base44/entities/` (flat, but RLS-scoped)
  - Services: `src/lib/<domain>/`
  - Pages: `src/pages/<domain>/`
  - Components: `src/components/<domain>/`
- Domain boundaries are enforced by RLS, not by code structure alone
- A domain's internal models never leak to another domain's API

## 5. Future Extensibility

- New domains: add to this spec as v1.x revision, create `src/lib/<domain>/`, add entities, add pages
- New sub-domains: extend existing domain directory structure
- New cross-cutting concerns: `base44/shared/` module
- All extensions must declare ownership in this specification

## 6. Platform Governance

- All domains are governed by Oracle (AI domain)
- All domains are accessed through Bud (AI domain)
- All executive actions require authority code verification
- All domains inherit the 19 platform constitutions (see IACP Part XIII)
- Domain changes require architectural review (Architect authority)

## 7. Vendor and Technology Neutrality

- Domains define business capabilities, not technology choices
- Storage: Base44 entity store (platform-owned)
- Auth: Base44 auth backend (platform-owned)
- External APIs: Backend functions + Integration connectors
- AI: InvokeLLM + Spark providers (swappable)
- The domain model survives technology changes — only the implementation layer changes

---

# Domain-to-Code Mapping

## Quick Reference: Where does code go?

| If you're adding... | It goes in... |
|---|---|
| A new entity | `base44/entities/<Name>.jsonc` (declare owning domain in RLS) |
| Domain business logic | `src/lib/<domain>/<service>.js` |
| A new page | `src/pages/<domain>/<Page>.jsx` |
| A reusable component | `src/components/<domain>/<Component>.jsx` |
| An external API integration | `base44/functions/<name>/entry.ts` + `set_secrets` |
| Shared logic (2+ functions) | `base44/shared/<module>.ts` |
| A workflow | `base44/workflows/<Name>.jsonc` (via `get_workflow_guide`) |
| An AI agent | `base44/agents/<name>.jsonc` + `SparkAgent` entity |
| A connector | `get_connectors_info` → `request_oauth_authorization` or `register_workspace_connector` |
| A notification | `budNotificationEngine` function + `Notification` entity |
| A report | `src/lib/academics/reportEngine.js` or domain-specific report service |
| An analytics dashboard | `src/components/oracle/sections/` or domain dashboard component |

## Entity Count by Domain

| Domain | Entity Count | Key Entities |
|---|---|---|
| Identity & Access | 12 | User, Institution, StudentIdentifier, Role, Device |
| Academic | 25 | Course, Assignment, Exam, TimetableEntry, AttendanceRecord, StudentGrade |
| Learning | 10 | LearningPath, StudySession, Flashcard, Note, Citation |
| Research | 3 | ResearchProject, Citation (shared), FYPProject |
| Community | 29 | QuadPost, ShortVideo, Story, Podcast, Conversation, Message, Community, MarketplaceListing |
| Campus | 9 | CampusEvent, Club, FootballMatch, FoodItem, LibraryResource |
| Administration | 21 | FinancialTransaction, Wallet, FeeStructure, Scholarship, Staff, Admission |
| AI | 10 | BudMemory, BudConversation, SparkAgent, SparkExecutionLog, AIServiceMetric |
| Workflow | 13 | TaskManagement, Automation, CalendarEvent, Notification, StudyGroup |
| Media | 3 | Collection, InstitutionDocument (shared), StudentDocument (shared) |
| Integration | 5 | ProviderConnection, ProviderLog, WebhookEvent, ApiKey, UniversityConnection |
| Analytics | 5 | AIServiceMetric (shared), AuditLog (shared), TrustScore (shared), PlatformModule |
| **Total** | **~90+** | (many entities are shared across domains) |

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.2 | 2026-08-01 | Added Domain Architecture Specification — 12 domains with DDD structure, cross-domain rules, domain-to-code mapping. Formalizes existing implementation into bounded contexts. |

---

*UNIBUD OS — Domain Architecture Specification v1.2*
*Extends frozen v1.0 master architecture. Single source of truth for domain structure.*
*Every entity, service, and page is mapped to exactly one domain.*