import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useExams } from "@/lib/academic/useAcademicData";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function ExamsCard() {
  const { data: exams, isLoading } = useExams();

  if (isLoading) return <ListSkeleton rows={2} />;

  const upcoming = (exams || []).filter((e) => new Date(e.date || e.start_time || "") >= new Date()).slice(0, 3);

  if (upcoming.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <AlertCircle className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No upcoming exams. Keep studying!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((e, i) => {
        const examDate = new Date(e.date || e.start_time || "");
        const days = Math.ceil((examDate - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <Link key={i} to="/exams" className="flex items-center gap-3 spring-tap">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 grid place-items-center shrink-0">
              <span className="text-[10px] font-bold text-destructive">{days <= 0 ? "!" : days + "d"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{e.title || e.course_code || "Exam"}</p>
              <p className="text-[11px] text-muted-foreground">
                {examDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {e.start_time ? ` · ${e.start_time}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
      <Link to="/exams" className="block text-[12px] font-medium text-primary pt-1">
        All exams →
      </Link>
    </div>
  );
}