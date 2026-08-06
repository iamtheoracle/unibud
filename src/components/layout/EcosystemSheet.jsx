import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, WifiOff, Wifi, RefreshCw, Zap, Type } from "lucide-react";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { queryClientInstance } from "@/lib/query-client";

const TITLES = {
  weather: "Weather",
  accessibility: "Accessibility",
  offline: "Offline Mode",
  sync: "Synchronization",
};

/**
 * EcosystemSheet — a bottom sheet for the cross-cutting services that don't
 * own a full route (Weather, Accessibility, Offline, Sync), keeping them
 * reachable from any screen without leaving context.
 */
export default function EcosystemSheet({ tab, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="relative w-full max-w-[520px] mx-auto glass-strong rounded-t-[28px] p-5 pb-8 max-h-[82vh] overflow-y-auto no-scrollbar safe-area-pb"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-[16px] text-foreground">{TITLES[tab]}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center spring-tap" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        {tab === "weather" && <WeatherWidget />}
        {tab === "accessibility" && <AccessibilityPanel />}
        {tab === "offline" && <OfflinePanel />}
        {tab === "sync" && <SyncPanel />}
      </motion.div>
    </motion.div>
  );
}

function ToggleRow({ icon: Icon, label, desc, on, onToggle }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-muted/40 text-left spring-tap">
      <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <span className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function AccessibilityPanel() {
  const [reduceMotion, setReduceMotion] = useState(() => document.documentElement.classList.contains("reduce-motion"));
  const [largeText, setLargeText] = useState(() => document.documentElement.classList.contains("ux-large-text"));

  const toggleMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    document.documentElement.classList.toggle("reduce-motion", next);
    try { localStorage.setItem("ux_reduce_motion", next ? "1" : "0"); } catch {}
  };
  const toggleText = () => {
    const next = !largeText;
    setLargeText(next);
    document.documentElement.classList.toggle("ux-large-text", next);
    try { localStorage.setItem("ux_large_text", next ? "1" : "0"); } catch {}
  };

  return (
    <div className="space-y-2.5">
      <ToggleRow icon={Zap} label="Reduce Motion" desc="Pause breathing, glows, and pulsing animations." on={reduceMotion} onToggle={toggleMotion} />
      <ToggleRow icon={Type} label="Larger Text" desc="Scale up everything for easier reading." on={largeText} onToggle={toggleText} />
    </div>
  );
}

function OfflinePanel() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [offlineMode, setOfflineMode] = useState(() => {
    try { return localStorage.getItem("ux_offline_mode") === "1"; } catch { return false; }
  });

  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => {
      window.removeEventListener("online", u);
      window.removeEventListener("offline", u);
    };
  }, []);

  const toggle = () => {
    const n = !offlineMode;
    setOfflineMode(n);
    try { localStorage.setItem("ux_offline_mode", n ? "1" : "0"); } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
        {online ? <Wifi className="w-5 h-5 text-success" /> : <WifiOff className="w-5 h-5 text-destructive" />}
        <div>
          <p className="text-[13px] font-semibold text-foreground">{online ? "You're online" : "You're offline"}</p>
          <p className="text-[11px] text-muted-foreground">{online ? "Live data is syncing across the app." : "Showing cached content. Changes will sync when reconnected."}</p>
        </div>
      </div>
      <ToggleRow icon={WifiOff} label="Offline Mode" desc="Pause live syncs and work from cached data." on={offlineMode} onToggle={toggle} />
    </div>
  );
}

function SyncPanel() {
  const [lastSync, setLastSync] = useState(() => {
    try { return localStorage.getItem("ux_last_sync") || ""; } catch { return ""; }
  });
  const [syncing, setSyncing] = useState(false);

  const syncNow = async () => {
    setSyncing(true);
    try { await queryClientInstance.invalidateQueries(); } catch {}
    const t = new Date().toISOString();
    setLastSync(t);
    try { localStorage.setItem("ux_last_sync", t); } catch {}
    setSyncing(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        Refresh all your data — feed, messages, calendar, finances, and academic records — so everything stays current.
      </p>
      <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40">
        <div>
          <p className="text-[12px] text-muted-foreground">Last synced</p>
          <p className="text-[13px] font-semibold text-foreground">{lastSync ? new Date(lastSync).toLocaleString() : "Never"}</p>
        </div>
        <button
          onClick={syncNow}
          disabled={syncing}
          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] font-semibold spring-tap flex items-center gap-1.5 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync now"}
        </button>
      </div>
    </div>
  );
}