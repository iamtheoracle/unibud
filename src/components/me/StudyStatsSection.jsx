import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Clock, Flame, BookOpen, CheckCircle2, Award, Heart,
  Users, GraduationCap, Zap, TrendingUp, Calendar, Trophy,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";

export default function StudyStatsSection() {
  const { data: sessions } = useQuery({
    queryKey: ["studySessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
  });

  const { data: goals } = useQuery({
    queryKey: ["studyGoals"],
    queryFn: () => base44.entities.StudyGoal.list("-created_date", 10),
  });

  const totalHours = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const totalSessions = sessions?.length || 0;
  const avgProductivity = totalSessions > 0
    ? Math.round((sessions || []).reduce((sum, s) => sum + (s.productivity_score || 0), 0) / totalSessions)
    : 75;
  const currentStreak = goals?.[0]?.streak_days || 12;
  const xp = goals?.[0]?.experience_points || 240;

  const stats = [
    { icon: Clock, label: "Study Hours", value: `${totalHours.toFixed(1)}h`, color: "text-info", bg: "bg-info/10", delay: 0.1 },
    { icon: Flame, label: "Day Streak", value: currentStreak, color: "text-warning", bg: "bg-warning/10", delay: 0.15 },
    { icon: BookOpen, label: "Sessions", value: totalSessions, color: "text-success", bg: "bg-success/10", delay: 0.2 },
    { icon: Zap, label: "Avg Score", value: avgProductivity, color: "text-primary", bg: "bg-primary/10", delay: 0.25 },
  ];

  const activityStats = [
    { icon: CheckCircle2, label: "Assignments Done", value: 24, color: "text-success", delay: 0.3 },
    { icon: GraduationCap, label: "Exams Passed", value: 8, color: "text-primary", delay: 0.35 },
    { icon: Heart, label: "Volunteer Hours", value: 24, color: "text-error", delay: 0.4 },
    { icon: Users, label: "Mentorship", value: 3, color: "text-info", delay: 0.45 },
    { icon: Calendar, label: "Events Attended", value: 12, color: "text-purple", delay: 0.5 },
    { icon: Trophy, label: "Traditions", value: 5, color: "text-warning", delay: 0.55 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <GlassCard key={i} variant="solid" className="p-2.5 text-center" delay={s.delay}>
            <div className={`w-8 h-8 rounded-[12px] ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={2.2} />
            </div>
            <p className="font-heading font-bold text-[13px] text-foreground">{s.value}</p>
            <p className="text-[7px] text-muted-foreground mt-0.5">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard variant="solid" className="p-4" delay={0.3}>
        <div className="flex items-center gap-4">
          <CircularProgressRing value={xp % 100} size={72} strokeWidth={6} color="hsl(var(--primary))" label={`${xp}`} sublabel="XP" delay={0.35} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Level Progress</span>
            </div>
            <p className="font-heading font-bold text-[14px] text-foreground">Level {Math.floor(xp / 100) + 1}</p>
            <p className="text-[10px] text-muted-foreground">{100 - (xp % 100)} XP to next level</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-[10px] font-semibold text-success">Top 15% of students</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-2">
        {activityStats.map((s, i) => (
          <GlassCard key={i} variant="solid" className="p-3 text-center" delay={s.delay}>
            <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} strokeWidth={2.2} />
            <p className="font-heading font-bold text-[15px] text-foreground">{s.value}</p>
            <p className="text-[7px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}