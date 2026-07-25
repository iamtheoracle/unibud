import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const PAUSE_KEY = "bud_memory_paused";

/**
 * useBudMemory — Bud's long-term memory engine (client core).
 * - Lists, deletes, exports, and pauses memory (privacy).
 * - observe(signal): passively derives ONE concise memory from behaviour via
 *   InvokeLLM and stores it. Throttled; no-ops when paused. Bud learns from
 *   behaviour, not interviews.
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
    try { await base44.entities.BudMemory.delete(id); } catch {}
  }, []);

  const clearAll = useCallback(async () => {
    setMemories([]);
    try { await base44.entities.BudMemory.deleteMany({}); } catch {}
  }, []);

  const exportMemory = useCallback(() => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bud-memory.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [memories]);

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
          "If the behaviour is not worth remembering, reply exactly 'SKIP'. Behaviour: " + signal.summary,
        response_json_schema: {
          type: "object",
          properties: {
            memory: { type: "string" },
            type: { type: "string", enum: ["preference", "learning_style", "favorite_subject", "goal", "conversation", "fact"] },
          },
        },
      });
      const memory = res?.memory || (typeof res === "string" ? res : "");
      if (!memory || memory.trim().toUpperCase() === "SKIP") return null;
      const type = res?.type || "fact";
      const rec = await base44.entities.BudMemory.create({
        memory_type: type,
        content: memory,
        source: signal.source || "passive",
      });
      setMemories((m) => [rec, ...m]);
      return rec;
    } catch {
      return null;
    }
  }, [paused]);

  return { memories, loading, paused, togglePause, remove, clearAll, exportMemory, observe, refresh: load };
}