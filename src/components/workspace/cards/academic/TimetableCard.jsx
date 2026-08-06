import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { useAcademicCalendar } from "@/lib/academic/useAcademicData";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function TimetableCard() {
  const { data: calendar, isLoading } = useAcademicCalendar();

  if (isLoading) return <ListSkeleton rows={2} />;

  const upcoming = (calendar || []).slice(0, 3);

  if (upcoming.length === 0) {
    return <p className="text-[12px] text-muted-foreground py-2">No upcoming schedule entries.</p>;
  }

  return (
    <div className="space-y-3">
      {upcoming.map((entry, i) => (
        <Link key={i} to="/timetable" className="flex items-center gap-3 spring-tap">
          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{entry.title || entry.code || "Class"}</p>
            <p className="text-[11px] text-muted-foreground">{entry.day || ""} {entry.start || ""}{entry.room ? ` · ${entry.room}` : ""}</p>
          </div>
        </Link>
      ))}
      <Link to="/timetable" className="block text-[12px] font-medium text-primary pt-1">
        Full schedule →
      </Link>
    </div>
  );
}