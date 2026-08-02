import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, BellOff, Bell, GripVertical, RefreshCw,
  Building2, Users, Globe, Music, Video, Newspaper, Calendar, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * FeedSourceControls — quiet settings for the unified UNIBUD feed.
 * Students can enable/disable, mute, reorder, and manually refresh sources.
 * Preferences persist to the FeedSourcePreference entity (per-student via RLS).
 */

const SOURCES = [
  { id: "campus", label: "Campus", icon: Building2 },
  { id: "friends", label: "Friends", icon: Users },
  { id: "communities", label: "Communities", icon: Users },
  { id: "following", label: "Following", icon: Globe },
  { id: "music", label: "Music", icon: Music },
  { id: "videos", label: "Videos", icon: Video },
  { id: "news", label: "News", icon: Newspaper },
  { id: "events", label: "Events", icon: Calendar },
  { id: "bud_recommendations", label: "Bud Recommendations", icon: Sparkles },
];

export default function FeedSourceControls() {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(null);
  const { toast } = useToast();

  const loadPrefs = useCallback(async () => {
    try {
      const res = await base44.entities.FeedSourcePreference.list();
      const map = {};
      (res || []).forEach((p) => { map[p.source] = p; });
      // Fill defaults for missing sources
      SOURCES.forEach((s, i) => {
        if (!map[s.id]) {
          map[s.id] = { source: s.id, enabled: true, muted: false, sort_order: i, auto_sync: true };
        }
      });
      setPrefs(map);
    } catch {
      // Fallback to localStorage if entity not available
      try {
        const stored = JSON.parse(localStorage.getItem("unibud_feed_prefs") || "{}");
        const map = {};
        SOURCES.forEach((s, i) => {
          map[s.id] = stored[s.id] || { source: s.id, enabled: true, muted: false, sort_order: i, auto_sync: true };
        });
        setPrefs(map);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const savePref = async (sourceId, updates) => {
    const current = prefs[sourceId];
    if (!current) return;
    const updated = { ...current, ...updates };
    setPrefs((p) => ({ ...p, [sourceId]: updated }));
    try {
      if (current.id) {
        await base44.entities.FeedSourcePreference.update(current.id, updates);
      } else {
        const created = await base44.entities.FeedSourcePreference.create({
          source: sourceId,
          enabled: updated.enabled,
          muted: updated.muted,
          sort_order: updated.sort_order,
          auto_sync: updated.auto_sync,
        });
        setPrefs((p) => ({ ...p, [sourceId]: { ...updated, id: created.id } }));
      }
    } catch {
      try { localStorage.setItem("unibud_feed_prefs", JSON.stringify(prefs)); } catch {}
    }
  };

  const toggleEnabled = (sourceId) => {
    const current = prefs[sourceId];
    savePref(sourceId, { enabled: !current.enabled });
  };

  const toggleMuted = (sourceId) => {
    const current = prefs[sourceId];
    savePref(sourceId, { muted: !current.muted });
  };

  const toggleAutoSync = (sourceId) => {
    const current = prefs[sourceId];
    savePref(sourceId, { auto_sync: !current.auto_sync });
  };

  const handleRefresh = async (sourceId) => {
    setRefreshing(sourceId);
    await savePref(sourceId, { last_synced_at: new Date().toISOString() });
    setTimeout(() => {
      setRefreshing(null);
      toast({ title: "Source refreshed" });
    }, 800);
  };

  const moveSource = (sourceId, direction) => {
    const sorted = [...SOURCES].sort((a, b) => (prefs[a.id]?.sort_order ?? 0) - (prefs[b.id]?.sort_order ?? 0));
    const idx = sorted.findIndex((s) => s.id === sourceId);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[targetIdx];
    const aOrder = prefs[a.id]?.sort_order ?? idx;
    const bOrder = prefs[b.id]?.sort_order ?? targetIdx;
    savePref(a.id, { sort_order: bOrder });
    savePref(b.id, { sort_order: aOrder });
  };

  const sortedSources = [...SOURCES].sort((a, b) => (prefs[a.id]?.sort_order ?? 0) - (prefs[b.id]?.sort_order ?? 0));

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-[14px] bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Feed Sources</span>
        <span className="text-[10px] text-muted-foreground">Tap to toggle · drag to reorder</span>
      </div>
      <div className="rounded-[16px] bg-card overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
        {sortedSources.map((source, idx) => {
          const pref = prefs[source.id] || { enabled: true, muted: false, auto_sync: true };
          const Icon = source.icon;
          const isLast = idx === sortedSources.length - 1;
          return (
            <div key={source.id} className={isLast ? "" : "border-b border-border/30"}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                {/* Drag handle + reorder */}
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveSource(source.id, -1)}
                    disabled={idx === 0}
                    className="text-muted-foreground/50 disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    <GripVertical className="w-3.5 h-3.5 rotate-180" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => moveSource(source.id, 1)}
                    disabled={isLast}
                    className="text-muted-foreground/50 disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    <GripVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Source icon — monochrome */}
                <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0 ${pref.enabled ? "bg-muted/50" : "bg-muted/30 opacity-50"}`}>
                  <Icon className="w-3.5 h-3.5 text-foreground" strokeWidth={1.6} />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-semibold ${pref.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                    {source.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {pref.muted ? "Muted" : pref.auto_sync ? "Auto-sync" : "Manual"}
                  </p>
                </div>

                {/* Mute toggle */}
                <button
                  onClick={() => toggleMuted(source.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform ${pref.muted ? "bg-muted/50" : "hover:bg-muted/30"}`}
                  aria-label={pref.muted ? "Unmute" : "Mute"}
                >
                  {pref.muted ? <BellOff className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} /> : <Bell className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />}
                </button>

                {/* Refresh */}
                <button
                  onClick={() => handleRefresh(source.id)}
                  disabled={refreshing === source.id}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/30 active:scale-90 transition-transform"
                  aria-label="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${refreshing === source.id ? "animate-spin" : ""}`} strokeWidth={1.6} />
                </button>

                {/* Enable/disable toggle */}
                <button
                  onClick={() => toggleEnabled(source.id)}
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0 ${pref.enabled ? "bg-primary justify-end" : "bg-muted justify-start"}`}
                  aria-label={pref.enabled ? "Disable" : "Enable"}
                >
                  <motion.div layout className="w-4 h-4 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-sync global toggle */}
      <button
        onClick={() => {
          const allOn = sortedSources.every((s) => prefs[s.id]?.auto_sync);
          sortedSources.forEach((s) => savePref(s.id, { auto_sync: !allOn }));
        }}
        className="w-full mt-3 flex items-center justify-center gap-2 h-9 rounded-[12px] bg-muted/30 text-[11px] font-semibold text-muted-foreground active:scale-[0.98] transition-transform"
      >
        <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.6} />
        Toggle auto-sync for all
      </button>
    </div>
  );
}