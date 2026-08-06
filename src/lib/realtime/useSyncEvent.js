import { useEffect, useRef } from "react";
import { eventBus } from "@/lib/runtime/eventBus";

/**
 * useSyncEvent — subscribe to real-time entity change events.
 *
 * Pass a single entity name or an array. The callback fires whenever any
 * of those entities change anywhere in UNIBUD (create / update / delete),
 * after the sync engine has invalidated caches and emitted the bus event.
 *
 * @param {string|string[]} entityNames
 * @param {(payload: { entity: string, entities: string[], domains: string[] }) => void} callback
 *
 * @example
 * // Re-run a custom calculation when assignments or exams change
 * useSyncEvent(["Assignment", "Exam"], () => {
 *   recalculatePriorityScore();
 * });
 */
export function useSyncEvent(entityNames, callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const names = Array.isArray(entityNames) ? entityNames : [entityNames];

  useEffect(() => {
    const unsubGeneral = eventBus.on("entity:sync", (event) => {
      const payload = event.payload || {};
      const changed = payload.entities || [];
      const hasMatch = names.some((n) => changed.includes(n));
      if (hasMatch) {
        cbRef.current({
          entity: changed[0],
          entities: changed,
          domains: payload.domains || [],
        });
      }
    });

    const unsubSpecifics = names.map((n) =>
      eventBus.on(`entity:${n}:changed`, (event) => {
        cbRef.current({
          entity: n,
          entities: [n],
          domains: [],
        });
      })
    );

    return () => {
      if (typeof unsubGeneral === "function") unsubGeneral();
      unsubSpecifics.forEach((u) => { if (typeof u === "function") u(); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join(",")]);
}

/**
 * useAnySyncEvent — fires on ANY entity change in the system.
 * Useful for "something changed" indicators or global refresh buttons.
 */
export function useAnySyncEvent(callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    return eventBus.on("entity:sync", (event) => {
      cbRef.current(event.payload || {});
    });
  }, []);
}