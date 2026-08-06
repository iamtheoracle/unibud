import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock, ClipboardList, BookOpen, FileText, MapPin,
  ChevronDown, Sparkles, Sun, Cloud, CloudRain, Wind,
  GraduationCap, Megaphone, Award, Clock, Navigation,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: Sun };
  if (h < 17) return { text: "Good afternoon", icon: Sun };
  if (h < 21) return { text: "Good evening", icon: Cloud };
  return { text: "Good night", icon: Cloud };
}

function getWeatherIcon(condition) {
  if (!condition) return Sun;
  const c = condition.toLowerCase();
  if (c.includes("rain")) return CloudRain;
  if (c.includes("cloud")) return Cloud;
  if (c.includes("wind")) return Wind;
  return Sun;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff >= -1 && diff <= 7;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function timeUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return null;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"}`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs} hour${hrs === 1 ? "" : "s"} ${remMins} min` : `${hrs} hour${hrs === 1 ? "" : "s"}`;
}

export default function MorningBriefing() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [expanded, setExpanded] = useState(true);
  const [greeting] = useState(getGreeting);
  const GreetingIcon = greeting.icon;

  // Today's timetable
  const { data: timetable } = useQuery({
    queryKey: ["briefing", "timetable"],
    queryFn: () => base44.entities.TimetableEntry.list("start_time", 20),
    enabled: isOnline,
  });

  // Assignments
  const { data: assignments } = useQuery({
    queryKey: ["briefing", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 20),
    enabled: isOnline,
  });

  // Exams
  const { data: exams } = useQuery({
    queryKey: ["briefing", "exams"],
    queryFn: () => base44.entities.Exam.list("date", 10),
    enabled: isOnline,
  });

  // Campus events
  const { data: events } = useQuery({
    queryKey: ["briefing", "events"],
    queryFn: () => base44.entities.CampusEvent.list("date", 10),
    enabled: isOnline,
  });

  // Calendar events
  const { data: calendar } = useQuery({
    queryKey: ["briefing", "calendar"],
    queryFn: () => base44.entities.CalendarEvent.list("start_date", 10),
    enabled: isOnline,
  });

  // Study sessions
  const { data: studySessions } = useQuery({
    queryKey: ["briefing", "study"],
    queryFn: () => base44.entities.StudySession.list("-created_date", 10),
    enabled: isOnline,
  });

  // Announcements
  const { data: announcements } = useQuery({
    queryKey: ["briefing", "announcements"],
    queryFn: () => base44.entities.StaffAnnouncement.list("-created_date", 5),
    enabled: isOnline,
  });

  // Scholarships
  const { data: scholarships } = useQuery({
    queryKey: ["briefing", "scholarships"],
    queryFn: () => base44.entities.Scholarship.list("-created_date", 5),
    enabled: isOnline,
  });

  // Opportunities (internships)
  const { data: opportunities } = useQuery({
    queryKey: ["briefing", "opportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 5),
    enabled: isOnline,
  });

  // Weather (from Weather entity if available)
  const { data: weather } = useQuery({
    queryKey: ["briefing", "weather"],
    queryFn: () => base44.entities.Weather.list("-created_date", 1),
    enabled: isOnline,
  });

  // Process data
  const todayClasses = useMemo(() =>
    (timetable || []).filter(t => isToday(t.date) || isToday(t.start_date)).sort((a, b) =>
      (a.start_time || "").localeCompare(b.start_time || "")
    ), [timetable]);

  const dueAssignments = useMemo(() =>
    (assignments || []).filter(a => isThisWeek(a.due_date)), [assignments]);

  const todayExams = useMemo(() =>
    (exams || []).filter(e => isToday(e.date)), [exams]);

  const weekExams = useMemo(() =>
    (exams || []).filter(e => isThisWeek(e.date) && !isToday(e.date)), [exams]);

  const upcomingEvents = useMemo(() =>
    (events || []).filter(e => isThisWeek(e.date)).slice(0, 3), [events]);

  const todayCalendar = useMemo(() =>
    (calendar || []).filter(c => isToday(c.start_date) || isToday(c.date)), [calendar]);

  const todayStudy = useMemo(() =>
    (studySessions || []).filter(s => isToday(s.date) || isToday(s.scheduled_date)), [studySessions]);

  const activeAnnouncements = useMemo(() =>
    (announcements || []).slice(0, 3), [announcements]);

  const deadlineScholarships = useMemo(() =>
    (scholarships || []).filter(s => s.deadline && isThisWeek(s.deadline)).slice(0, 2), [scholarships]);

  const deadlineOpps = useMemo(() =>
    (opportunities || []).filter(o => o.deadline && isThisWeek(o.deadline)).slice(0, 2), [opportunities]);

  // Generate insights from real data
  const insights = useMemo(() => {
    const list = [];

    if (todayClasses.length > 0) {
      const first = todayClasses[0];
      if (first.start_time) {
        const now = new Date();
        const [h, m] = (first.start_time || "00:00").split(":").map(Number);
        const classTime = new Date();
        classTime.setHours(h, m, 0, 0);
        const diff = (classTime - now) / 60000;
        if (diff > 0 && diff < 180) {
          list.push({
            icon: Clock,
            text: `Your first class starts in ${timeUntil(classTime)}.`,
          });
        }
      }
      if (todayClasses.length > 1) {
        // Check for gaps
        for (let i = 0; i < todayClasses.length - 1; i++) {
          const curr = todayClasses[i];
          const next = todayClasses[i + 1];
          if (curr.end_time && next.start_time) {
            const [eh, em] = curr.end_time.split(":").map(Number);
            const [nh, nm] = next.start_time.split(":").map(Number);
            const gapMin = (nh * 60 + nm) - (eh * 60 + em);
            if (gapMin >= 120 && gapMin <= 240) {
              const hrs = Math.floor(gapMin / 60);
              list.push({
                icon: Clock,
                text: `You have a ${hrs}-hour break between lectures.`,
              });
              break;
            }
          }
        }
      }
    }

    if (dueAssignments.length > 0) {
      list.push({
        icon: ClipboardList,
        text: `You have ${dueAssignments.length} assignment${dueAssignments.length === 1 ? "" : "s"} due this week.`,
      });
    }

    if (todayExams.length > 0) {
      list.push({
        icon: Award,
        text: `You have ${todayExams.length} exam${todayExams.length === 1 ? "" : "s"} today.`,
      });
    } else if (weekExams.length > 0) {
      list.push({
        icon: Award,
        text: `You have ${weekExams.length} exam${weekExams.length === 1 ? "" : "s"} this week.`,
      });
    }

    if (upcomingEvents.length > 0) {
      list.push({
        icon: CalendarClock,
        text: `${upcomingEvents.length} campus event${upcomingEvents.length === 1 ? "" : "s"} happening this week.`,
      });
    }

    if (activeAnnouncements.length > 0) {
      list.push({
        icon: Megaphone,
        text: `${activeAnnouncements.length} new announcement${activeAnnouncements.length === 1 ? "" : "s"} from your university.`,
      });
    }

    return list.slice(0, 4);
  }, [todayClasses, dueAssignments, todayExams, weekExams, upcomingEvents, activeAnnouncements]);

  const weatherData = weather?.[0];
  const WeatherIcon = getWeatherIcon(weatherData?.condition);

  const hasContent =
    todayClasses.length > 0 ||
    dueAssignments.length > 0 ||
    todayExams.length > 0 ||
    weekExams.length > 0 ||
    upcomingEvents.length > 0 ||
    todayCalendar.length > 0 ||
    activeAnnouncements.length > 0;

  const QUICK_ACTIONS = [
    { icon: CalendarClock, label: "Timetable", path: "/timetable" },
    { icon: ClipboardList, label: "Assignments", path: "/assignments" },
    { icon: BookOpen, label: "Study", path: "/study" },
    { icon: FileText, label: "Notes", path: "/notes" },
    { icon: CalendarClock, label: "Calendar", path: "/calendar" },
    { icon: Navigation, label: "Map", path: "/campus-map" },
    { icon: Sparkles, label: "Ask Bud", path: "/bud" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[24px] bg-card overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Morning Briefing</p>
          </div>
          {weatherData && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chocolate/5">
              <WeatherIcon className="w-3.5 h-3.5 text-chocolate" strokeWidth={2} />
              <span className="text-[11px] font-bold text-chocolate">{weatherData.temperature || weatherData.temp}°</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <GreetingIcon className="w-4 h-4 text-primary" strokeWidth={2} />
          <p className="text-[13px] text-muted-foreground font-medium">{greeting.text}.</p>
        </div>
        <h2 className="text-[20px] font-bold text-foreground tracking-tight leading-tight">Here's your day.</h2>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-2 p-2.5 rounded-[14px] bg-primary/5"
              >
                <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.2} />
                <p className="text-[11px] font-medium text-foreground">{insight.text}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Expand toggle */}
      {hasContent && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-primary border-t border-border/30 active:bg-muted/30 transition-colors"
        >
          {expanded ? "Show less" : "Show full briefing"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2.2} />
        </button>
      )}

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && hasContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-4 border-t border-border/30">
              {/* Today's Classes */}
              {todayClasses.length > 0 && (
                <Section title="Today's Classes" icon={CalendarClock}>
                  <div className="space-y-1.5">
                    {todayClasses.slice(0, 5).map((c) => (
                      <BriefingRow
                        key={c.id}
                        time={c.start_time}
                        title={c.course_code || c.course_name || c.title || "Class"}
                        location={c.location || c.venue || c.room}
                        onClick={() => navigate("/timetable")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Exams Today */}
              {todayExams.length > 0 && (
                <Section title="Exams Today" icon={Award}>
                  <div className="space-y-1.5">
                    {todayExams.map((e) => (
                      <BriefingRow
                        key={e.id}
                        time={e.start_time}
                        title={e.title || e.course_code || "Exam"}
                        location={e.location || e.venue}
                        onClick={() => navigate("/exams")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Assignments Due */}
              {dueAssignments.length > 0 && (
                <Section title="Assignments Due" icon={ClipboardList}>
                  <div className="space-y-1.5">
                    {dueAssignments.slice(0, 4).map((a) => (
                      <BriefingRow
                        key={a.id}
                        title={a.title}
                        time={a.due_date ? formatTime(a.due_date) : null}
                        dateBadge={a.due_date ? new Date(a.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
                        onClick={() => navigate("/assignments")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Calendar */}
              {todayCalendar.length > 0 && (
                <Section title="Calendar" icon={CalendarClock}>
                  <div className="space-y-1.5">
                    {todayCalendar.slice(0, 3).map((c) => (
                      <BriefingRow
                        key={c.id}
                        time={c.start_date ? formatTime(c.start_date) : null}
                        title={c.title || c.summary || "Event"}
                        location={c.location}
                        onClick={() => navigate("/calendar")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Study Sessions */}
              {todayStudy.length > 0 && (
                <Section title="Study Sessions" icon={BookOpen}>
                  <div className="space-y-1.5">
                    {todayStudy.slice(0, 3).map((s) => (
                      <BriefingRow
                        key={s.id}
                        time={s.start_time}
                        title={s.title || s.subject || "Study Session"}
                        location={s.location}
                        onClick={() => navigate("/study-sessions")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Campus Events */}
              {upcomingEvents.length > 0 && (
                <Section title="Campus Events" icon={CalendarClock}>
                  <div className="space-y-1.5">
                    {upcomingEvents.map((e) => (
                      <BriefingRow
                        key={e.id}
                        title={e.title}
                        dateBadge={e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
                        location={e.location}
                        onClick={() => navigate("/events")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Announcements */}
              {activeAnnouncements.length > 0 && (
                <Section title="Announcements" icon={Megaphone}>
                  <div className="space-y-1.5">
                    {activeAnnouncements.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => navigate("/communication")}
                        className="w-full flex items-start gap-2 p-2.5 rounded-[14px] bg-chocolate/5 text-left active:scale-[0.98] transition-transform"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-chocolate flex-shrink-0 mt-0.5" strokeWidth={2.2} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-foreground line-clamp-2">{a.title}</p>
                          {a.content && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{a.content}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Scholarships & Internships */}
              {(deadlineScholarships.length > 0 || deadlineOpps.length > 0) && (
                <Section title="Deadlines" icon={GraduationCap}>
                  <div className="space-y-1.5">
                    {deadlineScholarships.map((s) => (
                      <BriefingRow
                        key={s.id}
                        title={s.title || s.name}
                        subtitle="Scholarship"
                        dateBadge={s.deadline ? new Date(s.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
                        onClick={() => navigate("/scholarships")}
                      />
                    ))}
                    {deadlineOpps.map((o) => (
                      <BriefingRow
                        key={o.id}
                        title={o.title}
                        subtitle="Internship"
                        dateBadge={o.deadline ? new Date(o.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
                        onClick={() => navigate("/opportunities")}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Empty state */}
              {!hasContent && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Sparkles className="w-8 h-8 text-primary/40 mb-2" strokeWidth={1.5} />
                  <p className="text-[12px] text-muted-foreground text-center">Your day looks clear. Ready to study?</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border/30">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-14 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-[14px] bg-chocolate/5 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-chocolate" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function BriefingRow({ time, title, subtitle, location, dateBadge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 p-2.5 rounded-[14px] bg-muted/30 text-left active:scale-[0.98] transition-transform"
    >
      {time && (
        <span className="text-[10px] font-bold text-primary tabular-nums flex-shrink-0 w-10">{time}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground truncate">{title}</p>
        {subtitle && <p className="text-[9px] text-muted-foreground">{subtitle}</p>}
        {location && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2} />
            <p className="text-[9px] text-muted-foreground truncate">{location}</p>
          </div>
        )}
      </div>
      {dateBadge && (
        <span className="text-[9px] font-bold text-chocolate px-2 py-0.5 rounded-full bg-chocolate/10 flex-shrink-0">
          {dateBadge}
        </span>
      )}
    </button>
  );
}