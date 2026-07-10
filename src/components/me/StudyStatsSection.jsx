import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Clock, Flame, BookOpen, Zap, Trophy, TrendingUp,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function StudyStatsSection() {
  const { isDemoMode } = useDemoMode();

  const { data: sessions } = useQuery({
    queryKey: ["studySessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
    enabled: !isDemoMode,
  });
  const { data: goals } = useQuery({
    queryKey: ["studyGoals"],
    queryFn: () => base44.entities.StudyGoal.list("-created_date", 10),
    enabled: !isDemoMode,
  });

  const totalHours = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const totalSessions = sessions?.length || 0;
  const avgProductivity = totalSessions > 0
    ? Math.round((sessions || []).reduce((sum, s) => sum + (s.productivity_score || 0), 0) / totalSessions)
    : 0;

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

  const xp = isDemoMode ? 240 : (goals?.[0]?.experience_points || 0);

  const stats = isDemoMode
    ? [
        { icon: Clock, label: "Study Hours", value: "29h", color: "text-info", bg: "bg-info/10", delay: 0.1 },
        { icon: Flame, label: "Day Streak", value: 12, color: "text-warning", bg: "bg-warning/10", delay: 0.15 },
        { icon: BookOpen, label: "Sessions", value: 48, color: "text-success", bg: "bg-success/10", delay: 0.2 },
        { icon: Zap, label: "Avg Score", value: 75, color: "text-primary", bg: "bg-primary/10", delay: 0.25 },
      ]
    : [
        { icon: Clock, label: "Study Hours", value: totalHours.toFixed(1) + "h", color: "text-info", bg: "bg-info/10", delay: 0.1 },
        { icon: Flame, label: "Day Streak", value: streak, color: "text-warning", bg: "bg-warning/10", delay: 0.15 },
        { icon: BookOpen, label: "Sessions", value: totalSessions, color: "text-success", bg: "bg-success/10", delay: 0.2 },
        { icon: Zap, label: "Avg Score", value: avgProductivity, color: "text-primary", bg: "bg-primary/10", delay: 0.25 },
      ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <GlassCard key={i} variant="solid" className="p-2.5 text-center" delay={s.delay}>
            <div className={"w-8 h-8 rounded-[12px] " + s.bg + " flex items-center justify-center mx-auto mb-1.5"}>
              <s.icon className={"w-4 h-4 " + s.color} strokeWidth={2.2} />
            </div>
            <p className="font-heading font-bold text-[13px] text-foreground">{s.value}</p>
            <p className="text-[7px] text-muted-foreground mt-0.5">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard variant="solid" className="p-4" delay={0.3}>
        <div className="flex items-center gap-4">
          <CircularProgressRing value={xp % 100} size={72} strokeWidth={6} color="hsl(var(--primary))" label={String(xp)} sublabel="XP" delay={0.35} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Level Progress</span>
            </div>
            <p className="font-heading font-bold text-[14px] text-foreground">Level {Math.floor(xp / 100) + 1}</p>
            <p className="text-[10px] text-muted-foreground">{100 - (xp % 100)} XP to next level</p>
            {isDemoMode && (
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-[10px] font-semibold text-success">Top 15% of students</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}