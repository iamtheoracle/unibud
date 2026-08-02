import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Check, Loader2, Unlink, RefreshCw,
  Shield, Smartphone, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "@/components/ui/use-toast";

const PROVIDERS = [
  { id: "google", sourceType: "google_calendar", name: "Google Calendar", icon: Calendar, color: "bg-chocolate/10", iconColor: "text-chocolate", available: true },
  { id: "outlook", sourceType: "outlook", name: "Outlook Calendar", icon: Calendar, color: "bg-blue-500/10", iconColor: "text-blue-500", available: false },
  { id: "apple", sourceType: "apple", name: "Apple Calendar", icon: Smartphone, color: "bg-foreground/5", iconColor: "text-foreground", available: false },
];

export default function CalendarSyncSettings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isOnline = useOnlineStatus();
  const [busy, setBusy] = useState(null);

  const { data: connections } = useQuery({
    queryKey: ["calendar-sync", "connections"],
    queryFn: () => base44.entities.AcademicCalendarSync.list("-created_date", 10),
    enabled: isOnline,
  });

  const getConnection = (sourceType) =>
    connections?.find((c) => c.source_type === sourceType && c.sync_status === "active");

  const handleConnect = async (provider) => {
    if (!provider.available) {
      toast({ title: "Coming soon", description: `${provider.name} sync is not available yet.` });
      return;
    }
    setBusy(provider.id);
    try {
      await base44.entities.AcademicCalendarSync.create({
        source_type: provider.sourceType,
        source_name: provider.name,
        sync_status: "active",
        authorized: true,
        auto_sync: true,
        last_synced_at: new Date().toISOString(),
      });

      // Trigger initial sync
      try {
        await base44.functions.invoke("googleCalendarSync", { action: "full_sync" });
      } catch (syncErr) {
        console.error("Initial sync failed:", syncErr);
      }

      await qc.invalidateQueries({ queryKey: ["calendar-sync"] });
      toast({ title: "Calendar connected", description: `${provider.name} is now syncing. Your academic events will appear in Google Calendar.` });
    } catch (err) {
      toast({ title: "Connection failed", description: "Could not connect. Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async (provider) => {
    const conn = getConnection(provider.sourceType);
    if (!conn) return;
    setBusy(provider.id);
    try {
      await base44.entities.AcademicCalendarSync.update(conn.id, {
        sync_status: "disconnected",
        authorized: false,
      });
      await qc.invalidateQueries({ queryKey: ["calendar-sync"] });
      toast({ title: "Calendar disconnected", description: `${provider.name} sync stopped.` });
    } catch (err) {
      toast({ title: "Failed to disconnect", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleSync = async (provider) => {
    const conn = getConnection(provider.sourceType);
    if (!conn) return;
    setBusy(`sync-${provider.id}`);
    try {
      const result = await base44.functions.invoke("googleCalendarSync", { action: "full_sync" });
      await base44.entities.AcademicCalendarSync.update(conn.id, {
        last_synced_at: new Date().toISOString(),
        last_sync_result: {
          normalized: result.normalized || 0,
          pushed: (result.pushed?.created || 0) + (result.pushed?.updated || 0),
          pulled: (result.pulled?.created || 0) + (result.pulled?.updated || 0),
          conflicts: result.conflicts || 0,
        },
      });
      await qc.invalidateQueries({ queryKey: ["calendar-sync"] });
      await qc.invalidateQueries({ queryKey: ["unified-calendar"] });
      const total = (result.normalized || 0) + (result.pushed?.created || 0) + (result.pulled?.created || 0);
      toast({ title: "Sync complete", description: `${total} events synchronized${result.conflicts ? ` · ${result.conflicts} conflict${result.conflicts !== 1 ? "s" : ""}` : ""}` });
    } catch (err) {
      toast({ title: "Sync failed", description: err.message || "Could not sync. Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">Calendar Sync</h1>
            <p className="text-[11px] text-muted-foreground">Connect your calendars to sync academics</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-primary" strokeWidth={2.2} />
          </div>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 pt-4 space-y-4">
        {/* What syncs */}
        <div className="rounded-[20px] glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground tracking-tight">What gets synced</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Class timetable", "Assignment deadlines", "Exam dates", "Study sessions", "Campus events", "Club meetings", "Office hours", "Project milestones", "Academic reminders", "Group meetings"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Check className="w-3 h-3 text-success flex-shrink-0" strokeWidth={2.5} />
                {item}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            Two-way sync with conflict detection. Events update automatically — no manual refresh needed. Changes in UNIBUD appear in Google Calendar, and vice versa.
          </p>
        </div>

        {/* Provider cards */}
        <div className="space-y-2.5">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const conn = getConnection(provider.sourceType);
            const isConnected = !!conn;
            const isBusy = busy === provider.id || busy === `sync-${provider.id}`;
            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[18px] glass-card p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-[14px] ${provider.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${provider.iconColor}`} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-foreground">{provider.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {isConnected ? "Connected & syncing" : provider.available ? "Not connected" : "Coming soon"}
                    </p>
                  </div>
                  {isConnected && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-success px-2 py-0.5 rounded-full bg-success/10">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      Active
                    </span>
                  )}
                </div>

                {isConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(provider)}
                      disabled={isBusy}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[12px] bg-primary/10 text-primary text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.2} />
                      )}
                      Sync Now
                    </button>
                    <button
                      onClick={() => handleDisconnect(provider)}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-[12px] bg-muted text-muted-foreground text-[11px] font-bold active:scale-95 transition-transform"
                    >
                      <Unlink className="w-3.5 h-3.5" strokeWidth={2.2} />
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleConnect(provider)}
                    disabled={isBusy || !provider.available}
                    className="w-full flex items-center justify-center gap-2 h-9 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-bold disabled:opacity-50"
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
                    )}
                    Connect {provider.name}
                  </motion.button>
                )}

                {conn?.last_synced_at && (
                  <p className="text-[9px] text-muted-foreground mt-2 text-center">
                    Last synced: {new Date(conn.last_synced_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}

                {conn?.last_sync_result && (
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground justify-center">
                    <span>{conn.last_sync_result.normalized || 0} normalized</span>
                    <span>·</span>
                    <span>{(conn.last_sync_result.pushed || 0)} pushed</span>
                    <span>·</span>
                    <span>{(conn.last_sync_result.pulled || 0)} pulled</span>
                    {conn.last_sync_result.conflicts > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-warning">{conn.last_sync_result.conflicts} conflict{(conn.last_sync_result.conflicts) !== 1 ? "s" : ""}</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Privacy note */}
        <div className="rounded-[18px] bg-chocolate/5 p-3.5 border border-chocolate/10">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-chocolate flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <div>
              <p className="text-[11px] font-bold text-foreground">Your privacy is protected</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                Calendar sync uses secure Google OAuth authentication. You control which calendars are connected and what information is synchronized. Academic analytics remain private to you. You can disconnect at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Conflict info */}
        <div className="rounded-[18px] bg-primary/5 p-3.5 border border-primary/10">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <div>
              <p className="text-[11px] font-bold text-foreground">Conflict detection</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                When the same event is modified in both UNIBUD and Google Calendar, the system detects conflicts and preserves the most recent version. You'll be notified of any conflicts during sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}