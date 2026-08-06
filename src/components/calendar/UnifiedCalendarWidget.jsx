import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar, ChevronLeft, ChevronRight, Clock, MapPin,
  CheckCircle2, AlertCircle, RefreshCw, Loader2, Cloud,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

const TYPE_CONFIG = {
  exam: { label: "Exam", color: "bg-error/10", dot: "bg-error", text: "text-error" },
  assignment: { label: "Assignment", color: "bg-warning/10", dot: "bg-warning", text: "text-warning" },
  class: { label: "Class", color: "bg-primary/10", dot: "bg-primary", text: "text-primary" },
  study_session: { label: "Study", color: "bg-success/10", dot: "bg-success", text: "text-success" },
  deadline: { label: "Deadline", color: "bg-error/10", dot: "bg-error", text: "text-error" },
  event: { label: "Event", color: "bg-accent/10", dot: "bg-accent", text: "text-accent" },
  live_class: { label: "Live Class", color: "bg-primary/10", dot: "bg-primary", text: "text-primary" },
  mentorship: { label: "Mentorship", color: "bg-chocolate/10", dot: "bg-chocolate", text: "text-chocolate" },
  personal: { label: "Personal", color: "bg-muted", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  tradition: { label: "Tradition", color: "bg-accent/10", dot: "bg-accent", text: "text-accent" },
};

export default function UnifiedCalendarWidget({ compact = false }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [syncing, setSyncing] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["unified-calendar", "events"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      return await base44.entities.CalendarEvent.filter(
        { date: { $gte: today, $lte: future } },
        "date",
        200
      );
    },
  });

  const { data: syncConn } = useQuery({
    queryKey: ["calendar-sync", "connections"],
    queryFn: () => base44.entities.AcademicCalendarSync.list("-created_date", 10),
  });

  const googleConnected = (syncConn || []).some(
    (c) => c.source_type === "google_calendar" && c.sync_status === "active"
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedDayEvents = eventsByDate[selectedDateStr] || [];

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke("googleCalendarSync", { action: "full_sync" });
    } catch {}
    setSyncing(false);
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr, events: eventsByDate[dateStr] || [] });
    }
    return days;
  }, [year, month, daysInMonth, startWeekday, eventsByDate]);

  const monthName = selectedDate.toLocaleDateString("en", { month: "long", year: "numeric" });

  const navigateMonth = (delta) => {
    setSelectedDate(new Date(year, month + delta, 1));
  };

  if (isLoading) {
    return (
      <div className="rounded-[20px] glass-card p-4">
        <div className="h-5 w-32 rounded-full bg-muted/40 shimmer mb-4" />
        <div className="h-32 rounded-[14px] bg-muted/30 shimmer" />
      </div>
    );
  }

  const totalEvents = (events || []).length;

  return (
    <div className="rounded-[20px] glass-card p-4 ambient-glow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[13px] font-heading font-bold text-foreground tracking-tight">Unified Calendar</p>
            <p className="text-[10px] text-muted-foreground">{totalEvents} upcoming events</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={!googleConnected || syncing}
          className="w-8 h-8 rounded-full bg-card flex items-center justify-center spring-tap disabled:opacity-40"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          title={googleConnected ? "Sync now" : "Connect Google Calendar first"}
        >
          {syncing ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" strokeWidth={2.2} /> : <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />}
        </button>
      </div>

      {googleConnected ? (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-full bg-success/8">
          <CheckCircle2 className="w-3 h-3 text-success" strokeWidth={2.5} />
          <span className="text-[10px] font-semibold text-success">Google Calendar synced</span>
        </div>
      ) : (
        <Link to="/settings/calendar-sync" className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-full bg-warning/8 spring-tap">
          <AlertCircle className="w-3 h-3 text-warning" strokeWidth={2.5} />
          <span className="text-[10px] font-semibold text-warning">Connect Google Calendar for full sync</span>
        </Link>
      )}

      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-bold text-foreground">{monthName}</p>
        <div className="flex gap-1">
          <button onClick={() => navigateMonth(-1)} className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center spring-tap">
            <ChevronLeft className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
          </button>
          <button onClick={() => navigateMonth(1)} className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center spring-tap">
            <ChevronRight className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-7 gap-0.5 mb-3">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold text-muted-foreground/60 py-1">{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = d.dateStr === todayStr;
            const isSelected = d.dateStr === selectedDateStr;
            const hasEvents = d.events.length > 0;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(new Date(year, month, d.day))}
                className={`relative aspect-square rounded-[8px] flex items-center justify-center text-[11px] font-semibold spring-tap transition-colors ${
                  isSelected ? "bg-primary text-primary-foreground"
                  : isToday ? "bg-primary/10 text-primary"
                  : hasEvents ? "bg-card text-foreground"
                  : "text-muted-foreground"
                }`}
                style={!isSelected && !isToday ? { boxShadow: "0 1px 2px rgba(0,0,0,0.02)" } : {}}
              >
                {d.day}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {selectedDate.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
          <span className="ml-1.5 normal-case font-medium text-muted-foreground/60">· {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}</span>
        </p>
        <AnimatePresence mode="popLayout">
          {selectedDayEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center"
            >
              <p className="text-[11px] text-muted-foreground">No events scheduled</p>
            </motion.div>
          ) : (
            selectedDayEvents.slice(0, compact ? 3 : 6).map((evt, i) => {
              const config = TYPE_CONFIG[evt.type] || TYPE_CONFIG.personal;
              const isFromGoogle = !!evt.google_event_id;
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
                  className="flex items-center gap-2 p-2 rounded-[12px] bg-card/50"
                >
                  <div className={`w-7 h-7 rounded-[9px] ${config.color} flex items-center justify-center shrink-0`}>
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">{evt.title}</p>
                    <div className="flex items-center gap-1.5">
                      {evt.start_time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2 h-2" strokeWidth={2.2} /> {evt.start_time}
                        </span>
                      )}
                      {evt.location && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                          <MapPin className="w-2 h-2 shrink-0" strokeWidth={2.2} /> <span className="truncate">{evt.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className={`text-[9px] font-bold ${config.text}`}>{config.label}</span>
                    {isFromGoogle && <Cloud className="w-2.5 h-2.5 text-muted-foreground/50" strokeWidth={2.2} />}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {selectedDayEvents.length > (compact ? 3 : 6) && (
        <Link to="/calendar" className="block text-center text-[11px] font-semibold text-primary mt-2 spring-tap">
          View all {selectedDayEvents.length} events
        </Link>
      )}
    </div>
  );
}