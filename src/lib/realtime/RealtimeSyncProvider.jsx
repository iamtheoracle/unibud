import React, { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { eventBus } from "@/lib/runtime/eventBus";
import { SYNC_REGISTRY } from "./entitySyncRegistry";

/**
 * RealtimeSyncProvider
 *
 * Subscribes to all major UNIBUD entities via the Base44 realtime WebSocket
 * layer. When any entity changes (create / update / delete), the provider:
 *
 *  1. Debounces rapid changes (400ms) to avoid cascading refetches
 *  2. Invalidates all React Query caches matching the entity's registered
 *     query prefixes — causing every component, widget, dashboard, feed,
 *     and search result displaying that data to refetch automatically
 *  3. Emits a cross-domain sync event on the event bus so non-Query
 *     consumers (Bud orb, notification badges, presence indicators) can
 *     react in real time
 *
 * No component needs to manually refresh — changes propagate instantly
 * across Bud, Academics, Social, Connect, Me, notifications, calendars,
 * widgets, dashboards, and search.
 */
const FLUSH_MS = 400;

export default function RealtimeSyncProvider({ children }) {
  const queryClient = useQueryClient();
  const pendingChanges = useRef(new Map()); // entityName → Set of event types
  const flushTimer = useRef(null);

  useEffect(() => {
    const flush = () => {
      const changes = Array.from(pendingChanges.current.entries());
      pendingChanges.current.clear();
      if (changes.length === 0) return;

      const prefixesToInvalidate = new Set();
      const domainsAffected = new Set();
      const entityNames = [];

      for (const [entityName, eventTypes] of changes) {
        const config = SYNC_REGISTRY[entityName];
        entityNames.push(entityName);
        if (!config) continue;

        config.prefixes.forEach((p) => prefixesToInvalidate.add(p));
        config.domains.forEach((d) => domainsAffected.add(d));
      }

      // If Notification changed, always invalidate global badge queries
      if (entityNames.includes("Notification")) {
        prefixesToInvalidate.add("notifications");
        prefixesToInvalidate.add("unread");
        prefixesToInvalidate.add("notification-center");
      }

      // Invalidate all affected query prefixes (prefix matching)
      for (const prefix of prefixesToInvalidate) {
        queryClient.invalidateQueries({ queryKey: [prefix] });
      }

      // Emit a general sync event on the bus
      eventBus.publish({
        type: "entity:sync",
        category: "lifecycle",
        payload: {
          entities: entityNames,
          domains: Array.from(domainsAffected),
          timestamp: new Date().toISOString(),
        },
      });

      // Emit per-entity events for targeted listeners
      for (const entityName of entityNames) {
        eventBus.publish({
          type: `entity:${entityName}:changed`,
          category: "lifecycle",
          payload: { entity: entityName, timestamp: new Date().toISOString() },
        });
      }
    };

    const scheduleFlush = () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, FLUSH_MS);
    };

    const handleChange = (entityName, event) => {
      if (!event || !event.type) return;
      if (!pendingChanges.current.has(entityName)) {
        pendingChanges.current.set(entityName, new Set());
      }
      pendingChanges.current.get(entityName).add(event.type);
      scheduleFlush();
    };

    const subscriptions = [];

    for (const entityName of Object.keys(SYNC_REGISTRY)) {
      try {
        const entityApi = base44.entities?.[entityName];
        if (!entityApi || typeof entityApi.subscribe !== "function") continue;
        const unsub = entityApi.subscribe((event) => handleChange(entityName, event));
        if (typeof unsub === "function") subscriptions.push(unsub);
      } catch {
        // Entity not available or subscription failed — skip silently
      }
    }

    // Also listen to auth state changes to refetch user-dependent queries
    const onAuthSync = () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    const unsubAuthSync = eventBus.on("auth:state:changed", onAuthSync);

    return () => {
      subscriptions.forEach((unsub) => { try { unsub(); } catch {} });
      if (typeof unsubAuthSync === "function") unsubAuthSync();
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [queryClient]);

  return <>{children}</>;
}