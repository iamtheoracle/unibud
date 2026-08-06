import React from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useTodaySchedule } from "@/lib/academic/useAcademicData";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function TodayScheduleCard() {
  const { data: today, isLoading } = useTodaySchedule();

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!today || today.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground py-2">No classes today. Perfect for deep work.</p>
    );
  }

  return (
    <div className="space-y-3">
      {today.slice(0, 4).map((s, i) => (
        <Link key={i} to="/timetable" className="flex items-center gap-3 spring-tap group">
          <div className="flex items-center gap-1.5 w-16 shrink-0">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[12px] font-semibold text-foreground tabular-nums">{s.start}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{s.code}</p>
            <p className="text-[11px] text-muted-foreground truncate">{s.title}{s.room ? ` · ${s.room}` : ""}</p>
          </div>
        </Link>
      ))}
      {today.length > 4 && (
        <Link to="/timetable" className="block text-[12px] font-medium text-primary pt-1">
          View all {today.length} classes →
        </Link>
      )}
    </div>
  );
}