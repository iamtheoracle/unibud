import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { store as storeMemory, forget as forgetMemory, clearAll as clearAllMemories, update as updateMemory, exportAll, retrieveRelevant, markAccessed, privacyGuard, scoreMemory } from "@/lib/bud/memoryBank";

const PAUSE_KEY = "bud_memory_paused";

/**
 * useBudMemory — Bud Memory Bank v1.0 hook.
 *
 * Provides full user control over their memory:
 *   - View memories (by category)
 *   - Edit / delete individual memories
 *   - Clear all memories
 *   - Disable memory entirely (pause)
 *   - Export memories
 *
 * Also exposes the retrieval pipeline for Bud's prompt injection and
 * a passive observer that derives memories from behaviour (privacy-guarded).
 */
export function useBudMemory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem(PAUSE_KEY) === "1"; } catch { return false; }
  });
  const lastObserve = useRef(0);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.BudMemory.list("-created_date", 100);
      setMemories(list || []);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const n = !p;
      try { localStorage.setItem(PAUSE_KEY, n ? "1" : "0"); } catch {}
      return n;
    });
  }, []);

  const remove = useCallback(async (id) => {
    setMemories((m) => m.filter((x) => x.id !== id));
    await forgetMemory(id);
  }, []);

  const clearAll = useCallback(async () => {
    setMemories([]);
    await clearAllMemories();
  }, []);

  const update = useCallback(async (id, changes) => {
    const result = await updateMemory(id, changes);
    if (result.success) {
      setMemories((m) => m.map((x) => (x.id === id ? { ...x, ...changes } : x)));
    }
    return result;
  }, []);

  const exportMemory = useCallback(async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bud-memory.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Retrieval pipeline — fetch relevant memories for a user message.
   * Returns a context block string for prompt injection.
   */
  const retrieve = useCallback(async (message, context = {}) => {
    if (paused) return { memories: [], scores: [], contextBlock: "" };
    const result = await retrieveRelevant(message, context);
    // Track usage
    if (result.memories.length > 0) {
      markAccessed(result.memories.map((m) => m.id));
    }
    return result;
  }, [paused]);

  /**
   * Passive observer — derives ONE concise memory from behaviour via InvokeLLM.
   * Privacy-guarded before storage. Throttled. No-ops when paused.
   */
  const observe = useCallback(async (signal) => {
    if (paused || !signal || !signal.summary) return null;
    const now = Date.now();
    if (now - lastObserve.current < 60000) return null;
    lastObserve.current = now;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are Bud, a calm university companion. From the student's recent behaviour, derive ONE concise memory " +
          "that will help you support them better. Use short second-person phrasing (e.g. 'Studies best at night'). " +
          "If the behaviour is not worth remembering, reply with memory = 'SKIP'. Behaviour: " + signal.summary,
        response_json_schema: {
          type: "object",
          properties: {
            memory: { type: "string" },
            category: { type: "string", enum: ["academic", "preferences", "campus", "career", "conversation"] },
            key: { type: "string" },
            reason: { type: "string" },
          },
        },
      });
      const memoryStr = res?.memory || (typeof res === "string" ? res : "");
      if (!memoryStr || memoryStr.trim().toUpperCase() === "SKIP") return null;

      const candidate = {
        key: res?.key || signal.key || "observed_behaviour",
        value: memoryStr,
        category: res?.category || signal.category || "conversation",
        source_type: "inferred",
        reason: res?.reason || `Derived from passive observation: ${signal.source || "behaviour"}`,
        sourceLabel: signal.source || "passive_observer",
      };

      const result = await storeMemory(candidate);
      if (result.success) {
        setMemories((m) => [result.memory, ...m]);
        return result.memory;
      }
      return null;
    } catch {
      return null;
    }
  }, [paused]);

  return { 
    memories, loading, paused, togglePause, 
    remove, clearAll, update, exportMemory, 
    retrieve, observe, 
    privacyGuard, scoreMemory,
    refresh: load 
  };
}