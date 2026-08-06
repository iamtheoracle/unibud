import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { realtimeEngine } from "./engine";
// Side-effect import: registers Spark, Orbit, Bud integration hooks
import "./integrations";
import RealtimeInspector from "./RealtimeInspector";

/**
 * RealtimeSyncProvider — the React entry point for the Realtime Engine.
 *
 * Per the OS Constitution, this is the ONLY component that initializes
 * realtime subscriptions. The engine owns all subscriptions, reconnect
 * logic, synchronization, and cache invalidation.
 *
 * Flow: Database → Realtime Engine → Store (React Query) → Workspace → UI
 *
 * No page, module, or component may subscribe directly to any provider.
 */
export default function RealtimeSyncProvider({ children }) {
  const queryClient = useQueryClient();

  // Initialize the engine once
  useEffect(() => {
    realtimeEngine.init({ queryClient });
    return () => {
      // Engine is a singleton — don't destroy on unmount in dev (HMR)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  return (
    <>
      {children}
      <RealtimeInspector />
    </>
  );
}