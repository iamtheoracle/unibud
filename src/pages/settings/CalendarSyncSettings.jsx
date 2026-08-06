import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Check, Loader2, Unlink, RefreshCw,
  Shield, AlertCircle, Clock, Bell, Palette, ChevronRight,
  Cloud, CloudOff, Zap, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "@/components/ui/use-toast";

const EVENT_TYPES = [
  { key: "classes", label: "Classes", icon: "🎓", color: "text-blue-500", default: true },
  { key: "assignments", label: "Assignments", icon: "📋", color: "text-orange-500", default: true },
  { key: "exams", label: "Exams", icon: "📝", color: "text-red-500", default: true },
  { key: "presentations", label: "Presentations", icon: "🎯", color: "text-pink-500", default: true },
  { key: "timetable", label: "Timetable", icon: "📅", color: "text-teal-500", default: true },
  { key: "academic_events", label: "Academic Events", icon: "🎉", color: "text-purple-500", default: true },
  { key: "study_sessions", label: "Study Sessions", icon: "📚", color: "text-green-500", default: false },
];

const REMINDER_OPTIONS = [
  { value: 0, label: "No reminder" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

export default function CalendarSyncSettings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isOnline = useOnlineStatus();
  const [busy, setBusy] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [reminder, setReminder] = useState(30);
  const [calendarId, setCalendarId] = useState("primary");
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  // ─── Fetch sync status ───
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["gcal-sync-status"],
    queryFn: async () => {
      try {
        return await base44.functions.invoke("googleCalendarSync", { action: "get_status" });
      } catch {
        return { connected: false };
      }
    },
    enabled: isOnline,
    refetchInterval: 30000,
  });

  // ─── Fetch existing connections ───
  const { data: connections } = useQuery({
    queryKey: ["calendar-sync", "connections"],
    queryFn: () => base44.entities.AcademicCalendarSync.list("-created_date", 10),
    enabled: isOnline,
  });

  // Sync local state when status loads
  useEffect(() => {
    if (status?.connected) {
      setPrefs(status.sync_preferences || {});
      setReminder(status.reminder_minutes ?? 30);
      setCalendarId(status.google_calendar_id || "primary");
    }
  }, [status]);

  const isConnected = status?.connected || false;
  const connection = connections?.find((c) => c.source_type === "google_calendar" && c.sync_status !== "disconnected");

  // ─── Connect Google Calendar ───
  const handleConnect = useCallback(async () => {
    setBusy("connect");
    try {
      // Create sync record
      await base44.entities.AcademicCalendarSync.create({
        source_type: "google_calendar",
        source_name: "Google Calendar",
        sync_status: "active",
        authorized: true,
        auto_sync: true,
        sync_direction: "unibud_to_google",
        sync_preferences: EVENT_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: t.default }), {}),
        reminder_minutes: 30,
        google_calendar_id: "primary",
      });

      // Trigger initial sync
      try {
        await base44.functions.invoke("googleCalendarSync", { action: "full_sync" });
      } catch (syncErr) {
        console.error("Initial sync failed:", syncErr);
      }

      await qc.invalidateQueries({ queryKey: ["gcal-sync-status"] });
      await qc.invalidateQueries({ queryKey: ["calendar-sync"] });
      toast({ title: "Google Calendar connected", description: "Your academic events will sync automatically." });
    } catch (err) {
      toast({ title: "Connection failed", description: "Could not connect. Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }, [qc]);

  // ─── Disconnect ───
  const handleDisconnect = useCallback(async () => {
    if (!connection) return;
    setBusy("disconnect");
    try {
      await base44.entities.AcademicCalendarSync.update(connection.id, {
        sync_status: "disconnected",
        authorized: false,
      });
      await qc.invalidateQueries({ queryKey: ["gcal-sync-status"] });
      await qc.invalidateQueries({ queryKey: ["calendar-sync"] });
      toast({ title: "Calendar disconnected", description: "Sync stopped. Events already in Google Calendar remain." });
    } catch {
      toast({ title: "Failed to disconnect", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }, [connection, qc]);

  // ─── Sync Now ───
  const handleSync = useCallback(async () => {
    setBusy("sync");
    try {
      const result = await base44.functions.invoke("googleCalendarSync", { action: "full_sync" });
      await qc.invalidateQueries({ queryKey: ["gcal-sync-status"] });
      await qc.invalidateQueries({ queryKey: ["calendar-sync"] });
      await qc.invalidateQueries({ queryKey: ["unified-calendar"] });
      const total = (result.normalized || 0) + (result.pushed?.created || 0) + (result.pushed?.updated || 0);
      toast({
        title: "Sync complete",
        description: `${total} events synced${result.deleted ? ` · ${result.deleted} removed` : ""}${result.conflicts ? ` · ${result.conflicts} conflict${result.conflicts !== 1 ? "s" : ""}` : ""}`,
      });
    } catch (err) {
      toast({ title: "Sync failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }, [qc]);

  // ─── Retry failed sync ───
  const handleRetry = useCallback(async () => {
    if (!connection) return;
    setBusy("retry");
    try {
      await base44.entities.AcademicCalendarSync.update(connection.id, {
        sync_status: "active",
        last_error: null,
      });
      await handleSync();
    } catch {
      toast({ title: "Retry failed", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }, [connection, handleSync]);

  // ─── Toggle event type ───
  const togglePref = useCallback(async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    if (connection) {
      try {
        await base44.entities.AcademicCalendarSync.update(connection.id, {
          sync_preferences: newPrefs,
        });
        toast({ title: "Preference saved", description: `${EVENT_TYPES.find(t => t.key === key)?.label} ${newPrefs[key] ? "enabled" : "disabled"}` });
      } catch {
        toast({ title: "Failed to save preference", variant: "destructive" });
      }
    }
  }, [prefs, connection]);

  // ─── Update reminder ───
  const updateReminder = useCallback(async (value) => {
    setReminder(value);
    if (connection) {
      try {
        await base44.entities.AcademicCalendarSync.update(connection.id, {
          reminder_minutes: value,
        });
      } catch { /* silent */ }
    }
  }, [connection]);

  // ─── Update calendar selection ───
  const updateCalendar = useCallback(async (calId) => {
    setCalendarId(calId);
    setShowCalendarPicker(false);
    if (connection) {
      try {
        await base44.entities.AcademicCalendarSync.update(connection.id, {
          google_calendar_id: calId,
        });
        toast({ title: "Calendar updated", description: "Future events will sync to the selected calendar." });
      } catch {
        toast({ title: "Failed to update calendar", variant: "destructive" });
      }
    }
  }, [connection]);

  // ─── Fetch calendars ───
  const handleFetchCalendars = useCallback(async () => {
    setBusy("calendars");
    try {
      const result = await base44.functions.invoke("googleCalendarSync", { action: "list_calendars" });
      await qc.invalidateQueries({ queryKey: ["gcal-sync-status"] });
      setShowCalendarPicker(true);
      toast({ title: "Calendars loaded", description: `${result.calendars?.length || 0} calendars found` });
    } catch {
      toast({ title: "Failed to load calendars", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }, [qc]);

  const calendars = status?.available_calendars || [];
  const lastResult = status?.last_sync_result || {};
  const conflicts = status?.conflict_log || [];
  const hasError = status?.sync_status === "error" || status?.last_error;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">Calendar Sync</h1>
            <p className="text-[11px] text-muted-foreground">Sync academic events to Google Calendar</p>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isConnected ? "bg-success/10" : "bg-muted"}`}>
            {isConnected ? <Cloud className="w-4 h-4 text-success" strokeWidth={2.2} /> : <CloudOff className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />}
          </div>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 pt-4 space-y-4">
        {/* Connection Status Card */}
        <div className="rounded-[20px] glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${isConnected ? "bg-success/10" : "bg-muted"}`}>
              <Calendar className={`w-5 h-5 ${isConnected ? "text-success" : "text-muted-foreground"}`} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-foreground">Google Calendar</p>
              <div className="flex items-center gap-1.5">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-success gentle-pulse" />
                    <p className="text-[11px] text-success font-medium">
                      {status?.sync_status === "syncing" ? "Syncing…" : hasError ? "Sync error" : "Connected & active"}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Not connected</p>
                )}
              </div>
            </div>
            {isConnected && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-success px-2 py-0.5 rounded-full bg-success/10">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                Active
              </span>
            )}
          </div>

          {/* Sync direction badge */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="font-semibold text-primary">UNIBUD</span>
              <ChevronRight className="w-3 h-3" />
              <span>Google Calendar</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">One-way sync</span>
          </div>

          {isConnected ? (
            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={busy === "sync" || busy === "retry"}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[12px] bg-primary/10 text-primary text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {busy === "sync" || busy === "retry" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.2} />
                )}
                Sync Now
              </button>
              <button
                onClick={handleDisconnect}
                disabled={busy === "disconnect"}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-[12px] bg-muted text-muted-foreground text-[11px] font-bold active:scale-95 transition-transform"
              >
                {busy === "disconnect" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" strokeWidth={2.2} />}
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={busy === "connect"}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              {busy === "connect" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" strokeWidth={2.2} />}
              Connect Google Calendar
            </button>
          )}

          {/* Last sync info */}
          {isConnected && status?.last_synced_at && (
            <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last synced
                </span>
                <span className="font-medium text-foreground">
                  {new Date(status.last_synced_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>

              {lastResult && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{lastResult.normalized || 0} normalized</span>
                  <span>·</span>
                  <span>{(lastResult.pushed?.created || 0) + (lastResult.pushed?.updated || 0)} pushed</span>
                  {lastResult.deleted > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-warning">{lastResult.deleted} deleted</span>
                    </>
                  )}
                  {lastResult.conflicts > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-destructive">{lastResult.conflicts} conflict{(lastResult.conflicts) !== 1 ? "s" : ""}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error state with retry */}
          {hasError && (
            <div className="mt-2 p-2.5 rounded-[10px] bg-destructive/5 border border-destructive/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-destructive">Last sync failed</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{status?.last_error || "Unknown error"}</p>
                </div>
                <button
                  onClick={handleRetry}
                  disabled={busy === "retry"}
                  className="flex items-center gap-1 px-2 py-1 rounded-[8px] bg-destructive/10 text-destructive text-[9px] font-bold active:scale-95"
                >
                  {busy === "retry" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings — only show when connected */}
        <AnimatePresence>
          {isConnected && (
            <>
              {/* Event Type Selection */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[18px] glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                  <h3 className="text-[14px] font-bold text-foreground tracking-tight">What to sync</h3>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">Choose which academic events appear in your Google Calendar.</p>
                <div className="space-y-1">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => togglePref(type.key)}
                      className="w-full flex items-center justify-between py-2 px-2 rounded-[10px] hover:bg-muted/40 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{type.icon}</span>
                        <span className="text-[12px] font-medium text-foreground">{type.label}</span>
                      </div>
                      <div className={`w-9 h-5 rounded-full transition-colors ${prefs[type.key] ? "bg-primary" : "bg-muted-foreground/20"} relative`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${prefs[type.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Reminder Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-[18px] glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                  <h3 className="text-[14px] font-bold text-foreground tracking-tight">Reminders</h3>
                </div>
                <div className="space-y-1">
                  {REMINDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateReminder(opt.value)}
                      className="w-full flex items-center justify-between py-2 px-2 rounded-[10px] hover:bg-muted/40 active:scale-[0.98] transition-all"
                    >
                      <span className="text-[12px] font-medium text-foreground">{opt.label}</span>
                      {reminder === opt.value && <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Calendar Selection */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[18px] glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                  <h3 className="text-[14px] font-bold text-foreground tracking-tight">Destination calendar</h3>
                </div>
                <button
                  onClick={handleFetchCalendars}
                  disabled={busy === "calendars"}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-[10px] bg-muted/40 active:scale-[0.98] transition-all"
                >
                  <span className="text-[12px] font-medium text-foreground">
                    {calendars.find((c) => c.id === calendarId)?.summary || calendarId === "primary" ? "Primary Calendar" : calendarId}
                  </span>
                  {busy === "calendars" ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>
                {calendars.length > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-1.5">{calendars.length} calendar{calendars.length !== 1 ? "s" : ""} available</p>
                )}
              </motion.div>

              {/* Calendar Picker Sheet */}
              <AnimatePresence>
                {showCalendarPicker && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/30 flex items-end"
                    onClick={() => setShowCalendarPicker(false)}
                  >
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 28, stiffness: 300 }}
                      className="w-full bg-background rounded-t-[24px] p-4 pb-8 max-h-[60vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-bold text-foreground">Select calendar</h3>
                        <button onClick={() => setShowCalendarPicker(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {calendars.map((cal) => (
                          <button
                            key={cal.id}
                            onClick={() => updateCalendar(cal.id)}
                            className="w-full flex items-center justify-between py-3 px-3 rounded-[12px] hover:bg-muted/40 active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-2.5">
                              <Calendar className={`w-4 h-4 ${cal.id === calendarId ? "text-primary" : "text-muted-foreground"}`} />
                              <div>
                                <p className="text-[13px] font-medium text-foreground">{cal.summary}</p>
                                {cal.primary && <span className="text-[9px] text-primary font-medium">Primary</span>}
                              </div>
                            </div>
                            {cal.id === calendarId && <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conflict Log */}
              {conflicts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[18px] bg-warning/5 p-4 border border-warning/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-warning" strokeWidth={2.2} />
                    <h3 className="text-[14px] font-bold text-foreground tracking-tight">Recent conflicts</h3>
                  </div>
                  <div className="space-y-2">
                    {conflicts.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px]">
                        <span className="text-muted-foreground whitespace-nowrap">
                          {new Date(c.timestamp).toLocaleString("en", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        <span className="text-foreground flex-1">{c.event_title || c.message}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Privacy & Info */}
        <div className="rounded-[18px] bg-chocolate/5 p-3.5 border border-chocolate/10">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-chocolate flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <div>
              <p className="text-[11px] font-bold text-foreground">How sync works</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                Events sync one-way from UNIBUD to Google Calendar. Color-coded by type with reminders and deep links back to UNIBUD. Deleted events are automatically removed from your calendar. You control what syncs and can disconnect anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}