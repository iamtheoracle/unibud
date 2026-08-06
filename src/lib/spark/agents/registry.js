// Spark Agent Registry — runtime source of truth.
// Reads the SparkAgent entity (admin-editable, no code changes) and falls
// back to the code-level definitions if the entity is empty/unavailable.
// This keeps orchestration resilient while remaining configuration-driven.

import { base44 } from "@/api/base44Client";
import { SPARK_AGENT_DEFINITIONS, SPARK_DIVISIONS, agentById } from "./definitions";

let cache = null;
let cacheAt = 0;
const TTL = 30_000; // refresh registry every 30s

export { SPARK_DIVISIONS, agentById };

/**
 * Load the active agent registry. Merges entity overrides (enabled flags,
// renames, additions, removals) over the code-level defaults.
 */
export async function loadAgentRegistry({ force = false } = {}) {
  if (cache && !force && Date.now() - cacheAt < TTL) return cache;
  let records = [];
  try {
    records = await base44.entities.SparkAgent.list("-order", 100);
  } catch {
    records = [];
  }
  if (!records || records.length === 0) {
    cache = SPARK_AGENT_DEFINITIONS.map((a) => ({ ...a, _source: "default" }));
    cacheAt = Date.now();
    return cache;
  }
  // Entity is source of truth; map records to the same shape as definitions.
  cache = records
    .filter((r) => r && r.agent_id)
    .map((r) => ({
      agent_id: r.agent_id,
      name: r.name,
      division: r.division,
      role: r.role,
      responsibilities: r.responsibilities || [],
      tools: r.tools || [],
      context_scope: r.context_scope || "platform",
      memory_scope: r.memory_scope || "own domain only",
      permissions: r.permissions || [],
      input_schema: r.input_schema || {},
      output_schema: r.output_schema || {},
      validation_rules: r.validation_rules || [],
      success_criteria: r.success_criteria || [],
      failure_handling: r.failure_handling || "Return to Spark",
      retry_max: typeof r.retry_max === "number" ? r.retry_max : 2,
      handoff_rules: r.handoff_rules || "Return to Spark",
      dependencies: r.dependencies || [],
      integration_rules: r.integration_rules || [],
      focus: r.focus || r.role || "",
      enabled: r.enabled !== false,
      order: r.order || 0,
      _id: r.id,
      _source: "entity",
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  cacheAt = Date.now();
  return cache;
}

/** Only enabled agents, keyed by agent_id. */
export async function loadActiveAgents() {
  const all = await loadAgentRegistry();
  return all.filter((a) => a.enabled);
}

export async function getAgent(id) {
  const all = await loadAgentRegistry();
  return all.find((a) => a.agent_id === id);
}

// ── Admin mutations (RLS: admin-only on the entity) ──
export async function setAgentEnabled(id, enabled) {
  const all = await loadAgentRegistry({ force: true });
  const rec = all.find((a) => a.agent_id === id);
  if (!rec || !rec._id) return;
  await base44.entities.SparkAgent.update(rec._id, { enabled });
  cache = null;
}

export async function updateAgent(id, patch) {
  const all = await loadAgentRegistry({ force: true });
  const rec = all.find((a) => a.agent_id === id);
  if (!rec || !rec._id) return;
  await base44.entities.SparkAgent.update(rec._id, patch);
  cache = null;
}

export async function addAgent(data) {
  await base44.entities.SparkAgent.create(data);
  cache = null;
}

export async function removeAgent(id) {
  const all = await loadAgentRegistry({ force: true });
  const rec = all.find((a) => a.agent_id === id);
  if (!rec || !rec._id) return;
  await base44.entities.SparkAgent.delete(rec._id);
  cache = null;
}

/** Seed the SparkAgent entity from code defaults if it is empty. */
export async function ensureSeeded() {
  try {
    const existing = await base44.entities.SparkAgent.list("-order", 100);
    if (existing && existing.length > 0) return;
    const records = SPARK_AGENT_DEFINITIONS.map((a) => {
      const { _source, ...rest } = a;
      return rest;
    });
    await base44.entities.SparkAgent.bulkCreate(records);
    cache = null;
  } catch {
    /* entity may not be writable for non-admins; defaults will be used */
  }
}