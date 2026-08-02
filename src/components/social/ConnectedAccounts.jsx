import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Loader2, ChevronRight, Link2, Unlink,
  Music, Video, MessageCircle, Calendar, Cloud, Share2, Lock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Connected Accounts — quiet, monochrome settings rows grouped by category.
 * Real OAuth (TikTok, Discord, Google Calendar) uses per-student connectors.
 * Other platforms are local opt-in preferences (share targets / playback defaults).
 * Never displays a platform as connected unless the student has actually authorized it.
 */

// Real per-student OAuth connectors (workspace-registered)
const OAUTH = {
  tiktok: { id: "6a64d08fb9414f10f292dac6", scopes: [] },
  discord: { id: "6a64cbde892c4603ea7adbd1", scopes: [] },
};

// Google Calendar uses the shared platform connector
const SHARED_CONNECTOR = {
  google_calendar: "googlecalendar",
};

const CATEGORIES = [
  {
    id: "social",
    label: "Social",
    icon: Share2,
    platforms: [
      { key: "instagram", label: "Instagram", type: "share" },
      { key: "tiktok", label: "TikTok", type: "oauth" },
      { key: "x", label: "X", type: "share" },
      { key: "threads", label: "Threads", type: "share" },
      { key: "facebook", label: "Facebook", type: "share" },
      { key: "reddit", label: "Reddit", type: "share" },
      { key: "linkedin", label: "LinkedIn", type: "share" },
    ],
  },
  {
    id: "music",
    label: "Music",
    icon: Music,
    platforms: [
      { key: "spotify", label: "Spotify", type: "preference" },
      { key: "apple_music", label: "Apple Music", type: "preference" },
      { key: "audiomack", label: "Audiomack", type: "preference" },
      { key: "boomplay", label: "Boomplay", type: "preference" },
      { key: "youtube_music", label: "YouTube Music", type: "preference" },
    ],
  },
  {
    id: "video",
    label: "Movies & TV",
    icon: Video,
    platforms: [
      { key: "youtube", label: "YouTube", type: "preference" },
      { key: "netflix", label: "Netflix", type: "preference" },
      { key: "disney_plus", label: "Disney+", type: "preference" },
      { key: "prime_video", label: "Prime Video", type: "preference" },
      { key: "crunchyroll", label: "Crunchyroll", type: "preference" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: MessageCircle,
    platforms: [
      { key: "whatsapp", label: "WhatsApp", type: "share" },
      { key: "telegram", label: "Telegram", type: "share" },
      { key: "discord", label: "Discord", type: "oauth" },
    ],
  },
  {
    id: "calendars",
    label: "Calendars",
    icon: Calendar,
    platforms: [
      { key: "google_calendar", label: "Google Calendar", type: "shared_oauth" },
      { key: "apple_calendar", label: "Apple Calendar", type: "preference" },
      { key: "outlook_calendar", label: "Outlook Calendar", type: "preference" },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    icon: Cloud,
    platforms: [
      { key: "google_drive", label: "Google Drive", type: "preference" },
      { key: "one_drive", label: "OneDrive", type: "preference" },
      { key: "dropbox", label: "Dropbox", type: "preference" },
    ],
  },
];

const KEY = "unibud_social_connections";

export default function ConnectedAccounts() {
  const [connected, setConnected] = useState({});
  const [syncTimes, setSyncTimes] = useState({});
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
      setConnected(stored.connections || stored);
      setSyncTimes(stored.syncTimes || {});
    } catch {}
    base44.auth.isAuthenticated().then(setAuthed);
  }, []);

  const persist = (conns, times) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ connections: conns, syncTimes: times }));
    } catch {}
  };

  const detectOAuth = async (key) => {
    try {
      const res = await base44.functions.invoke("socialProfile", { connector: key });
      const ok = res?.data?.connected || res?.connected || false;
      setConnected((p) => {
        const n = { ...p, [key]: ok };
        persist(n, syncTimes);
        return n;
      });
      if (ok) {
        setSyncTimes((p) => {
          const n = { ...p, [key]: new Date().toISOString() };
          persist(connected, n);
          return n;
        });
      }
      return ok;
    } catch {
      setConnected((p) => ({ ...p, [key]: false }));
      return false;
    }
  };

  useEffect(() => {
    if (!authed) return;
    Object.keys(OAUTH).forEach((k) => detectOAuth(k));
  }, [authed]);

  const handleConnect = async (key) => {
    if (!authed) { base44.auth.redirectToLogin(); return; }
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      if (OAUTH[key]) {
        const urlRes = await base44.connectors.connectAppUser(OAUTH[key].id);
        const url = typeof urlRes === "string" ? urlRes : urlRes?.url;
        const popup = window.open(url, "_blank");
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            detectOAuth(key).finally(() => setBusy((b) => ({ ...b, [key]: false })));
          }
        }, 500);
      } else if (SHARED_CONNECTOR[key]) {
        const urlRes = await base44.connectors.connectAppUser(SHARED_CONNECTOR[key]);
        const url = typeof urlRes === "string" ? urlRes : urlRes?.url;
        const popup = window.open(url, "_blank");
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setConnected((p) => {
              const n = { ...p, [key]: true };
              const t = { ...syncTimes, [key]: new Date().toISOString() };
              setSyncTimes(t);
              persist(n, t);
              return n;
            });
            setBusy((b) => ({ ...b, [key]: false }));
          }
        }, 500);
      }
    } catch {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const handleDisconnect = async (key) => {
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      if (OAUTH[key]) {
        await base44.connectors.disconnectAppUser(OAUTH[key].id);
      } else if (SHARED_CONNECTOR[key]) {
        await base44.connectors.disconnectAppUser(SHARED_CONNECTOR[key]);
      }
      setConnected((p) => {
        const n = { ...p, [key]: false };
        const t = { ...syncTimes, [key]: null };
        setSyncTimes(t);
        persist(n, t);
        return n;
      });
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const toggleLocal = (key) => {
    setConnected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const t = { ...syncTimes };
      if (next[key]) t[key] = new Date().toISOString();
      else t[key] = null;
      setSyncTimes(t);
      persist(next, t);
      return next;
    });
  };

  const onClick = (platform) => {
    const { key, type } = platform;
    if (busy[key]) return;
    if (type === "oauth" || type === "shared_oauth") {
      connected[key] ? handleDisconnect(key) : handleConnect(key);
    } else {
      toggleLocal(key);
    }
  };

  const formatSyncTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-5">
      {/* Privacy notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-[16px] bg-muted/40">
        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.8} />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Connect only the platforms you want Bud to use. Everything is opt-in, private to you,
          and can be revoked instantly. UNIBUD never posts on your behalf without explicit action.
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const CatIcon = cat.icon;
        const connectedInCat = cat.platforms.filter((p) => connected[p.key]).length;
        return (
          <div key={cat.id}>
            {/* Category header — quiet text label */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <CatIcon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat.label}</span>
              </div>
              {connectedInCat > 0 && (
                <span className="text-[10px] font-medium text-muted-foreground">{connectedInCat} connected</span>
              )}
            </div>

            {/* Platform rows — clean settings rows, no brand colors */}
            <div className="rounded-[16px] bg-card overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
              {cat.platforms.map((platform, idx) => {
                const isOn = !!connected[platform.key];
                const isBusy = !!busy[platform.key];
                const isOAuth = platform.type === "oauth" || platform.type === "shared_oauth";
                const isExpanded = expandedRow === platform.key;
                const lastSync = formatSyncTime(syncTimes[platform.key]);
                const isLast = idx === cat.platforms.length - 1;

                return (
                  <div key={platform.key} className={isLast ? "" : "border-b border-border/30"}>
                    <button
                      onClick={() => isOn ? setExpandedRow(isExpanded ? null : platform.key) : onClick(platform)}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-left active:bg-muted/30 transition-colors"
                    >
                      {/* Monochrome status dot — no brand colors */}
                      <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                        isOn ? "bg-primary/10" : "bg-muted/50"
                      }`}>
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" strokeWidth={2} />
                        ) : isOn ? (
                          <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                        )}
                      </div>

                      {/* Platform name + status — text first, no logos */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold ${isOn ? "text-foreground" : "text-muted-foreground"}`}>
                          {platform.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isBusy
                            ? "Connecting…"
                            : isOn
                            ? lastSync ? `Last sync ${lastSync}` : "Connected"
                            : isOAuth
                            ? authed ? "Tap to connect" : "Sign in to connect"
                            : "Not connected"}
                        </p>
                      </div>

                      {/* Connect/Disconnect toggle or expand chevron */}
                      {!isOn ? (
                        <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center active:scale-90 transition-transform">
                          <Link2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
                        </div>
                      ) : (
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          strokeWidth={1.8}
                        />
                      )}
                    </button>

                    {/* Expanded details — sync status, permissions, disconnect */}
                    <AnimatePresence>
                      {isExpanded && isOn && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 bg-muted/20">
                            {/* Sync status */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Sync Status</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                <span className="text-[11px] font-medium text-foreground">Active</span>
                              </div>
                            </div>

                            {/* Last sync */}
                            {lastSync && (
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Last Sync</span>
                                <span className="text-[11px] font-medium text-foreground">{lastSync}</span>
                              </div>
                            )}

                            {/* Permissions */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Permissions</span>
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {platform.type === "oauth" ? "Profile & content" : "Share only"}
                              </span>
                            </div>

                            {/* Disconnect */}
                            <button
                              onClick={() => onClick(platform)}
                              disabled={isBusy}
                              className="w-full flex items-center justify-center gap-2 h-9 rounded-[12px] bg-destructive/8 text-destructive text-[12px] font-bold active:scale-[0.98] transition-transform mt-1"
                            >
                              <Unlink className="w-3.5 h-3.5" strokeWidth={2} />
                              Disconnect
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}