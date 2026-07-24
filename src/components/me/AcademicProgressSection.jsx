import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp, Flame, Clock, Brain, GraduationCap,
  CheckCircle2, BookOpen, Award, Sparkles, ChevronRight,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar } from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";
import EmptyState from "@/components/ui/EmptyState";
import StreakShowcase from "@/components/me/StreakShowcase";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_GPA_TREND = [
  { semester: "100·1", gpa: 3.8 }, { semester: "100·2", gpa: 3.9 },
  { semester: "200·1", gpa: 4.1 }, { semester: "200·2", gpa: 4.0 },
  { semester: "300·1", gpa: 4.2 }, { semester: "300·2", gpa: 4.35 },
];

const DEMO_WEEKLY_HOURS = [
  { day: "Mon", hours: 4.5 }, { day: "Tue", hours: 3 },
  { day: "Wed", hours: 5.5 }, { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 6 }, { day: "Sat", hours: 4 }, { day: "Sun", hours: 3.5 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function AcademicProgressSection() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const { data: sessions } = useQuery({
    queryKey: ["meStudySessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
    enabled: !isDemoMode,
  });
  const { data: grades } = useQuery({
    queryKey: ["meGrades"],
    queryFn: () => base44.entities.Grade.list("-created_date", 20),
    enabled: !isDemoMode,
  });

  const { data: budInsight, isLoading: insightLoading } = useQuery({
    queryKey: ["budMeInsight"],
    queryFn: () =>
      base44.integrations.Core.InvokeLLM({
        prompt: "You are Bud, a supportive mentor. Give a brief encouraging insight about the student's academic progress. Keep it to 2 warm sentences. Be generic but warm since no specific data is available yet.",
        response_json_schema: { type: "object", properties: { insight: { type: "string" }, action: { type: "string" } } },
      }),
    staleTime: 300000,
    enabled: !isDemoMode,
  });

  const totalHours = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const totalSessions = sessions?.length || 0;
  const avgProductivity = totalSessions > 0 ? Math.round((sessions || []).reduce((sum, s) => sum + (s.productivity_score || 0), 0) / totalSessions) : 0;

  const sessionDates = (sessions || []).filter((s) => s.session_date).map((s) => s.session_date);
  const uniqueDates = [...new Set(sessionDates)].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let checkDate = today;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else if (uniqueDates[i] < checkDate) {
      break;
    }
  }

  const weeklyData = isDemoMode
    ? DEMO_WEEKLY_HOURS
    : (() => {
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
          if (diff >= 0 && diff < 7) {
            dayMap[days[6 - diff]] += (s.duration_minutes || 0) / 60;
          }
        });
        return days.map((day) => ({ day, hours: Math.round(dayMap[day] * 10) / 10 }));
      })();

  if (!isDemoMode && totalSessions === 0 && (!grades || grades.length === 0)) {
    return (
      <GlassCard variant="solid" className="p-6" delay={0.05}>
        <EmptyState
          icon={GraduationCap}
          title="No academic data yet"
          description="Your study sessions, grades, and progress will appear here as you start using UNIBUD"
          action={
            <button onClick={() => navigate("/study-session")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
              <Clock className="w-3.5 h-3.5" /> Start Study Session
            </button>
          }
        />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Study hours + Streak */}
      <GlassCard variant="solid" className="p-4" delay={0.05}>
        <div className="flex items-center gap-2 mb-1.5">
          <Clock className="w-3.5 h-3.5 text-info" />
          <span className="text-[11px] font-semibold text-foreground">Study Hours</span>
        </div>
        <p className="font-heading font-bold text-[20px] text-foreground">{isDemoMode ? "29h" : totalHours.toFixed(1) + "h"}</p>
        <p className="text-[9px] text-muted-foreground mb-1.5">{isDemoMode ? "this week" : "total"}</p>
        {weeklyData.some((d) => d.hours > 0) && (
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="hours" fill="hsl(var(--unibud-blue))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      <StreakShowcase
        streak={isDemoMode ? 12 : streak}
        sessionDates={isDemoMode ? [] : sessionDates}
        delay={0.1}
      />

      {/* Sessions count */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard variant="solid" className="p-3.5 flex items-center gap-3" delay={0.15}>
          <div className="w-10 h-10 rounded-[14px] bg-info/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="font-heading font-bold text-[16px] text-foreground">{isDemoMode ? 48 : totalSessions}</p>
            <p className="text-[9px] text-muted-foreground">sessions logged</p>
          </div>
        </GlassCard>
        <GlassCard variant="solid" className="p-3.5 flex items-center gap-3" delay={0.2}>
          <div className="w-10 h-10 rounded-[14px] bg-success/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-heading font-bold text-[16px] text-foreground">{isDemoMode ? 75 : avgProductivity}</p>
            <p className="text-[9px] text-muted-foreground">avg productivity</p>
          </div>
        </GlassCard>
      </div>

      {/* Bud Insight */}
      <GlassCard variant="solid" className="p-4 border-primary/20" delay={0.25}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[13px] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-heading font-semibold text-[12px] text-foreground">Bud's Learning Insight</span>
            </div>
            {insightLoading && !isDemoMode ? (
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full shimmer" />
                <div className="h-2.5 w-4/5 rounded-full shimmer" />
              </div>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {isDemoMode ? "You're progressing well! Your CGPA improved by 0.15 this semester. Keep your streak alive!" : (budInsight?.insight || "Start a study session to get personalized insights from Bud.")}
                </p>
                {budInsight?.action && <p className="text-[11px] text-primary font-medium mt-1">→ {budInsight.action}</p>}
                <button onClick={() => navigate("/bud")} className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">
                  <Sparkles className="w-3 h-3" /> Ask Bud
                </button>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}