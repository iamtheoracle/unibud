/**
 * UNIBUD Super Agent
 *
 * One visible AI (Bud) with internal cognitive specialists:
 *   • Spark  — Creativity & Design
 *   • Oracle — Reasoning & Research
 *   • Orbit  — Execution & Automation
 *
 * Bud owns the conversation. Bud owns the memory. Bud owns the personality.
 * Specialists are cognitive lenses — they shape thinking, never the voice.
 *
 * Architecture:
 *   Surface Layer    → Bud (always responds)
 *   Cognitive Layer  → Spark, Oracle, Orbit (internal routing)
 *   Execution Layer  → LLM, APIs, Database, Notifications, Calendar
 *   Memory Layer     → Shared BudMemory (one store, no duplicates)
 *
 * Usage:
 *   import { processSuperAgent } from "@/lib/bud/superAgent";
 *   const result = await processSuperAgent({ message, userId, mode, ... });
 */

export { processSuperAgent, getSpecialistInfo } from "./orchestrator";
export { routeMessage, getStatusMessage } from "./router";
export { SPECIALISTS, SPECIALIST_IDS, buildSpecialistLens, isDestructiveAction } from "./personas";