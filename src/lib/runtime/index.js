/**
 * UNIBUD Runtime — Public API
 *
 * Production-grade AI runtime with cleanly separated responsibilities:
 *
 *   Bud       — user-facing companion (UI only, delegates to Oracle)
 *   Oracle    — runtime kernel (coordinator)
 *   Nexus     — platform kernel (orchestration)
 *   Guardian  — governance enforcement (DENY by default)
 *   Spark     — knowledge intelligence (reasoning only)
 *   Orbit     — execution management (workflows, scheduling, retries)
 *
 * Platform Services own shared concerns:
 *   Memory, Conversation, Knowledge, Search, Prompt, Model, Audit,
 *   Notification, Identity, Session, Configuration, Metrics, Telemetry, Health
 *
 * Registries are authoritative:
 *   AI, Capability, Prompt, Model, Tool, Workflow, Policy, Event, Service
 *
 * Usage:
 *   import { runtime } from '@/lib/runtime';
 *   await runtime.boot();                    // staged boot
 *   const result = await runtime.process({   // process a user request
 *     message: "What's my GPA?",
 *     userId: "user_123",
 *   });
 */

import { runtimeBoot } from './boot';
import { oracle } from './kernel/Oracle';
import { nexus } from './kernel/Nexus';
import { guardian } from './kernel/Guardian';
import { spark } from './kernel/Spark';
import { orbit } from './kernel/Orbit';

import { services } from './services';
import { registries } from './registries';
import { eventBus } from './eventBus';
import { logger } from './logger';

export const runtime = {
  boot: () => runtimeBoot.boot(),
  shutdown: () => runtimeBoot.shutdown(),
  process: (request) => oracle.process(request),

  get stage() { return runtimeBoot.stage; },
  get ready() { return runtimeBoot.ready; },
  get results() { return runtimeBoot.results; },

  // Kernel
  oracle,
  nexus,
  guardian,
  spark,
  orbit,

  // Services
  services,

  // Registries
  registries,

  // Infrastructure
  eventBus,
  logger,
};

export default runtime;