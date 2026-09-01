import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Award } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function GPASummaryCard() {
  const { isDemoMode } = useDemoMode();

  const { data: grades } = useQuery({
    queryKey: ["gpaGrades"],
    queryFn: () => base44.entities.Grade.list("-created_date", 50),
    enabled: !isDemoMode,
  });
  const { data: courses } = useQuery({
    queryKey: ["gpaCourses"],
    queryFn: () => base44.entities.Course.list(),
    enabled: !isDemoMode,
  });

  const validGrades = (grades || []).filter((g) => g.grade_value != null && g.max_grade != null && g.max_grade > 0);
  const gpa = isDemoMode ? 4.2 : validGrades.length > 0
    ? (validGrades.reduce((sum, g) => sum + (g.grade_value / g.max_grade) * 5, 0) / validGrades.length)
    : 0;
  const maxGpa = 5.0;
  const progress = (gpa / maxGpa) * 100;
  const totalCredits = isDemoMode ? 24 : validGrades.reduce((sum, g) => sum + (g.credit_hours || 0), 0);
  const courseCount = isDemoMode ? 6 : (courses?.length || 0);

  return (
    <GlassCard variant="solid" className="p-4" delay={0.15}>
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="url(#gpaGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={progress * 1.508 + " 150.8"}
            />
            <defs>
              <linearGradient id="gpaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--unibud-blue))" />
                <stop offset="100%" stopColor="hsl(var(--unibud-purple))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading font-bold text-sm">{isDemoMode ? gpa.toFixed(1) : gpa.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            <p className="font-heading font-semibold text-[13px]">Current GPA</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {gpa > 0 ? "Out of " + maxGpa : "No grades logged yet"}
          </p>
          <div className="flex gap-3 mt-2">
            <div className="text-center">
              <p className="font-heading font-bold text-[13px] text-success">{totalCredits}</p>
              <p className="text-[9px] text-muted-foreground">Credits</p>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-[13px]">{courseCount}</p>
              <p className="text-[9px] text-muted-foreground">Courses</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}