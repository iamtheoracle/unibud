import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, Tooltip } from "recharts";
import { TrendingUp, Clock, Star, BarChart3, Eye, Zap } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function AnalyticsSection({ user, isOwnProfile }) {
  const { data: sessions = [] } = useQuery({
    queryKey: ["me", "analytics-sessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["me", "analytics-grades"],
    queryFn: () => base44.entities.Grade.list("-created_date", 20),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["me", "analytics-posts"],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: trustScore } = useQuery({
    queryKey: ["me", "analytics-trust"],
    queryFn: () => base44.entities.TrustScore.list("-created_date", 1),
  });

  // Study hours per day (last 7 days)
  const studyData = React.useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const dayMap = {};
    days.forEach((d) => (dayMap[d] = 0));
    (sessions || []).forEach((s) => {
      if (!s.session_date) return;
      const d = new Date(s.session_date);
      const diff = Math.floor((weekStart - d) / 86400000);
      if (diff >= 0 && diff < 7) dayMap[days[6 - diff]] += (s.duration_minutes || 0) / 60;
    });
    return days.map((day) => ({ day, hours: Math.round(dayMap[day] * 10) / 10 }));
  }, [sessions]);

  // Grade trend
  const gradeData = React.useMemo(() => {
    return (grades || [])
      .filter((g) => g.semester)
      .slice(-6)
      .map((g) => ({ semester: g.semester, gpa: g.grade_point || g.score || 0 }));
  }, [grades]);

  const totalStudyHours = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const totalEngagement = (posts || []).reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);
  const contribution = trustScore?.[0]?.contribution_score || 0;
  const reputation = trustScore?.[0]?.score || 0;

  const stats = [
    { icon: Clock, label: "Study Hours", value: totalStudyHours.toFixed(1) + "h", color: "text-information", bg: "bg-information/10" },
    { icon: Eye, label: "Engagement", value: totalEngagement, color: "text-success", bg: "bg-success/10" },
    { icon: Star, label: "Reputation", value: reputation, color: "text-warning", bg: "bg-warning/10" },
    { icon: Zap, label: "Contribution", value: contribution, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <GlassCard key={i} variant="solid" className="p-2.5 text-center" delay={i * 0.05}>
            <div className={`w-8 h-8 rounded-[12px] ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={2.2} />
            </div>
            <p className="font-heading font-bold text-[13px] text-foreground">{s.value}</p>
            <p className="text-[7px] text-muted-foreground mt-0.5">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Study time chart */}
      <GlassCard variant="solid" className="p-4" delay={0.2}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">Weekly Study Hours</span>
        </div>
        {studyData.some((d) => d.hours > 0) ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={studyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[11px] text-muted-foreground py-6 text-center">No study sessions logged this week</p>
        )}
      </GlassCard>

      {/* Grade trend */}
      {gradeData.length > 0 && (
        <GlassCard variant="solid" className="p-4" delay={0.3}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span className="text-[12px] font-semibold text-foreground">Grade Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={gradeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="semester" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="gpa" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--success))" }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
}