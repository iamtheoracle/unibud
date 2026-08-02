import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sun, Calendar, ClipboardList, Bell, RefreshCw, ChevronRight,
  Clock, MapPin, AlertCircle, BookOpen, Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { hapticTap } from "@/lib/haptics";
import { generateDailyBriefing, getCurrentBriefingType } from "@/lib/autonomous/briefingGenerator";
import BudIntelligentLoader from "@/components/bud/BudIntelligentLoader";
import { Trophy } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const STORAGE_KEY = "bud_briefing_date";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function dueLabel(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return "";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `In ${days} days`;
}

function dueColor(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return "text-muted-foreground";
  if (days <= 0) return "text-destructive";
  if (days <= 2) return "text-warning";
  return "text-muted-foreground";
}

/** Bud orb — living presence at the top of the briefing */
function BudOrb({ speaking }) {
  return (
    <div className="relative w-16 h-16 rounded-full grid place-items-center shrink-0">
      <div className={`absolute inset-0 rounded-full bg-primary/10 ${speaking ? "bud-breathe" : ""}`} />
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 grid place-items-center ${speaking ? "bud-breathe" : ""}`}>
        <div className="w-5 h-1.5 rounded-full bg-primary-foreground/90" />
      </div>
    </div>
  );
}

/** Section wrapper */
function BriefingSection({ icon: Icon, title, count, children, emptyMessage, link }) {
  const navigate = useNavigate();
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mb-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-foreground/[0.06] grid place-items-center">
            <Icon className="w-3.5 h-3.5 text-foreground" strokeWidth={2.2} />
          </div>
          <h2 className="text-[14px] font-bold text-foreground">{title}</h2>
          {count > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {count}
            </span>
          )}
        </div>
        {link && (
          <button
            onClick={() => { hapticTap(); navigate(link); }}
            className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground spring-tap"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {count === 0 ? (
        <div className="glass-card p-4 text-center">
          <p className="text-[12px] text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </motion.section>
  );
}

/** Assignment row */
function AssignmentRow({ assignment }) {
  return (
    <div className="glass-card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-warning/10 grid place-items-center shrink-0">
        <ClipboardList className="w-4 h-4 text-warning" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{assignment.title}</p>
        {assignment.course_code && (
          <p className="text-[11px] text-muted-foreground">{assignment.course_code}</p>
        )}
      </div>
      <span className={`text-[11px] font-bold ${dueColor(assignment.due_date)} shrink-0`}>
        {dueLabel(assignment.due_date)}
      </span>
    </div>
  );
}

/** Event row */
function EventRow({ event }) {
  return (
    <div className="glass-card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
        <Calendar className="w-4 h-4 text-primary" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {event.start_time && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {event.start_time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
              <MapPin className="w-3 h-3" />
              {event.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Notification row */
function NotificationRow({ notification }) {
  return (
    <div className="glass-card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
        <Bell className="w-4 h-4 text-primary" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{notification.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{notification.message}</p>
      </div>
    </div>
  );
}

/**
 * BudDailyBriefing — Bud's morning briefing view.
 *
 * Bud presents a calm, intelligent summary of the student's day:
 * upcoming assignments, today's events, and important notifications,
 * wrapped in Bud's warm narrative voice.
 */
export default function BudDailyBriefing() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [newAchievements, setNewAchievements] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const briefingType = getCurrentBriefingType();

  // Fetch assignments due within 7 days
  const { data: assignments = [] } = useQuery({
    queryKey: ["briefing-assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 10),
    staleTime: 60000,
  });

  const upcomingAssignments = useMemo(() => {
    return assignments
      .filter(a => {
        const days = daysUntil(a.due_date);
        return days !== null && days <= 7;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  }, [assignments]);

  // Fetch today's events
  const { data: events = [] } = useQuery({
    queryKey: ["briefing-events"],
    queryFn: () => base44.entities.CalendarEvent.filter({ date: today }, "start_time", 10),
    staleTime: 60000,
  });

  // Fetch important unread notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["briefing-notifications"],
    queryFn: () => base44.entities.Notification.filter(
      { is_read: false, dismissed: false },
      "-created_date",
      5
    ),
    staleTime: 30000,
  });

  // Generate Bud's narrative briefing
  const loadBriefing = useCallback(async (force = false) => {
    const cacheKey = `bud_briefing_${briefingType}_${new Date().toISOString().split("T")[0]}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setBriefing(cached);
        setLoadingBriefing(false);
        return;
      }
    }
    setLoadingBriefing(true);
    try {
      const result = await generateDailyBriefing(briefingType);
      setBriefing(result);
      localStorage.setItem(cacheKey, result);
    } catch {
      setBriefing(null);
    } finally {
      setLoadingBriefing(false);
    }
  }, [briefingType]);

  useEffect(() => {
    loadBriefing();
  }, [loadBriefing]);

  // Check for new achievements on briefing load — Bud celebrates milestones
  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("checkAchievements", { action: "check" });
        const data = res?.data || res;
        if (data.newly_earned && data.newly_earned.length > 0) {
          setNewAchievements(data.newly_earned);
        }
      } catch {}
    })();
  }, []);

  const hasContent = upcomingAssignments.length > 0 || events.length > 0 || notifications.length > 0;

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* Bud hero — the presenter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="crystal-card p-5 mb-5"
      >
        <div className="flex items-center gap-4 mb-4">
          <BudOrb speaking={loadingBriefing} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">{formatDate()}</p>
              <button
                onClick={() => loadBriefing(true)}
                disabled={loadingBriefing}
                className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap"
              >
                <RefreshCw className={`w-3 h-3 text-muted-foreground ${loadingBriefing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-tight">
              {getGreeting()}
            </h1>
          </div>
        </div>

        {/* Bud's narrative briefing */}
        {loadingBriefing ? (
          <BudIntelligentLoader context="study_summary" size="sm" />
        ) : briefing ? (
          <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-line">
            {briefing}
          </p>
        ) : (
          <div className="glass-card p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[13px] text-muted-foreground">
              Your briefing will appear here shortly.
            </p>
          </div>
        )}
      </motion.div>

      {/* Achievement celebration — Bud celebrates milestones naturally */}
      {newAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="crystal-card p-4 mb-5 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-bold text-foreground">
              {newAchievements.length === 1 ? "You earned a new achievement!" : `You earned ${newAchievements.length} new achievements!`}
            </span>
          </div>
          {newAchievements.map((ach) => (
            <div key={ach.id} className="flex items-center gap-2.5 py-1.5">
              <div
                className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                style={{ background: "hsl(" + (ach.accent_color || "142 71% 45%") + " / 0.14)", color: "hsl(" + (ach.accent_color || "142 71% 45%") + ")" }}
              >
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">{ach.title}</p>
                <p className="text-[11px] text-muted-foreground">{ach.bud_message}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => setNewAchievements([])}
            className="text-[11px] text-muted-foreground mt-2 spring-tap"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Quick summary stats */}
      {hasContent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="flex gap-2 mb-5"
        >
          {upcomingAssignments.length > 0 && (
            <div className="flex-1 glass-card p-3 text-center">
              <p className="text-[20px] font-bold text-foreground">{upcomingAssignments.length}</p>
              <p className="text-[10px] text-muted-foreground">Due soon</p>
            </div>
          )}
          {events.length > 0 && (
            <div className="flex-1 glass-card p-3 text-center">
              <p className="text-[20px] font-bold text-foreground">{events.length}</p>
              <p className="text-[10px] text-muted-foreground">Today's events</p>
            </div>
          )}
          {notifications.length > 0 && (
            <div className="flex-1 glass-card p-3 text-center">
              <p className="text-[20px] font-bold text-foreground">{notifications.length}</p>
              <p className="text-[10px] text-muted-foreground">Unread</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Assignments section */}
      <BriefingSection
        icon={ClipboardList}
        title="Assignments"
        count={upcomingAssignments.length}
        link="/assignments"
        emptyMessage="No assignments due this week. You're all caught up."
      >
        {upcomingAssignments.map(a => (
          <AssignmentRow key={a.id} assignment={a} />
        ))}
      </BriefingSection>

      {/* Events section */}
      <BriefingSection
        icon={Calendar}
        title="Today's Schedule"
        count={events.length}
        link="/calendar"
        emptyMessage="Nothing scheduled for today. Enjoy the breathing room."
      >
        {events.map(e => (
          <EventRow key={e.id} event={e} />
        ))}
      </BriefingSection>

      {/* Notifications section */}
      <BriefingSection
        icon={Bell}
        title="Notifications"
        count={notifications.length}
        link="/notifications"
        emptyMessage="You're all caught up — no unread notifications."
      >
        {notifications.map(n => (
          <NotificationRow key={n.id} notification={n} />
        ))}
      </BriefingSection>

      {/* Empty state — nothing at all */}
      {!hasContent && !loadingBriefing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          className="crystal-card p-6 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 grid place-items-center mx-auto mb-3">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[14px] font-semibold text-foreground mb-1">A clean slate today</p>
          <p className="text-[12px] text-muted-foreground">
            No assignments, events, or notifications. A perfect day to get ahead — or to rest.
          </p>
          <button
            onClick={() => { hapticTap(); navigate("/home"); }}
            className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap"
          >
            Talk to Bud
          </button>
        </motion.div>
      )}
    </div>
  );
}