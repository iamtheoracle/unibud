# AI Kernel Cycle 1 — Verified Implementation Map

This document describes verified repository behavior for Cycle 1 of the AI Kernel integration. It intentionally records only source-backed findings from the current codebase.

## Verified findings

### Core runtime kernel

- `src/lib/runtime/kernel/Oracle.js`
  - Coordinates the production request path from Bud into Guardian and Nexus.
  - Publishes request/response audit events and uses `TelemetryService`.
- `src/lib/runtime/kernel/Nexus.js`
  - Resolves capabilities, gathers memory/knowledge context, routes some student-intelligence flows, and delegates reasoning/synthesis to runtime Spark.
- `src/lib/runtime/kernel/Spark.js`
  - Provides reasoning and synthesis only.
  - Uses `ModelService` and `PromptService`.
  - Receives memory and knowledge as inputs rather than owning those stores.
- `src/lib/runtime/kernel/Orbit.js`
  - Schedules and retries workflow jobs and emits workflow lifecycle events.
- `src/lib/runtime/kernel/Guardian.js`
  - Enforces policies before model invocation and relies on runtime registries/services.

### Primary AI integrations verified from source

- **Bud**
  - Public SDK entry: `src/lib/bud/index.ts`
  - Verified behavior: builds Bud personality prompt, routes requests through runtime Oracle, keeps transcript cache for API compatibility.
- **Spark**
  - Public SDK entry: `src/lib/spark/index.ts`
  - Verified behavior: exposes identity, memory, knowledge, search, writing, translation, automation, notifications, and provider-backed reasoning services.
- **Oracle**
  - Verified in runtime kernel and in additional Oracle-oriented UI/admin code under `src/lib/oracle/` and `src/components/oracle/`.
- **Orbit**
  - Verified in runtime kernel and additional orbit-related academic/category hooks such as `src/hooks/useOrbitCategories.js` and `src/lib/academic/orbitStudyPlanner.js`.
- **Lens**
  - No dedicated `src/lib/lens` runtime kernel module was verified in the inspected source.
  - Closest verified behavior is search/discovery infrastructure such as `src/hooks/useUniversalSearch.js`, `src/lib/search/universalSearch.js`, and `base44/agents/search.jsonc`.
- **Architect**
  - Verified implementation exists in `src/lib/architect/`, `src/components/architect/`, and `base44/entities/ArchitectConfig.jsonc`.
- **The Artist**
  - No production AI implementation with this verified name was found in inspected source.
  - Creative/media-adjacent code exists (for example `src/components/ai/AIVisualStudio.jsx`), but it is not documented here as “The Artist” because that mapping was not source-explicit.

### Additional AI-related implementations under other names

- Runtime registries: `src/lib/runtime/registries/`
  - `AIRegistry`, `CapabilityRegistry`, `PromptRegistry`, `WorkflowRegistry`, `PolicyRegistry`, `ServiceRegistry`, `EventRegistry`, `ModelRegistry`, `ToolRegistry`
- Runtime services: `src/lib/runtime/services/`
  - Verified shared concerns include memory, knowledge, configuration, permissions, identity, telemetry, metrics, health, notifications, audit, analytics, and storage.
- Base44 agent configs: `base44/agents/*.jsonc`
  - Verified configured agent names include `bud`, `spark`, `oracle`, `search`, `quad`, `campus`, `career`, `library`, `notification`, `pulse`, `study`, `admin`, and `security`.

## Cycle 1 shared infrastructure reused for Bud + Spark

Cycle 1 integrates Bud and Spark into a shared kernel facade while reusing existing production infrastructure:

- **AI Registry**: `src/lib/runtime/registries/AIRegistry.js`
- **AI Context**: kernel-managed component context in `src/lib/ai/kernel.js`
- **AI Event Bus**: `src/lib/runtime/eventBus.js`
- **AI Workflow Engine**: `src/lib/runtime/kernel/Orbit.js` plus `WorkflowRegistry`
- **AI Memory Bridge**: `src/lib/runtime/services/MemoryService.js`
- **AI Knowledge Bridge**: `src/lib/runtime/services/KnowledgeService.js`
- **AI Identity Bridge**: `src/lib/runtime/services/IdentityService.js`
- **AI Logger**: `src/lib/runtime/logger.js`
- **AI Health Monitor**: `src/lib/runtime/services/HealthService.js` and lifecycle health checks
- **AI Configuration**: `src/lib/runtime/services/ConfigurationService.js`
- **AI Permissions**: `src/lib/runtime/services/PermissionsService.js`
- **AI Capability Registry**: `src/lib/runtime/registries/CapabilityRegistry.js`
- **AI Metrics**: `src/lib/runtime/services/MetricsService.js`
- **AI Telemetry**: `src/lib/runtime/services/TelemetryService.js`

## Cycle 1 implementation notes

- Added `src/lib/ai/kernel.js` as the shared Bud/Spark kernel facade.
- Bud now initializes/registers with the kernel before request processing and exposes lifecycle/health metadata methods.
- Spark now participates in the same kernel lifecycle during initialize, shutdown, and reset.
- `src/lib/app-params.js` was hardened for non-browser environments so Bud/runtime imports remain test-safe.

## Files changed in Cycle 1

- `src/lib/app-params.js`
- `src/lib/ai/kernel.js`
- `src/lib/bud/index.ts`
- `src/lib/spark/index.ts`
- `tests/ai-kernel-cycle1.test.js`

## Risks and gaps

- Some source areas contain multiple overlapping AI abstractions (older Bud/Spark orchestration and newer runtime-kernel routing). Cycle 1 integrates the current public Bud/Spark APIs without rewriting all older internal paths.
- Test runs show fallback behavior when Base44 URLs are unavailable in local test execution; this is tolerated by current tests but remains an observability/runtime-noise risk.
- Oracle, Lens, Orbit, Architect, and other specialist integrations beyond Bud/Spark remain follow-on work.
