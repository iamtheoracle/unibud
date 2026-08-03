import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Wifi, WifiOff, X, Zap, Radio, TrendingUp } from "lucide-react";
import { useRealtimeEngine } from "./useRealtimeChannel";

/**
 * RealtimeInspector — development-only panel showing live engine metrics.
 *
 * Shows: active channels, latency, reconnect status, event throughput,
 * dropped events, and subscription health.
 *
 * This component is NEVER shown in production. It renders only when
 * the URL contains ?debug=realtime or in development mode.
 */
export default function RealtimeInspector() {
  const [open, setOpen] = useState(false);
  const metrics = useRealtimeEngine();

  // Only render in development
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    // OK to render
  } else if (typeof window !== "undefined" && !window.location.search.includes("debug=realtime")) {
    return null;
  }

  const throughput = metrics.throughput;
  const health = metrics.isOnline && metrics.activeSubscriptions > 0 ? "healthy" : "degraded";

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-[9999] w-10 h-10 rounded-full glass-strong shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        title="Realtime Inspector"
      >
        <Activity className={`w-4 h-4 ${health === "healthy" ? "text-success" : "text-destructive"}`} strokeWidth={2.2} />
        {throughput > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success live-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-40 right-4 z-[9999] w-80 glass-strong rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" strokeWidth={2.2} />
                <span className="text-[13px] font-bold text-foreground">Realtime Engine</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {/* Connection status */}
              <div className="flex items-center gap-2">
                {metrics.isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-success" strokeWidth={2.2} />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-destructive" strokeWidth={2.2} />
                )}
                <span className="text-[11px] text-muted-foreground">
                  {metrics.isOnline ? "Connected" : "Offline — queueing events"}
                </span>
                {metrics.reconnectCount > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    Reconnects: {metrics.reconnectCount}
                  </span>
                )}
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-2">
                <MetricCard label="Subscriptions" value={metrics.activeSubscriptions} icon={Radio} />
                <MetricCard label="Total Events" value={metrics.totalEvents} icon={Zap} />
                <MetricCard label="Throughput" value={`${throughput}/s`} icon={TrendingUp} />
                <MetricCard label="Dropped" value={metrics.droppedEvents} icon={Activity} warning={metrics.droppedEvents > 0} />
                <MetricCard label="Batches" value={metrics.batchesFlushed} icon={Zap} />
                <MetricCard label="Integrations" value={metrics.integrationCount} icon={Radio} />
              </div>

              {/* Latency */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50">
                <span className="text-[11px] text-muted-foreground">Latency</span>
                <span className="text-[12px] font-bold text-foreground tabular-nums">
                  {metrics.lastLatency > 0 ? `${metrics.lastLatency}ms` : "—"}
                  {metrics.avgLatency > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-1">avg {metrics.avgLatency}ms</span>
                  )}
                </span>
              </div>

              {/* Offline queue */}
              {metrics.offlineQueueSize > 0 && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-warning/10">
                  <span className="text-[11px] text-warning-foreground">Offline Queue</span>
                  <span className="text-[12px] font-bold text-foreground tabular-nums">{metrics.offlineQueueSize}</span>
                </div>
              )}

              {/* Context */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50">
                <span className="text-[11px] text-muted-foreground">Active Context</span>
                <span className="text-[12px] font-bold text-primary capitalize">{metrics.contextId}</span>
              </div>

              {/* Subscribed entities */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subscribed Entities</span>
                <div className="flex flex-wrap gap-1">
                  {metrics.subscribedEntities.slice(0, 12).map((entity) => (
                    <span key={entity} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {entity}
                    </span>
                  ))}
                  {metrics.subscribedEntities.length > 12 && (
                    <span className="text-[9px] px-1.5 py-0.5 text-muted-foreground">
                      +{metrics.subscribedEntities.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MetricCard({ label, value, icon: Icon, warning }) {
  return (
    <div className={`px-3 py-2 rounded-xl ${warning ? "bg-destructive/10" : "bg-muted/50"}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className={`w-2.5 h-2.5 ${warning ? "text-destructive" : "text-muted-foreground"}`} strokeWidth={2.2} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <span className={`text-[14px] font-bold tabular-nums ${warning ? "text-destructive" : "text-foreground"}`}>{value}</span>
    </div>
  );
}