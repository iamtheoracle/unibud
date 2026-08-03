import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, GraduationCap, Calendar, ClipboardList, Award, ChevronRight,
} from "lucide-react";
import AcademicProgressSection from "@/components/me/AcademicProgressSection";
import AcademicTimelinePreview from "@/components/me/AcademicTimelinePreview";
import LearningInsights from "@/components/me/LearningInsights";
import GoalsSection from "@/components/me/GoalsSection";

const QUICK_LINKS = [
  { label: "Courses", to: "/courses", icon: BookOpen },
  { label: "Results", to: "/academics/results", icon: GraduationCap },
  { label: "Attendance", to: "/attendance", icon: Calendar },
  { label: "Assignments", to: "/assignments", icon: ClipboardList },
  { label: "Timetable", to: "/timetable", icon: Calendar },
  { label: "Exams", to: "/exams", icon: Award },
];

export default function AcademicsSection({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const { data: sessions = [] } = useQuery({
    queryKey: ["me", "studySessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["me", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 50),
  });

  return (
    <div className="space-y-4">
      {/* Academic progress — GPA, study hours, weekly chart */}
      <AcademicProgressSection />

      {/* Quick links grid */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground tracking-tight mb-2.5 px-1">Quick Access</h3>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.to)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-card shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-[13px] bg-chocolate/10 flex items-center justify-center">
                <link.icon className="w-4.5 h-4.5 text-chocolate" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-bold text-foreground">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Academic timeline */}
      <AcademicTimelinePreview user={user} />

      {/* Learning insights */}
      <LearningInsights sessions={sessions} courses={courses} />

      {/* Goals */}
      <GoalsSection />
    </div>
  );
}