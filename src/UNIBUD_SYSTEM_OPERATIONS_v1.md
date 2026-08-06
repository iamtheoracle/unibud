# UNIBUD — System Operations

| Field | Value |
|---|---|
| Status | ACTIVE |
| Version | v1 |
| Effective Date | 2026-08-03 |
| Governing Document | UNIBUD_ARCHITECTURE_FREEZE_v1.md |
| Amendment Process | Same tiered system as Architecture Freeze |

---

## Purpose

This document defines how UNIBUD is deployed, monitored, maintained, and recovered. It does not modify the Architecture Freeze — it operationalizes it.

---

## 1. Boot Sequence

### Staged Initialization

UNIBUD boots in seven stages. Each stage must complete before the next begins.

| Stage | Name | Responsibility |
|---|---|---|
| 1 | Environment | Validate secrets, config, Deno env |
| 2 | Registry | Load capability, prompt, policy registries |
| 3 | Services | Initialize all platform services (BaseService lifecycle) |
| 4 | Kernel | Wire Oracle, Guardian, Nexus, Spark, Orbit |
| 5 | Intelligence | Initialize Student Intelligence Layer and sub-engines |
| 6 | Health | Run health probes on all services |
| 7 | Ready | Publish boot-complete event, open to traffic |

### Boot Rules

- A stage failure logs the error and marks the system as degraded, not crashed.
- Services that fail to initialize are marked as unavailable; the system continues with reduced capability.
- Boot results are published to the EventBus and visible in the PlatformCoreDashboard.
- The frontend boot provider (`RuntimeBootProvider`) gates rendering until boot completes or times out.

---

## 2. Service Lifecycle

### Lifecycle States

| State | Meaning |
|---|---|
| `stopped` | Not initialized |
| `starting` | Boot in progress |
| `healthy` | Running and responsive |
| `degraded` | Running but with issues |
| `restarting` | Recovery in progress |
| `failed` | Unrecoverable without intervention |

### Lifecycle Manager

`ServiceLifecycleManager` owns:
- Service registration and initialization order
- Health probe scheduling (periodic, not just boot-time)
- Automatic recovery attempts for degraded/failed services
- Recovery logging with timestamps and outcomes
- Service catalog exposure for dashboards

### Health Probes

Health probes are real operations, not readiness flags:

| Service Type | Probe Method |
|---|---|
| Database-backed | Lightweight entity query (`.list()` with limit 1) |
| SDK-dependent | Feature availability check |
| In-memory | State verification |
| Engine-layer | Domain-specific validation (e.g., routing dry-run) |

Probes run:
- At boot (Stage 6)
- Every 60 seconds (configurable per service)
- On-demand via dashboard

---

## 3. Monitoring and Observability

### Telemetry Service

Tracks:
- Request latency (per service, per capability)
- Error rates and types
- Boot stage timings
- Service health transitions
- Event bus throughput

### Event Bus

All significant platform events are published:

| Event | Category |
|---|---|
| `capability.resolved` | capability |
| `capability.executed` | capability |
| `intelligence.request_detected` | intelligence |
| `service.health_changed` | health |
| `service.recovery_started` | health |
| `service.recovery_completed` | health |
| `boot.stage_completed` | system |
| `boot.complete` | system |

### Audit Service

Records:
- All executive actions (authority codes, verifications)
- Entity CRUD operations by admin users
- Configuration changes
- Constitutional violations
- Architecture Review Gate decisions

### Dashboards

| Dashboard | Location | Purpose |
|---|---|---|
| PlatformCoreDashboard | `/platform-core` | Service health, lifecycle, kernel status |
| MigrationDashboard | `/migration` | Architecture migration tracking |
| ConsolidationDashboard | `/consolidation` | Module and dependency audit |
| AdminHub | `/admin` | Administrative overview |
| Oracle | `/oracle` | Platform operations center |

---

## 4. Realtime Engine

### Responsibilities

- Live data synchronization via entity subscriptions
- Presence tracking (online/offline status)
- Realtime feed updates (posts, messages, notifications)
- Automatic reconnection on disconnect

### Entity Sync Registry

All entities that require realtime sync are registered in `entitySyncRegistry.js`. The registry defines:
- Which entities subscribe to realtime events
- Event types (create, update, delete)
- Handler functions for state updates

### Realtime Rules

- Realtime subscriptions are established after boot completes.
- Disconnections trigger automatic reconnection with exponential backoff.
- Stale data is reconciled on reconnect.
- The realtime engine lifecycle is managed by the boot sequence.

---

## 5. Background Jobs

### Orbit (Job Scheduler)

Orbit manages:
- Scheduled tasks (reminders, notifications, sync)
- Retry queues for failed operations
- Background data processing
- Autonomous task engine execution

### Workflows

Workflows are defined as `.jsonc` files in `base44/workflows/`. Each workflow:
- Has a trigger (scheduled, entity, connector, agent, auth, publish)
- Contains steps (call, wait, switch)
- Is versioned — running workflows keep their starting version
- Has run history available via dashboard

### Active Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| Welcome New Student | app_user_auth | Greet and onboard new users |
| Deadline Reminders | scheduled | Notify students of upcoming deadlines |
| Event Reminders | scheduled | Notify students of upcoming events |
| Exam Countdown | scheduled | Exam preparation reminders |
| Study Streak Reminders | scheduled | Study streak maintenance |
| Task Deadline Reminders | scheduled | Task due date notifications |
| Bud Reminders | scheduled | Bud proactive notifications |
| Bud Notification Engine | scheduled | Smart notification batching |
| Google Calendar Sync | connector | Calendar event synchronization |
| Study Group Notifications | entity | Study group activity alerts |
| Outreach Follow-up | scheduled | Institution outreach follow-ups |
| Automatic Academic Tasks | scheduled | Auto-create tasks from academic data |

---

## 6. Incident Response

### Severity Levels

| Severity | Definition | Response Time |
|---|---|---|
| Critical | System down, data loss risk | Immediate |
| High | Major feature broken | < 1 hour |
| Medium | Feature degraded | < 4 hours |
| Low | Minor issue, workaround exists | < 24 hours |

### Response Process

1. **Detect** — Health probe, telemetry alert, or user report
2. **Triage** — Classify severity, identify affected components
3. **Isolate** — Prevent cascade; mark affected services as degraded
4. **Resolve** — Apply fix or rollback
5. **Verify** — Health probes confirm recovery
6. **Document** — Log incident, root cause, and resolution in Audit Service

### Escalation

- Automated recovery attempts: up to 3 retries per service
- If recovery fails, service is marked `failed` and requires manual intervention
- Critical incidents trigger notifications to admin users via the Notification system

---

## 7. Backup and Recovery

### Data Persistence

- Entity data is stored in the Base44 managed database
- File uploads are stored via `UploadFile` / `UploadPrivateFile`
- Private files require signed URLs for access (`CreateFileSignedUrl`)

### Recovery Procedures

| Scenario | Recovery Action |
|---|---| 
| Service crash | Lifecycle manager auto-restarts (up to 3 attempts) |
| Entity data corruption | Restore from Base44 database backups |
| Failed deployment | Rollback to previous build via platform |
| Lost secrets | Re-declare via `set_secrets`, user re-provides values |
| Connector token expiry | Platform auto-detects revoked grants; re-authorize via OAuth |

### Disaster Recovery

- UNIBUD is a stateless frontend + managed backend — no server infrastructure to restore.
- Critical state lives in entities (database) and secrets (platform-managed).
- Recovery priority: Auth → Entities → Backend functions → Workflows → Connectors.

---

## 8. Security Operations

### Access Control

| Layer | Mechanism |
|---|---|
| User authentication | Base44 Auth (email/password, Google OAuth, OTP) |
| Route protection | `ProtectedRoute` wrapper |
| Data access | Row-Level Security (RLS) per entity |
| Admin access | `OracleWorkspaceGuard` with role verification |
| API keys | Declared secrets, accessed via `Deno.env.get()` |

### Role Hierarchy

```
super_admin > platform_admin > institution_owner > university_admin >
registrar > dean > head_of_department > lecturer > security_officer >
admin > user
```

### Security Monitoring

- `SecurityEvent` entity tracks security-relevant events
- `AuditLog` entity records all administrative actions
- `CrashReport` entity captures frontend crashes
- `ApiKey` entity manages API key lifecycle
- `Device` entity tracks user devices

### Known Security Considerations

- Several admin routes are currently unguarded — must be secured before beta
- Role registries are fragmented across multiple config files — consolidation needed
- Founder lockout risk exists if last admin role is removed — safety net required

---

## 9. Performance and Scalability

### Performance Targets

| Metric | Target |
|---|---|
| Bud response time | < 3 seconds (simple), < 8 seconds (complex) |
| Page load (initial) | < 2 seconds |
| Entity list queries | < 500ms |
| Realtime event delivery | < 1 second |
| Health probe execution | < 2 seconds per service |

### Optimization Strategies

- Lazy-load all pages via `React.lazy()`
- Use `@tanstack/react-query` for caching and background refresh
- Batch entity operations to reduce API calls
- Use the `Image` component for optimized image delivery
- Prefer `bulkCreate`/`bulkUpdate` over loops
- Keep components small (≤50 lines) for efficient re-renders
- Use `useMemo` and `useCallback` to prevent unnecessary re-renders

### Scalability Constraints

- `updateMany` processes up to 500 records per call
- `bulkCreate`/`bulkUpdate` process up to 500 records per call
- Large operations must be chunked
- Entity fields must not store large content (base64, blobs) — use file URLs

---

## 10. Deployment

### Build Process

- Vite + React build — standard platform deployment
- No custom server infrastructure
- Environment variables and secrets managed by the platform
- Published apps serve from the platform CDN

### Pre-Deployment Checklist

- [ ] No build errors or warnings
- [ ] No unresolved imports
- [ ] All backend functions tested
- [ ] Health probes passing
- [ ] RLS rules present on all entities with user/institution data
- [ ] No demo/placeholder data in production
- [ ] Secrets declared and provided
- [ ] Connectors authorized (if used)

### Post-Deployment Verification

- [ ] Boot sequence completes (all 7 stages)
- [ ] All services report `healthy`
- [ ] Bud responds to messages
- [ ] Realtime subscriptions active
- [ ] Workflows triggering correctly
- [ ] Health dashboard shows green

---

*This document implements the System Operations companion to the Architecture Freeze. All operational decisions must conform to both this document and the Architecture Freeze. Version: v1. Status: ACTIVE.*