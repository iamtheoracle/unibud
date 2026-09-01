import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Flame, TrendingUp } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function StudyStreakCard() {
  const { isDemoMode } = useDemoMode();
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  const { data: sessions } = useQuery({
    queryKey: ["streakSessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 30),
    enabled: !isDemoMode,
  });

  const sessionDates = (sessions || []).filter((s) => s.session_date).map((s) => s.session_date);
  const uniqueDates = new Set(sessionDates);

  let streak = 0;
  if (isDemoMode) {
    streak = 5;
  } else {
    const todayStr = new Date().toISOString().split("T")[0];
    let checkDate = todayStr;
    const sortedDates = [...uniqueDates].sort().reverse();
    for (let i = 0; i < sortedDates.length; i++) {
      if (sortedDates[i] === checkDate) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split("T")[0];
      } else if (sortedDates[i] < checkDate) {
        break;
      }
    }
  }

  const weekData = isDemoMode
    ? [true, true, true, true, true, false, false]
    : days.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (todayIdx - i));
        return uniqueDates.has(d.toISOString().split("T")[0]);
      });

  return (
    <GlassCard variant="solid" className="p-4" delay={0.1}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-lg leading-tight">{streak} {streak === 1 ? "Day" : "Days"}</p>
            <p className="text-[11px] text-muted-foreground">Study streak</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 border border-success/20">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-[10px] font-semibold text-success">Active</span>
          </div>
        )}
      </div>
      <div className="flex gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={"w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all " + (
              weekData[i]
                ? "bg-gradient-to-b from-warning to-destructive text-white shadow-sm"
                : i === todayIdx
                ? "bg-warning/10 text-warning border border-warning/20 border-dashed"
                : "bg-muted/60 text-muted-foreground"
            )}>
              {weekData[i] ? "🔥" : ""}
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}