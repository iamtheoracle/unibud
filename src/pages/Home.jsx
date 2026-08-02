import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, ChevronRight,
  Clock, AlertCircle, TrendingUp, CalendarDays, BookOpen, ClipboardList, Bell,
  ArrowRight, FlaskConical, Briefcase, Wallet,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAcademicData } from "@/lib/academic/useAcademicData";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { queryClientInstance } from "@/lib/query-client";
import PullToRefresh from "@/components/ui/PullToRefresh";
import FloatingSearch from "@/components/home/FloatingSearch";
import BudHeroCard from "@/components/home/BudHeroCard";
import HomeWeatherCompact from "@/components/home/HomeWeatherCompact";

const EASE = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function dueLabel(days) {
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function getBudInsight(nextClass, nextDeadline, dueCount) {
  if (nextDeadline && nextDeadline.dueInDays <= 1) {
    return `"${nextDeadline.title}" is due ${nextDeadline.dueInDays === 0 ? "today" : "tomorrow"}. I can help you prepare.`;
  }
  if (dueCount > 0) {
    return `You have ${dueCount} assignments pending. Let's tackle them together.`;
  }
  if (nextClass) {
    return `Your next class ${nextClass.code} starts at ${nextClass.start}. Ready?`;
  }
  return "You're all caught up. A perfect time to get ahead.";
}

const SMART_SUGGESTIONS = [
  { icon: CalendarDays, title: "Plan your study week", desc: "Bud builds a personalized schedule", prompt: "Help me plan my study week based on my assignments and exams" },
  { icon: BookOpen, title: "Prepare for exams", desc: "Revision schedules and practice questions", prompt: "Help me prepare for my upcoming exams" },
  { icon: TrendingUp, title: "Review your progress", desc: "Insights on your academic performance", prompt: "Review my academic progress and give me insights" },
];

const QUICK_LINKS = [
  { to: "/courses", icon: BookOpen, label: "Courses", emoji: "📚" },
  { to: "/connect", icon: Sparkles, label: "Connect", emoji: "💬" },
  { to: "/campus", icon: FlaskConical, label: "Campus", emoji: "🏫" },
  { to: "/career", icon: Briefcase, label: "Career", emoji: "💼" },
  { to: "/marketplace", icon: ClipboardList, label: "Market", emoji: "🛒" },
  { to: "/wallet", icon: Wallet, label: "Wallet", emoji: "💰" },
];

/**
 * Home — the premium AI OS daily briefing.
 * Bud is the hero, placed naturally inside the page.
 * Layout: Greeting → Search → Bud Card → What's Next → Smart Suggestions →
 *         Today's Schedule → Recent Activity → Campus Updates → Quick Links
 */
export default function Home() {
  const { nextClass, nextDeadline, gpa, today, loading } = useAcademicData();
  const { openWithPrompt } = useBudLauncher();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: assignments } = useQuery({
    queryKey: ["home-assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 10),
    staleTime: 60000,
  });
  const { data: notifications } = useQuery({
    queryKey: ["home-notifs"],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, "-created_date", 5),
    staleTime: 30000,
  });

  const refreshHome = async () => {
    await queryClientInstance.invalidateQueries();
  };

  const dueCount = (assignments || []).filter(
    (a) => a.status === "pending" || a.status === "in_progress"
  ).length;

  const firstName = (user?.full_name || "Scholar").split(" ")[0];
  const notifCount = (notifications || []).length;
  const budInsight = getBudInsight(nextClass, nextDeadline, dueCount);

  const recentActivity = (assignments || [])
    .filter((a) => a.status === "submitted" || a.status === "graded")
    .slice(0, 3);

  return (
    <PullToRefresh onRefresh={refreshHome}>
      <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
        {/* 1. Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6"
        >
          <p className="text-[13px] text-muted-foreground font-medium">{greeting()}, {firstName}</p>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight mt-0.5">Today</h1>
          <p className="text-[12px] text-muted-foreground/70 mt-1.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        {/* 2. Search */}
        <FloatingSearch />

        {/* 3. Bud Hero Card — the intelligent face of UNIBUD */}
        <div className="mt-6">
          <BudHeroCard firstName={firstName} insight={budInsight} />
        </div>

        {/* 4. What's Next */}
        <section className="mt-10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">What's Next</span>
          <div className="grid grid-cols-2 gap-3">
            <NextCard
              to="/timetable"
              icon={Clock}
              label="Next Class"
              title={loading ? "—" : nextClass ? nextClass.code : "Free"}
              sub={loading ? "…" : nextClass ? `${nextClass.start} · ${nextClass.room || ""}` : "No classes today"}
            />
            <NextCard
              to="/assignments"
              icon={AlertCircle}
              label="Due"
              title={loading ? "—" : dueCount > 0 ? `${dueCount}` : "None"}
              sub={loading ? "…" : nextDeadline ? dueLabel(nextDeadline.dueInDays) : "All caught up"}
            />
          </div>
        </section>

        {/* 5. Smart Suggestions */}
        <section className="mt-10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Smart Suggestions</span>
          <div className="divide-y divide-border border-t border-b border-border">
            {SMART_SUGGESTIONS.map((s) => (
              <SuggestionRow
                key={s.title}
                icon={s.icon}
                title={s.title}
                desc={s.desc}
                onClick={() => openWithPrompt(s.prompt)}
              />
            ))}
          </div>
        </section>

        {/* 6. Today's Schedule */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Schedule</span>
            <Link to="/timetable" className="text-[12px] font-medium text-primary spring-tap">Full schedule</Link>
          </div>
          <div className="divide-y divide-border border-t border-b border-border">
            {loading ? (
              <div className="py-5"><div className="h-5 rounded shimmer" /></div>
            ) : today && today.length > 0 ? (
              today.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <p className="text-[13px] font-semibold text-foreground tabular-nums w-14 shrink-0">{s.start}</p>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-foreground truncate">{s.code}</p>
                    <p className="text-[12px] text-muted-foreground truncate">{s.title}{s.room ? ` · ${s.room}` : ""}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-5">
                <p className="text-[14px] text-muted-foreground">No classes today — perfect for deep work.</p>
              </div>
            )}
          </div>
        </section>

        {/* 7. Recent Activity */}
        {recentActivity.length > 0 && (
          <section className="mt-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Recent Activity</span>
            <div className="divide-y divide-border border-t border-b border-border">
              {recentActivity.map((a) => (
                <Link key={a.id} to="/assignments" className="flex items-center gap-3 py-4 spring-tap group">
                  <ClipboardList className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{a.course_code}{a.status ? ` · ${a.status}` : ""}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 8. Campus Updates */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Campus Updates</span>
            <Link to="/notifications" className="text-[12px] font-medium text-primary spring-tap">
              {notifCount > 0 ? `${notifCount} new` : "View all"}
            </Link>
          </div>
          <div className="divide-y divide-border border-t border-b border-border">
            {notifCount > 0 ? (
              (notifications || []).slice(0, 3).map((n) => (
                <Link key={n.id} to={n.link || "/notifications"} className="flex items-center gap-3 py-4 spring-tap group">
                  <Bell className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-foreground truncate">{n.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{n.message}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
                </Link>
              ))
            ) : (
              <div className="py-5">
                <p className="text-[14px] text-muted-foreground">No new updates. You're all caught up.</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Links — domain navigation */}
        <section className="mt-10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Explore</span>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LINKS.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex flex-col items-center gap-2 py-4 glass rounded-2xl spring-tap transition-colors group"
                >
                  <span className="text-[24px] leading-none">{q.emoji}</span>
                  <span className="text-[12px] font-medium text-muted-foreground">{q.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Weather */}
        <div className="mt-10">
          <HomeWeatherCompact />
        </div>
      </div>
    </PullToRefresh>
  );
}

function NextCard({ to, icon: Icon, label, title, sub }) {
  return (
    <Link to={to} className="glass rounded-2xl p-4 spring-tap hover:shadow-premium transition-shadow group">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="text-[18px] font-bold text-foreground leading-tight tracking-tight">{title}</p>
      <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{sub}</p>
    </Link>
  );
}

function SuggestionRow({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 py-4 w-full text-left spring-tap group">
      <div className="w-9 h-9 rounded-xl glass grid place-items-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
    </button>
  );
}