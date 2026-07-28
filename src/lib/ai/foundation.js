/**
 * UNIBUD AI Foundation — the centralized parent-agent architecture.
 *
 * This is the single canonical entry point that consolidates the previously
 * approved intelligence hierarchy, Oracle systems, platform engines, global
 * registries, and the Bud / Spark agent registry. Nothing here is new
 * architecture — it only re-exports the approved modules so every consumer
 * references one source of truth.
 *
 *   import { AI_FOUNDATION } from "@/lib/ai/foundation";
 *
 * Locked hierarchy (do not alter):
 *
 *   Oracle  ── Knowledge & Intelligence Core (invisible)
 *     └─ Bud ── the ONLY visible assistant
 *          ├─ Architect / Management / Operators ── platform operations
 *          └─ Platform Services ── specialist internal agents (invisible)
 *
 * Rules locked by the approved design:
 *   • Bud is the sole AI persona users ever see.
 *   • Oracle, Spark, Pulse and every specialist agent remain invisible.
 *   • Every request flows Bud → Oracle → Specialist → Oracle → Bud.
 *   • Agents never communicate directly with users or with each other.
 *   • No duplicate AI services; no merged responsibilities; no renamed AIs.
 */

export {
  ORACLE_CORE,
  BUD_INTERFACE,
  INTELLIGENCE_AGENTS,
  INTERNAL_SERVICES,
  OPERATIONS_HIERARCHY,
  OPERATIONS_CENTERS,
  ORCHESTRATION_PROTOCOL,
  getFullEcosystem,
} from "@/lib/oracleEcosystem";

export {
  ORACLE_SYSTEMS,
  SYSTEM_COMMUNICATION_RULES,
  SYSTEM_PRIORITY,
  getSystemById,
} from "@/lib/oracleSystems";

export { PLATFORM_ENGINES, getEngineById } from "@/lib/platformEngines";
export { REGISTRIES, getRegistryById } from "@/lib/globalRegistries";
export {
  AGENTS,
  SPARK_ORCHESTRATOR,
  routeAgents,
  buildBudPrompt,
  getEnabledAgents,
} from "@/lib/agentRegistry";

/**
 * AI_FOUNDATION — the locked manifest of the approved architecture.
 * Read-only reference; consumers should treat this as the source of truth.
 */
export const AI_FOUNDATION = {
  visibleAssistant: "Bud",
  invisibleCores: ["Oracle", "Spark", "Pulse"],
  hierarchy: "Oracle → Bud → Architect / Management / Operators → Platform Services",
  flow: "User → Bud → Oracle → Specialist Agent → Oracle → Bud → User",
  systems: [
    "Oracle Core",
    "Learning Studio",
    "Campus Central",
    "Community Circle",
    "Trust Shield",
    "The Architect",
  ],
  engines: [
    "Interaction", "Workflow", "Communication", "Component", "Configuration",
    "Integration", "Operations", "Intelligence", "Rendering", "Code Execution",
  ],
  registries: [
    "Country", "Knowledge Source", "Institution", "Organization", "Service",
    "Partner", "Connector", "User", "Verification",
  ],
  deployableAgents: 13,
  budIsSoleVisible: true,
};