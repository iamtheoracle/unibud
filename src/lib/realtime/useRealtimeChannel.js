import { useEffect, useRef, useState } from "react";
import { realtimeEngine } from "./engine";

/**
 * useRealtimeChannel — subscribe to realtime engine metrics and state.
 *
 * This hook is for components that need to react to engine state changes
 * (e.g., the Realtime Inspector, connection status indicators).
 *
 * For entity-specific sync events, use useSyncEvent from ./useSyncEvent instead.
 *
 * @returns {Object} Engine metrics, refreshed whenever the engine state changes.
 */
export function useRealtimeEngine() {
  const [metrics, setMetrics] = useState(realtimeEngine.getMetrics());

  useEffect(() => {
    const unsub = realtimeEngine.addListener((newMetrics) => {
      setMetrics(newMetrics);
    });
    return unsub;
  }, []);

  return metrics;
}

/**
 * useRealtimeStatus — lightweight hook returning just connection status.
 * Useful for offline indicators in the UI.
 */
export function useRealtimeStatus() {
  const metrics = useRealtimeEngine();
  return {
    isOnline: metrics.isOnline,
    activeSubscriptions: metrics.activeSubscriptions,
    reconnectCount: metrics.reconnectCount,
  };
}