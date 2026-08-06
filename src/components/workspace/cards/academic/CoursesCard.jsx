import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useCourses } from "@/lib/academic/useAcademicData";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function CoursesCard() {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!courses || courses.length === 0) {
    return <p className="text-[12px] text-muted-foreground py-2">No courses registered yet.</p>;
  }

  return (
    <div className="space-y-3">
      {courses.slice(0, 4).map((c) => (
        <Link key={c.id || c.code} to={`/course/${c.id || c.code}`} className="flex items-center gap-3 spring-tap">
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{c.code} — {c.title}</p>
            <p className="text-[11px] text-muted-foreground">{c.credits || c.units || 3} credits</p>
          </div>
        </Link>
      ))}
      <Link to="/courses" className="block text-[12px] font-medium text-primary pt-1">
        All courses →
      </Link>
    </div>
  );
}