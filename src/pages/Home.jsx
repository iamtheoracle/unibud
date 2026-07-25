import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import HomeHeader from "@/components/home/HomeHeader";
import FloatingSearch from "@/components/home/FloatingSearch";
import TodayCard from "@/components/home/TodayCard";
import QuickActions from "@/components/home/QuickActions";
import AcademicSnapshot from "@/components/home/AcademicSnapshot";
import UpcomingDeadlines from "@/components/home/UpcomingDeadlines";
import BudCard from "@/components/home/BudCard";

/**
 * Home (Campus) — the central student workspace shown immediately after
 * onboarding.
 */
export default function Home() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: courses } = useQuery({ queryKey: ["homeCourses"], queryFn: () => base44.entities.Course.list() });
  const { data: assignments } = useQuery({ queryKey: ["homeAssignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 30) });
  const { data: exams } = useQuery({ queryKey: ["homeExams"], queryFn: () => base44.entities.Exam.list("date", 20) });
  const { data: sessions } = useQuery({ queryKey: ["homeSessions"], queryFn: () => base44.entities.StudySession.list("-session_date", 60) });

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <HomeHeader user={user} />
      <div className="mt-4">
        <FloatingSearch />
      </div>
      <div className="mt-5">
        <TodayCard courses={courses} assignments={assignments} exams={exams} />
      </div>
      <div className="mt-5">
        <QuickActions />
      </div>
      <div className="mt-5">
        <AcademicSnapshot user={user} sessions={sessions} />
      </div>
      <div className="mt-5">
        <UpcomingDeadlines assignments={assignments} exams={exams} />
      </div>
      <div className="mt-5">
        <BudCard />
      </div>
    </div>
  );
}