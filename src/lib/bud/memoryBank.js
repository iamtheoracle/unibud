/**
 * Bud Memory Bank v1.0 — Secure Personal Memory Engine
 * ─────────────────────────────────────────────────────────────────
 *
 * A privacy-first memory system that lets Bud remember only user-specific
 * information that improves future interactions.
 *
 * Core principles:
 *   - Privacy by default
 *   - User owns their memory
 *   - Memory is editable, explainable, and expirable
 *   - Internal system logic is NEVER stored as user memory
 *   - Every memory has a reason for existing
 *
 * Pipeline:
 *   User Message → Intent Detection → Memory Search → Relevance Filter
 *     → Context Builder → LLM Prompt
 *
 * Only relevant memories are injected into the prompt. Internal prompts,
 * routing decisions, agent configurations, and implementation details
 * remain runtime-only and are never persisted.
 */

import { base44 } from "@/api/base44Client";

// ─── Privacy Guard ──────────────────────────────────────────────

/**
 * Forbidden patterns — these must NEVER be stored as user memory.
 * Internal system logic stays runtime-only.
 */
const FORBIDDEN_PATTERNS = [
  /system\s*prompt/i,
  /routing\s*logic/i,
  /agent\s*config/i,
  /api\s*key/i,
  /auth\s*token/i,
  /password/i,
  /secret/i,
  /debug\s*log/i,
  /internal\s*execution/i,
  /implementation\s*detail/i,
  /developer\s*message/i,
  /hidden\s*instruction/i,
];

const FINANCIAL_PATTERN = /credit\s*card|cvv|pin\s*code|bank\s*account/i;

/**
 * Privacy Guard — evaluates whether a memory candidate should be persisted.
 *
 *   Should this be remembered?
 *     → Is it user-specific?
 *     → Will remembering improve future conversations?
 *     → Did the user provide or imply it?
 *     → Is it safe to store?
 *     → Save. Otherwise: Discard.
 *
 * @param {object} candidate — { key, value, category, source_type, reason }
 * @returns {{ allowed: boolean, reason: string }}
 */
export function privacyGuard(candidate) {
  if (!candidate || !candidate.key || !candidate.value) {
    return { allowed: false, reason: "Missing key or value" };
  }

  const valueStr = String(candidate.value);

  // Check forbidden patterns — internal system logic never gets stored
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(valueStr) || pattern.test(candidate.key)) {
      return { allowed: false, reason: "Contains forbidden internal/sensitive content" };
    }
  }

  // Never store payment details or credentials
  if (FINANCIAL_PATTERN.test(valueStr)) {
    return { allowed: false, reason: "Contains financial credentials" };
  }

  // Reason is mandatory — every memory must justify its existence
  if (!candidate.reason || candidate.reason.trim().length < 3) {
    return { allowed: false, reason: "No justification provided for storing this memory" };
  }

  return { allowed: true, reason: "Passed privacy guard" };
}

// ─── Memory Scoring ─────────────────────────────────────────────

/**
 * Scores a memory for relevance to a given query/context.
 *
 * Each memory receives:
 *   - Relevance: keyword overlap between query and memory key/value
 *   - Confidence: stored confidence score
 *   - Freshness: how recently the memory was created/accessed
 *   - Usage frequency: how often it's been retrieved
 *
 * Final Score = weighted combination (default: 0.5 relevance, 0.25 confidence,
 * 0.15 freshness, 0.1 usage)
 */
export function scoreMemory(memory, query = "", weights = {}) {
  const w = { relevance: 0.5, confidence: 0.25, freshness: 0.15, usage: 0.1, ...weights };

  // Relevance — keyword overlap
  const queryWords = query.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const memoryText = `${memory.key || ""} ${memory.value || ""} ${memory.reason || ""}`.toLowerCase();
  let relevance = 0;
  if (queryWords.length > 0) {
    const matches = queryWords.filter((word) => memoryText.includes(word)).length;
    relevance = Math.min(matches / queryWords.length, 1);
  }

  // Confidence — stored value
  const confidence = typeof memory.confidence === "number" ? memory.confidence : memory.importance || 0.5;

  // Freshness — decay over 30 days
  const created = memory.created_date ? new Date(memory.created_date) : new Date();
  const daysSince = Math.max(0, (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  const freshness = Math.max(0, 1 - daysSince / 30);

  // Usage frequency — normalized to 10 uses
  const usage = Math.min((memory.usage_count || 0) / 10, 1);

  const finalScore = (relevance * w.relevance) + (confidence * w.confidence) + (freshness * w.freshness) + (usage * w.usage);

  return {
    relevance: Math.round(relevance * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    freshness: Math.round(freshness * 100) / 100,
    usage: Math.round(usage * 100) / 100,
    final: Math.round(finalScore * 100) / 100,
  };
}

// ─── Retrieval Pipeline ──────────────────────────────────────────

const RETRIEVAL_THRESHOLD = 0.15;
const MAX_MEMORIES_IN_PROMPT = 8;

/**
 * Retrieval Pipeline — fetches relevant memories for a user message.
 *
 *   User Message → Intent Detection → Memory Search → Relevance Filter
 *     → Context Builder → LLM Prompt
 *
 * Only memories scoring above RETRIEVAL_THRESHOLD are returned, capped
 * at MAX_MEMORIES_IN_PROMPT to keep prompts focused.
 *
 * @param {string} message — the user's message
 * @param {object} context — { category? } optional filters
 * @returns {Promise<{ memories: array, scores: array, contextBlock: string }>}
 */
export async function retrieveRelevant(message, context = {}) {
  try {
    let memories = await base44.entities.BudMemory.list("-created_date", 50);

    // Filter by category if specified
    if (context.category) {
      memories = memories.filter((m) => m.category === context.category);
    }

    // Filter out expired memories
    const now = Date.now();
    memories = memories.filter((m) => {
      if (!m.expires_at) return true;
      return new Date(m.expires_at).getTime() > now;
    });

    // Score each memory
    const scored = memories.map((m) => ({
      memory: m,
      scores: scoreMemory(m, message),
    }));

    // Filter by threshold and sort by final score
    const relevant = scored
      .filter((s) => s.scores.final >= RETRIEVAL_THRESHOLD)
      .sort((a, b) => b.scores.final - a.scores.final)
      .slice(0, MAX_MEMORIES_IN_PROMPT);

    // Build context block for prompt injection
    const contextBlock = relevant.length > 0
      ? "Known preferences and context about this student:\n" +
        relevant.map((s) => {
          const m = s.memory;
          return `- ${m.key || m.category}: ${m.value} (confidence ${(s.scores.confidence * 100).toFixed(0)}%)`;
        }).join("\n")
      : "";

    return {
      memories: relevant.map((s) => s.memory),
      scores: relevant.map((s) => s.scores),
      contextBlock,
    };
  } catch {
    return { memories: [], scores: [], contextBlock: "" };
  }
}

/**
 * Increment usage count and update last_accessed_at for retrieved memories.
 * Called after memories are injected into a prompt.
 */
export async function markAccessed(memoryIds) {
  if (!memoryIds || memoryIds.length === 0) return;
  const now = new Date().toISOString();
  const updates = memoryIds.map((id) =>
    base44.entities.BudMemory.update(id, {
      last_accessed_at: now,
    }).catch(() => {})
  );
  await Promise.allSettled(updates);
}

// ─── Store / Forget Operations ───────────────────────────────────

/**
 * Store a new memory after passing the privacy guard.
 *
 * @param {object} candidate — { key, value, category, source_type, reason, confidence?, expiresAt? }
 * @returns {Promise<{ success: boolean, memory?: object, reason: string }>}
 */
export async function store(candidate) {
  const guard = privacyGuard(candidate);
  if (!guard.allowed) {
    return { success: false, reason: guard.reason };
  }

  try {
    const confidence = candidate.confidence ?? 0.7;
    const valueStr = typeof candidate.value === "string" ? candidate.value : JSON.stringify(candidate.value);
    const record = await base44.entities.BudMemory.create({
      category: candidate.category || "conversation",
      key: candidate.key,
      value: valueStr,
      confidence,
      source_type: candidate.source_type || "inferred",
      reason: candidate.reason,
      expires_at: candidate.expiresAt || null,
      // Backward-compatible fields
      content: valueStr,
      memory_type: candidate.legacyType || mapCategoryToLegacyType(candidate.category),
      source: candidate.sourceLabel || "memory_bank",
      importance: confidence,
    });
    return { success: true, memory: record, reason: "Stored successfully" };
  } catch (err) {
    return { success: false, reason: `Storage failed: ${err.message || "unknown error"}` };
  }
}

function mapCategoryToLegacyType(category) {
  const map = {
    academic: "fact",
    preferences: "preference",
    campus: "fact",
    career: "goal",
    conversation: "conversation",
  };
  return map[category] || "fact";
}

/**
 * Forget a single memory by id.
 */
export async function forget(id) {
  try {
    await base44.entities.BudMemory.delete(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all memories for the current user.
 */
export async function clearAll() {
  try {
    await base44.entities.BudMemory.deleteMany({});
    return true;
  } catch {
    return false;
  }
}

/**
 * Update an existing memory (user edits their own memory).
 */
export async function update(id, changes) {
  // Re-run privacy guard if value is being changed
  if (changes.value !== undefined) {
    const guard = privacyGuard({ key: "edit", value: changes.value, reason: "user edit" });
    if (!guard.allowed) {
      return { success: false, reason: guard.reason };
    }
    changes.content = changes.value; // keep legacy field in sync
  }
  if (changes.confidence !== undefined) {
    changes.importance = changes.confidence;
  }
  try {
    const updated = await base44.entities.BudMemory.update(id, changes);
    return { success: true, memory: updated };
  } catch (err) {
    return { success: false, reason: err.message || "Update failed" };
  }
}

/**
 * Export all memories as JSON (user data portability).
 */
export async function exportAll() {
  try {
    const memories = await base44.entities.BudMemory.list("-created_date", 500);
    return memories.map((m) => ({
      id: m.id,
      category: m.category,
      key: m.key,
      value: m.value,
      confidence: m.confidence,
      source_type: m.source_type,
      reason: m.reason,
      created_at: m.created_date,
      updated_at: m.updated_date,
      expires_at: m.expires_at,
      usage_count: m.usage_count,
    }));
  } catch {
    return [];
  }
}

// ─── Memory Categories ───────────────────────────────────────────

export const MEMORY_CATEGORIES = [
  { id: "academic", label: "Academic", description: "University, faculty, courses, GPA, study habits, academic goals" },
  { id: "preferences", label: "Preferences", description: "Dark mode, language, response style, notification preferences" },
  { id: "campus", label: "Campus", description: "Student ID, campus, clubs, timetable, study locations" },
  { id: "career", label: "Career", description: "Career goals, research interests, internship preferences" },
  { id: "conversation", label: "Conversation", description: "Long-term useful facts from conversations" },
];