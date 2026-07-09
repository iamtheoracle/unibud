import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Flame, TrendingUp } from "lucide-react";

export default function StudyStreakCard() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const streakData = [true, true, true, true, true, false, false];
  const today = new Date().getDay();

  return (
    <GlassCard variant="solid" className="p-4" delay={0.1}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-lg leading-tight">5 Days</p>
            <p className="text-[11px] text-muted-foreground">Study streak</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-semibold text-emerald-700">+12%</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
              streakData[i]
                ? "bg-gradient-to-b from-orange-400 to-red-500 text-white shadow-sm"
                : i === (today === 0 ? 6 : today - 1)
                ? "bg-orange-100 text-orange-500 border border-orange-200 border-dashed"
                : "bg-muted/60 text-muted-foreground"
            }`}>
              {streakData[i] ? "🔥" : ""}
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}