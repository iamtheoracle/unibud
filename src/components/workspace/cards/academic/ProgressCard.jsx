import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function ProgressCard() {
  const { data: grades, isLoading } = useQuery({
    queryKey: ["card-progress"],
    queryFn: () => base44.entities.Grade.list("-created_date", 6),
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!grades || grades.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No grades recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grades.slice(0, 4).map((g) => (
        <Link key={g.id} to="/academics/results" className="flex items-center gap-2.5 spring-tap">
          <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">
              {g.course_code || g.course_name || "Course"}
            </p>
            <p className="text-[11px] text-muted-foreground">{g.semester || ""}</p>
          </div>
          <span className="text-[14px] font-bold text-primary tabular-nums">
            {g.letter_grade || g.grade || "—"}
          </span>
        </Link>
      ))}
      <Link to="/academics/results" className="block text-[12px] font-medium text-primary pt-1">
        Full academic report →
      </Link>
    </div>
  );
}