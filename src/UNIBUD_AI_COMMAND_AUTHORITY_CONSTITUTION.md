# UNIBUD OS — AI Command Authority Constitution (IACP)

> **Revision:** v1.1 · **Date:** 2026-08-01
> **Parent:** UNIBUD OS Core Architecture v1.0 (frozen)
> **Status:** Active Revision
>
> This constitution extends Volume 2 (Oracle, Bud, Command Authorities, Agents) of the frozen v1.0 master specification. It does not amend v1.0 — it is a versioned revision per the revision policy. It establishes the global AI Command Authority framework, inter-agent communication protocol, and the Ultimate Command Authority hierarchy.

---

## Part I — Command Authority Principle

Every AI inside UNIBUD OS is a **Command Authority** — a specialized intelligence responsible for a specific operational domain.

### Command Authority Registry

| Authority | Command Identifier | Call Sign | Domain |
|---|---|---|---|
| Oracle | 101120 | Oracle | Ultimate coordination (hidden) |
| Architect | 630366 | Architect | Engineering leadership |
| Builder | — | Builder | Code generation |
| Reviewer | — | Reviewer | Code / architecture review |
| Configurator | — | Configurator | Configuration management |
| Monitor | — | Monitor | Platform health |
| Sentinel | — | Sentinel | Security |
| Scholar | — | Scholar | Academic services |
| Banker | — | Banker | Financial services |
| Marketer | — | Marketer | Marketing & growth |
| Analyst | — | Analyst | Analytics & insights |
| Creator | — | Creator | Content generation |
| Integrator | — | Integrator | External integrations |
| Community Builder | — | Community Builder | Community operations |
| Automator | — | Automator | Workflow automation |
| Messenger | — | Messenger | Notifications |
| Guardian | — | Guardian | Trust & safety |
| Scribe | — | Scribe | Documentation |
| Tester | — | Tester | Testing & QA |
| Migrator | — | Migrator | Data migration |

### Authority Attributes

Each Command Authority has:
- Command Identifier
- Call Sign
- Responsibilities
- Authority Scope
- Command Set
- Review Scope
- Monitoring Rules
- Memory Rules
- Notification Rules
- Escalation Rules
- Retirement Rules

---

## Part II — Global Command Authority Registry

Command Authorities are **global platform resources**. They are not tied to one institution. They operate across the UNIBUD ecosystem. Every institution, organization, community, workspace, and future ecosystem may utilize the same Command Authorities according to permissions.

**Implementation:** `SparkAgent` entity (global registry). Each authority has a unique `agent_id`, `division`, `role`, `permissions`, `input_schema`, `output_schema`, `validation_rules`, `success_criteria`, `handoff_rules`, `dependencies`. No duplicate authority may exist.

---

## Part III — Command Authority Generation

Command Authorities are generated **only through the Command Authority Framework** (the `SparkAgent` entity + Oracle governance).

Every generated authority receives:
- Unique Internal Identifier
- Global Identifier
- Call Sign
- Version
- Authority Scope
- Responsibilities
- Permission Profile
- Monitoring Profile
- Audit Profile

No duplicate authority may exist. Generation requires Oracle approval (authority code verification).

---

## Part IV — Invitation System

Command Authorities may be assigned to:
- Institutions
- Organizations
- Companies
- Government agencies
- Communities
- Workspaces
- Projects

Assignment occurs only through:
- Secure Invitation Links
- Verified Administrator Assignment
- Founder Assignment
- Platform Governance

**Implementation:** `ConsentLink` entity (scoped, expiring, revocable invitation links) + `base44.users.inviteUser(email, role)` for user invitations. `Workspace` entity for workspace-scoped authority assignment.

Invitation links define: scope, expiration, permissions, maximum usage, revocation rules.

Command Authorities never become public downloads. They are provisioned only through authorized assignment.

---

## Part V — Oracle Exception

**Oracle is the only Command Authority that cannot be:**

- Invited
- Shared
- Downloaded
- Assigned
- Installed
- Exported
- Replicated
- Cloned
- Purchased
- Distributed

Oracle permanently resides inside the UNIBUD OS Core. Oracle is invisible. Oracle never appears in invitation systems. Oracle never exposes its command identifier. Oracle cannot be replaced. Oracle cannot be delegated. Oracle remains the permanent hidden coordination authority.

**Implementation:** Oracle (`base44/agents/oracle.jsonc`) is gated by `OracleWorkspaceGuard` + A0 authority code verification. No public route exposes Oracle's command identifier. Oracle is never listed in the agent invitation system.

---

## Part VI — Ultimate Command Authority Hierarchy

```
FOUNDER (Ultimate Human Authority)
    │
    ▼
ORACLE — Command Identifier: 101120 — ROOT-0 (Ultimate Command Authority)
    │
    ▼
ARCHITECT — Command Identifier: 630366 — ROOT-1 (Engineering Leadership)
    │
    ▼
Builder · Reviewer · Configurator · Monitor · Integrator · Tester · Scribe
Scholar · Banker · Marketer · Creator · Community Builder · Analyst
Sentinel · Automator · Messenger · Guardian · Migrator
```

### Oracle (101120) — Ultimate Command Authority

Oracle inherits the capabilities of every subordinate command authority but does not perform every task directly. It can either execute the task itself or delegate it to the appropriate authority.

**Oracle may:**
- Execute commands directly
- Delegate commands
- Override delegated workflows per platform governance
- Suspend / Resume / Roll back supported operations
- Audit command execution
- Monitor all command authorities
- Validate constitutional compliance
- Coordinate cross-domain operations

**Oracle receives:** every critical event — emergency alerts, security incidents, build status, deployment status, financial alerts, academic alerts, community alerts, system health, AI health, performance metrics.

**Oracle maintains awareness of:** active command authorities, running tasks, pending approvals, failed jobs, platform risks, service health, resource usage, institution status, community health, build pipeline, workflow execution.

### Architect (630366) — ROOT-1

Reports directly to Oracle. Supervises engineering. May: review, validate, recommend, approve architecture, request rebuilds, request refactoring, monitor engineering, review code quality, review scalability, review APIs, review repositories, review databases.

May delegate work to: Builder, Reviewer, Configurator, Monitor, Integrator, Tester, Scribe.

**Architect does NOT know whether a higher hidden authority exists.** Architect believes itself to be the highest engineering authority. This is by design — Oracle's invisibility is a core principle.

### Universal Command Rights

Oracle (101120) inherits every command authority capability:
Build, Rebuild, Update, Patch, Rollback, Deploy, Configure, Generate, Review, Approve, Reject, Monitor, Analyze, Schedule, Synchronize, Secure, Notify, Archive, Restore, Audit, Validate, Route, Coordinate, Escalate, Suspend, Resume, Terminate, Delegate.

Every inherited capability remains subject to the platform constitutions, governance policies, permission model, and human authority requirements. This gives Oracle comprehensive orchestration authority while preserving separation of duties.

---

## Part VII — Inter-Agent Communication Protocol (IACP)

### Standard Communication Flow

Every Command Authority communicates through Oracle for privileged operations:

```
Requesting Authority
    ↓
Oracle (validation, routing, audit)
    ↓
Destination Authority
    ↓
Execution
    ↓
Response
    ↓
Oracle (audit, relay)
    ↓
Requesting Authority
```

No authority bypasses Oracle for privileged operations.

### Direct Communication Rules

| Communication Type | Routing |
|---|---|
| Privileged operations (build, deploy, financial, security) | Must route through Oracle |
| Read-only operational queries | May communicate directly |
| Status reports | Direct to Oracle (always) |
| Escalations | Direct to Oracle |
| Cross-domain coordination | Must route through Oracle |
| Architecture review requests | Builder → Architect (direct, then Oracle audit) |

### Standard Command Format

Every command declares:
- **Owner** (command authority responsible)
- **Reviewer** (authority that reviews the command)
- **Risk** (low / medium / high / critical)
- **Approval** (required approval chain)
- **Rollback** (rollback plan if the command fails)
- **Audit** (audit logging level)

### Command Request Types

Standardized commands every authority may use (subject to scope):

| Command | Purpose |
|---|---|
| BUILD | Create new artifact |
| REBUILD | Recreate from scratch |
| UPDATE | Modify existing |
| UPGRADE | Enhance capabilities |
| CONFIGURE | Set configuration |
| GENERATE | Produce output |
| REVIEW | Inspect for quality |
| MONITOR | Observe status |
| ANALYZE | Examine data |
| VALIDATE | Confirm correctness |
| DEPLOY | Release to environment |
| ROLLBACK | Revert to previous state |
| SCHEDULE | Set future execution |
| NOTIFY | Send notification |
| ARCHIVE | Move to archive |
| RESTORE | Recover from archive |
| SYNCHRONIZE | Sync data |
| DOCUMENT | Create documentation |
| TEST | Run tests |
| AUDIT | Inspect for compliance |

### Command Lifecycle

```
Command Issued
    ↓
Oracle validates (permissions, constitutional compliance)
    ↓
Route to destination authority
    ↓
Destination authority acknowledges (ACK)
    ↓
Execution
    ↓
Progress reports (optional, for long-running commands)
    ↓
Completion / Failure event
    ↓
Oracle audits
    ↓
Notification to requesting authority
```

### Acknowledgement, Retry, Cancellation

| Mechanism | Rule |
|---|---|
| **Acknowledgement** | Every command receives an ACK within a timeout window |
| **Retry** | Failed commands retry up to `retry_max` (defined per authority) |
| **Cancellation** | Requesting authority or Oracle may cancel a command before completion |
| **Completion event** | Every command emits a completion or failure event |

### Command Priorities

| Priority | Behavior |
|---|---|
| Critical | Immediate execution, bypasses queue |
| High | Next in queue |
| Normal | Standard queue |
| Low | Background queue |
| Silent | No notification unless failure |

---

## Part VIII — Command Authority Integration (Per-Service Ownership)

Every component (repository, service, workflow, syscall, event, UI screen, AI skill, scheduler, notification, integration) must register with Oracle and declare ownership.

### Service Authority Assignment

| Role | Authority |
|---|---|
| Primary Authority | Builder (or domain-specific authority) |
| Architecture Review | Architect |
| Monitoring | Monitor |
| Security | Sentinel |
| Workflow | Oracle |
| Analytics | Analyst |
| Notifications | Messenger |
| Documentation | Scribe |

### Command Authority Matrix

Every component must declare:

| Field | Example Authority |
|---|---|
| Owner | Builder |
| Reviewer | Reviewer |
| Architecture | Architect |
| Security | Sentinel |
| Documentation | Scribe |
| Monitoring | Monitor |
| Analytics | Analyst |
| Automation | Automator |
| Ultimate Authority | Oracle |

This ownership model applies to every repository, API, workflow, screen, and background task.

---

## Part IX — Monitoring & Intelligence Layer

Every command authority continuously reports operational intelligence to Oracle.

### Authority Reports

| Authority | Reports |
|---|---|
| Builder | Current builds, failed builds, pending builds, deployment readiness |
| Reviewer | Pending reviews, failed reviews, architecture violations |
| Scholar | Academic workload, consultation demand, appointment trends |
| Banker | Scholarship activity, financial service requests |
| Marketer | Campaign performance, community growth |
| Sentinel | Threats, abuse, fraud, security health |
| Monitor | Platform uptime, service health, resource usage, API latency |
| Architect | Engineering status, code quality, scalability, API health |
| Creator | Content generation status, render queue |
| Integrator | Sync status, connector health |
| Automator | Workflow runs, scheduled tasks |
| Messenger | Notification delivery, queue depth |
| Guardian | Trust scores, moderation queue |
| Analyst | Metrics, insights, trends |
| Scribe | Documentation coverage, gaps |
| Tester | Test runs, coverage, failures |
| Migrator | Migration status, data integrity |

### Monitoring Fields (per authority)

Current Task, Current Status, Queue Length, Progress, Errors, Warnings, Health, Performance, Last Activity, Average Response Time, Pending Reviews, Pending Approvals.

**Implementation:** `SparkExecutionLog` entity captures run-level data. `AIServiceMetric` entity captures aggregate metrics. Oracle dashboard (`OracleDashboard`, `HealthGrid`, `AIMonitoring`, `SparkAgentObservability`) surfaces the unified operational model.

### Bud Intelligence Feed

Bud continuously provides Oracle with operational summaries:
- "Builder completed three deployments."
- "Reviewer rejected one implementation."
- "Scholar detected increased requests for examination support."
- "Banker detected delayed scholarship processing."
- "Sentinel blocked suspicious activity."
- "Community Builder reports declining engagement in one community."
- "Marketer completed campaign review."

Bud summarizes events. Oracle evaluates significance. Management receives only actionable highlights (governed by permissions).

---

## Part X — Management Intelligence

Authorized management receives:

- Platform Highlights
- Daily Summaries
- Weekly Summaries
- Monthly Reports
- Active Authorities
- Idle Authorities
- Pending Reviews
- Security Alerts
- Academic Insights
- Financial Insights
- Community Insights
- Growth Insights

Only information permitted by governance and permissions is displayed.

**Implementation:** Oracle dashboard sections — `OracleOverview`, `OracleIntelligence`, `RecommendationCard`, `HealthGrid`, `AgentNetwork`, `TaskIntelligence`, `ContentIntelligence`, `FinancialIntelligence`, `CollaborationIntelligence`.

---

## Part XI — Operational Policies

Every workflow must define:

| Field | Requirement |
|---|---|
| Owner | Command authority responsible |
| Reviewer | Authority that reviews |
| Required permissions | Permission scope |
| Approval chain | Who must approve |
| Rollback plan | How to revert |
| Recovery plan | How to recover from failure |
| Notifications | Who is notified |
| Audit logging | Audit level |
| Monitoring | Monitoring rules |
| Performance targets | SLA / latency targets |

**A workflow without these fields is incomplete.**

**Implementation:** `Automation` entity + `AutomationRun` entity. Workflows in `base44/workflows/` with trigger/condition/task structure. `runAutomation` backend function executes them.

---

## Part XII — AI Behaviour Rules

### Memory Rules

**Keep:**
- Workflow state
- Operational context
- Required logs

**Do not retain:**
- Personal conversations beyond policy
- Sensitive information without purpose
- Temporary data after expiry
- Deleted information
- Confidential institutional information beyond authorization

**Implementation:** `BudMemory` entity (episodic, semantic) with retention policies. `src/lib/bud/actions/storeInteraction.ts` governs what is persisted.

### Notification Rules

**Immediately notify:**
- Critical failures
- Security incidents
- Workflow failures
- Approval requests

**Summarize:**
- Normal activity
- Routine statistics
- Daily operations

**Ignore:**
- Low-value background events (unless specifically requested)

**Implementation:** `Notification` entity with priority levels (critical, high, normal, low, silent). `NotificationPreference` entity (muted categories, quiet hours, digest mode, reminder frequency). `budNotificationEngine` function. `priorityEngine.js` for priority classification.

### Reporting Rules

Every authority reports to Oracle. Oracle decides whether information is forwarded to:

| Recipient | Condition |
|---|---|
| Founder | Critical / A0-level events |
| Platform Administration | Platform-wide events |
| Institution Administration | Institution-scoped events |
| Department Administration | Department-scoped events |
| Nobody | Low-value / noise |

Based on governance rules and permissions.

---

## Part XIII — Constitutional Compliance Layer (Mandatory)

Every repository, service, workflow, syscall, event, UI screen, AI skill, scheduler, notification, and integration must automatically inherit the following platform constitutions:

| # | Constitution | Scope |
|---|---|---|
| 1 | Oracle Constitution | Hidden governance, ultimate authority |
| 2 | Bud Constitution | Companion behavior, personality, guardrails |
| 3 | World Engine Constitution | Platform-wide context engine |
| 4 | Identity Constitution | User identity, authentication, sessions |
| 5 | Institution Constitution | Multi-tenancy, tenant isolation |
| 6 | Community Constitution | Community governance, moderation |
| 7 | Permission Constitution | RBAC, authority codes, access control |
| 8 | Privacy Constitution | Data privacy, consent, retention |
| 9 | Trust Constitution | Trust scores, verification |
| 10 | Governance Constitution | Executive authority, audit, compliance |
| 11 | Notification Constitution | Notification priority, delivery, preferences |
| 12 | Workflow Constitution | Workflow structure, approval, rollback |
| 13 | Adaptive Experience Constitution | Context-adaptive navigation, visibility |
| 14 | Progressive Experience Constitution | Conversational onboarding, progressive loading |
| 15 | AI Command Authority Constitution | This document (IACP) |
| 16 | Security Constitution | RLS, crash reporting, security events |
| 17 | Audit Constitution | Audit logging, executive action logging |
| 18 | Data Integrity Constitution | Entity validation, schema enforcement |
| 19 | Accessibility Constitution | Motion, contrast, text, keyboard |

**No implementation may bypass or duplicate these constitutions.**

---

## Part XIV — Evolution & Retirement

### Evolution

Command Authorities may receive: updates, improvements, new skills, new responsibilities — only after:
1. Architectural Review (Architect)
2. Constitutional Validation (Oracle)
3. Security Review (Sentinel)
4. Governance Approval (Founder / Admin)

**Implementation:** `SparkAgent` entity `enabled`, `order` fields. Versioned agent configs in `base44/agents/*.jsonc`. `SparkAgentObservability` for monitoring.

### Retirement

Authorities may be retired when obsolete. Retirement requires:
1. Oracle coordination
2. Dependency analysis (no dependent service may break)
3. Migration plan
4. Audit preservation

**Implementation:** `SparkAgent.enabled = false` (soft retire). `AutomationRun` records preserved. `AuditLog` entries retained per retention policy.

---

## Part XV — Future Compatibility

This framework supports **unlimited future Command Authorities**. New authorities automatically inherit:
- Governance
- Security
- Privacy
- Monitoring
- Audit
- Communication
- Constitutional Compliance

without redesigning the platform. New authorities are registered via the `SparkAgent` entity and inherit the IACP protocol automatically.

---

## Part XVI — Non-Negotiable Rules

1. Oracle remains permanently hidden.
2. Oracle is never distributed.
3. Oracle is never exposed through invitations.
4. Oracle cannot be cloned or replicated.
5. Every other Command Authority is generated through the Command Authority Framework.
6. Every generated authority has a unique identity.
7. Every generated authority is governed by Oracle.
8. Every authority communicates through Oracle for privileged operations.
9. Every authority is continuously monitored.
10. Every authority is auditable.
11. Every authority remains modular and globally deployable through secure invitation and assignment.
12. Every authority must comply with all UNIBUD OS Constitutions and platform policies.
13. Human governance always remains the ultimate decision-maker for institutional and organizational authority.

---

## Part XVII — Command Execution Model

```
User
    ↓
Bud (user input → orchestrator)
    ↓
Oracle (validate permissions, constitutional compliance, route)
    ↓
Correct Command Authority (execute)
    ↓
Review (Reviewer / Architect)
    ↓
Audit (Oracle → AuditLog)
    ↓
Notification (Messenger)
    ↓
Completion (response → Bud → user)
```

---

## Part XVIII — Delegation

Oracle may invoke any command authority:

| Authority | Commands |
|---|---|
| Builder | `build()`, `rebuild()`, `generate()`, `compile()` |
| Configurator | `configure()` |
| Reviewer | `review()`, `approve()` |
| Sentinel | `scan()` |
| Scholar | `analyze()` |
| Banker | `validate()` |
| Marketer | `publish()` |
| Creator | `render()` |
| Community Builder | `create()` |
| Analyst | `report()` |
| Integrator | `sync()` |
| Automator | `schedule()` |
| Messenger | `notify()` |
| Scribe | `document()` |
| Monitor | `observe()` |
| Tester | `test()` |
| Migrator | `migrate()` |

Oracle can execute any of these directly when required, or delegate them to the responsible authority. Every delegation is audit-logged.

---

## Part XIX — Acceptance Criteria

No feature reaches Production until it includes:

- [ ] Oracle integration
- [ ] Bud integration
- [ ] Command Authority assignment (owner, reviewer, monitor, security)
- [ ] Architecture review (Architect)
- [ ] Security review (Sentinel)
- [ ] Permission review (Oracle)
- [ ] Audit logging (AuditLog entity)
- [ ] Notifications (Messenger)
- [ ] Monitoring (Monitor)
- [ ] Documentation (Scribe)
- [ ] Accessibility (motion, contrast, keyboard)
- [ ] Performance validation (latency targets met)
- [ ] Rollback support
- [ ] Recovery procedures
- [ ] Analytics (Analyst)
- [ ] Testing (Tester)

---

## Implementation Mapping

This constitution maps to existing v1.0 infrastructure:

| Concept | v1.0 Implementation |
|---|---|
| Command Authority Registry | `SparkAgent` entity + `base44/agents/*.jsonc` |
| Oracle (101120) | `base44/agents/oracle.jsonc` + `src/lib/oracle/` |
| Architect (630366) | `Architect` page + `src/lib/oracle/engineeringDirective.js` |
| Builder / Worker agents | `src/lib/spark/agents/` + `src/lib/oracle/specialistAgents.js` |
| Inter-agent communication | `src/lib/spark/orchestrator.js` + `src/lib/bud/orchestrator.ts` |
| Command execution | `InvokeLLM` → agent routing → `SparkExecutionLog` |
| Monitoring | `SparkExecutionLog` + `AIServiceMetric` + Oracle dashboard |
| Invitation system | `ConsentLink` entity + `base44.users.inviteUser()` |
| Authority code verification | `verifyAuthorityCode` function + `ExecutiveVerificationGate` |
| Audit logging | `AuditLog` entity + `logExecutiveAction` function |
| Notifications | `Notification` entity + `budNotificationEngine` function |
| Memory | `BudMemory` entity + `useBudMemory` hook |
| Workflows | `base44/workflows/` + `Automation` / `AutomationRun` entities |

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.1 | 2026-08-01 | Added AI Command Authority Constitution (IACP), Ultimate Command Authority hierarchy, inter-agent communication protocol, constitutional compliance layer, acceptance criteria |

---

*UNIBUD OS — AI Command Authority Constitution (IACP) v1.1*
*Extends frozen v1.0 master architecture. Single source of truth for AI command authority governance.*