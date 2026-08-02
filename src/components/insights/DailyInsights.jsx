import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import {
  Sparkles, TrendingUp, Flame, Target, Award, BookOpen, ArrowRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

function dayLabels() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("en", { weekday: "short" }).slice(0, 1));
  }
  return days;
}

/**
 * DailyInsights — AI-generated daily summary with study analytics,
 * productivity insights, achievement tracking, and trending content.
 * Aggregates real data from study sessions, tasks, and achievements.
 */
export default function DailyInsights() {
  const { data: sessions } = useQuery({
    queryKey: ["insights-sessions"],
    queryFn: () => base44.entities.StudySession.list("-created_date", 50),
    staleTime: 120000,
  });

  const { data: tasks } = useQuery({
    queryKey: ["insights-tasks"],
    queryFn: () => base44.entities.TaskManagement.filter({ status: "completed" }, "-updated_date", 20),
    staleTime: 120000,
  });

  const { data: achievements } = useQuery({
    queryKey: ["insights-achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-created_date", 5),
    staleTime: 300000,
  });

  const { data: trending } = useQuery({
    queryKey: ["insights-trending"],
    queryFn: () => base44.entities.QuadPost.list("-likes_count", 5),
    staleTime: 120000,
  });

  // Build 7-day study chart
  const chartData = React.useMemo(() => {
    const labels = dayLabels();
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    (sessions || []).forEach((s) => {
      if (!s.created_date) return;
      const d = new Date(s.created_date);
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) {
        buckets[6 - diff] += (s.duration_minutes || s.minutes || 0);
      }
    });
    return labels.map((label, i) => ({ label, minutes: buckets[i] }));
  }, [sessions]);

  const totalMinutes = chartData.reduce((a, d) => a + d.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const tasksDone = (tasks || []).length;
  const streak = (sessions || []).length > 0 ? Math.min(7, Math.ceil((sessions || []).length / 2)) : 0;

  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Insights
        </span>
      </div>

      {/* AI Summary Card */}
      <div className="bg-card border border-border rounded-2xl p-5 premium-shadow mb-3">
        <p className="text-[15px] font-medium text-foreground leading-snug mb-3">
          {totalHours > 0
            ? `You studied ${totalHours}h this week and completed ${tasksDone} task${tasksDone !== 1 ? "s" : ""}. ${streak >= 3 ? "Great streak — keep it going!" : "Build momentum with a session today."}`
            : "No study sessions logged this week. Start a focused session to see your insights grow."}
        </p>

        {/* 7-day bar chart */}
        {totalMinutes > 0 && (
          <div className="h-[80px] -mx-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <InsightTile icon={BookOpen} label="Study time" value={`${totalHours}h`} to="/study-sessions" />
        <InsightTile icon={Target} label="Tasks done" value={`${tasksDone}`} to="/tasks" />
        <InsightTile icon={Flame} label="Day streak" value={`${streak}`} to="/study-sessions" />
      </div>

      {/* Achievements */}
      {(achievements || []).length > 0 && (
        <Link to="/me" className="block spring-tap group mb-3">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gold/10 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-gold" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">Recent achievement</p>
              <p className="text-[12px] text-muted-foreground truncate">
                {(achievements || [])[0]?.title || "View your badges"}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" strokeWidth={1.8} />
          </div>
        </Link>
      )}

      {/* Trending */}
      {(trending || []).length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Trending on campus
            </span>
          </div>
          <div className="space-y-1.5">
            {(trending || []).slice(0, 3).map((post, i) => (
              <Link key={post.id || i} to="/square" className="block spring-tap">
                <div className="flex items-center gap-2.5 py-2 px-1">
                  <span className="text-[11px] font-bold text-muted-foreground/50 tabular-nums w-4">
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-foreground flex-1 truncate">
                    {post.content?.slice(0, 60) || "Campus post"}
                  </p>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {post.likes_count || 0} ♥
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function InsightTile({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="bg-card border border-border rounded-[16px] p-3 spring-tap group hover:border-primary/30 transition-colors">
      <Icon className="w-3.5 h-3.5 text-primary mb-1.5" strokeWidth={2} />
      <p className="text-[16px] font-bold text-foreground leading-tight tracking-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground truncate">{label}</p>
    </Link>
  );
}