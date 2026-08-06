import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  CONTEXTS,
  DEFAULT_CONTEXT,
  CONTEXT_MODULE_PRIORITY,
  getModulePriority,
} from "@/lib/os/manifest";

/**
 * ContextProvider — manages the OS context (Academic / Social / Hybrid).
 *
 * Per the OS Constitution:
 *   "Context changes priority, never architecture.
 *    The navigation remains the same."
 *
 * This provider does NOT change routes or navigation. It only adjusts
 * module priority within workspaces, enabling experiences to reprioritize
 * their content based on the active context.
 */

const ContextContext = createContext(null);

const STORAGE_KEY = "unibud:os-context";

function detectDefaultContext() {
  // Check localStorage for a user preference
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && CONTEXTS[stored]) return stored;
  }
  return DEFAULT_CONTEXT;
}

export function ContextProvider({ children }) {
  const [contextId, setContextId] = useState(detectDefaultContext);

  // Persist context preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, contextId);
    }
  }, [contextId]);

  const value = useMemo(() => {
    const context = CONTEXTS[contextId] || CONTEXTS[DEFAULT_CONTEXT];

    /**
     * Get the priority tier (high/medium/low) for a module within an experience.
     * Returns "medium" as default if no priority is defined.
     */
    function getPriority(experienceId, moduleId) {
      const priorities = getModulePriority(experienceId, contextId);
      if (!priorities) return "medium";
      if (priorities.high?.includes(moduleId)) return "high";
      if (priorities.medium?.includes(moduleId)) return "medium";
      if (priorities.low?.includes(moduleId)) return "low";
      return "medium";
    }

    /**
     * Sort modules by priority for an experience.
     * High first, then medium, then low. Stable sort preserves original order within tiers.
     */
    function sortByPriority(experienceId, modules) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...modules].sort((a, b) => {
        const pa = getPriority(experienceId, a.id || a);
        const pb = getPriority(experienceId, b.id || b);
        return (priorityOrder[pa] ?? 1) - (priorityOrder[pb] ?? 1);
      });
    }

    /**
     * Filter modules to only those at or above a given priority threshold.
     * Never excludes entirely — low-priority modules remain accessible.
     */
    function filterByPriority(experienceId, modules, minPriority = "low") {
      const thresholds = { high: 0, medium: 1, low: 2 };
      const threshold = thresholds[minPriority] ?? 2;
      return modules.filter((m) => {
        const p = getPriority(experienceId, m.id || m);
        return (thresholds[p] ?? 1) <= threshold;
      });
    }

    return {
      contextId,
      context,
      setContext: setContextId,
      isAcademic: contextId === "academic",
      isSocial: contextId === "social",
      isHybrid: contextId === "hybrid",
      getPriority,
      sortByPriority,
      filterByPriority,
      availableContexts: Object.values(CONTEXTS),
    };
  }, [contextId]);

  return (
    <ContextContext.Provider value={value}>{children}</ContextContext.Provider>
  );
}

export function useContextSystem() {
  const ctx = useContext(ContextContext);
  if (!ctx) {
    throw new Error("useContextSystem must be used within a ContextProvider");
  }
  return ctx;
}

export default ContextProvider;