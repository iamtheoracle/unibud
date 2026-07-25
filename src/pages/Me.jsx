import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProfileHeader from "@/components/me/ProfileHeader";
import AcademicSummary from "@/components/me/AcademicSummary";
import LearningInsights from "@/components/me/LearningInsights";
import GoalsSection from "@/components/me/GoalsSection";
import AchievementsSection from "@/components/me/AchievementsSection";
import AcademicHistory from "@/components/me/AcademicHistory";
import DocumentLibrary from "@/components/me/DocumentLibrary";
import DownloadsSection from "@/components/me/DownloadsSection";
import SettingsSection from "@/components/me/SettingsSection";
import BudMemorySection from "@/components/me/BudMemorySection";

/**
 * Me — the student's personal command center.
 */
export default function Me() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: courses } = useQuery({ queryKey: ["meCourses"], queryFn: () => base44.entities.Course.list() });
  const { data: grades } = useQuery({ queryKey: ["meGrades"], queryFn: () => base44.entities.Grade.list() });
  const { data: assignments } = useQuery({ queryKey: ["meAssignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 50) });
  const { data: sessions } = useQuery({ queryKey: ["meSessions"], queryFn: () => base44.entities.StudySession.list("-session_date", 100) });
  const { data: exams } = useQuery({ queryKey: ["meExams"], queryFn: () => base44.entities.Exam.list("date", 30) });

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt space-y-6">
      <ProfileHeader user={user} />
      <AcademicSummary courses={courses} grades={grades} assignments={assignments} sessions={sessions} />
      <LearningInsights sessions={sessions} courses={courses} />
      <GoalsSection />
      <AchievementsSection sessions={sessions} assignments={assignments} />
      <AcademicHistory courses={courses} grades={grades} assignments={assignments} exams={exams} />
      <DocumentLibrary />
      <DownloadsSection courses={courses} assignments={assignments} grades={grades} sessions={sessions} />
      <BudMemorySection />
      <SettingsSection user={user} />
    </div>
  );
}