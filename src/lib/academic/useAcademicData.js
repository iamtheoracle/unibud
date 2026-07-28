/**
 * UNIBUD Academic — React Query state layer.
 *
 * One hook per academic data domain, all backed by the mock academicApi.
 * Components consume these; swapping the API for real entities later
 * requires no consumer changes.
 */
import { useQuery } from "@tanstack/react-query";
import { academicApi } from "./academicApi";

const STALE = 5 * 60 * 1000;

export function useAcademicStudent() {
  return useQuery({ queryKey: ["academic", "student"], queryFn: academicApi.getStudent, staleTime: STALE });
}

export function useCourses() {
  return useQuery({ queryKey: ["academic", "courses"], queryFn: academicApi.getCourses, staleTime: STALE });
}

export function useTodaySchedule() {
  return useQuery({ queryKey: ["academic", "today"], queryFn: academicApi.getTodaySchedule, staleTime: 60 * 1000 });
}

export function useUpcomingDeadlines() {
  return useQuery({ queryKey: ["academic", "deadlines"], queryFn: academicApi.getUpcomingDeadlines, staleTime: 60 * 1000 });
}

export function useExams() {
  return useQuery({ queryKey: ["academic", "exams"], queryFn: academicApi.getExams, staleTime: 2 * 60 * 1000 });
}

export function useGpa() {
  return useQuery({ queryKey: ["academic", "gpa"], queryFn: academicApi.getGpa, staleTime: STALE });
}

export function useAttendance() {
  return useQuery({ queryKey: ["academic", "attendance"], queryFn: academicApi.getAttendance, staleTime: STALE });
}

export function useStudyStats() {
  return useQuery({ queryKey: ["academic", "stats"], queryFn: academicApi.getStudyStats, staleTime: 60 * 1000 });
}

export function useAcademicCalendar() {
  return useQuery({ queryKey: ["academic", "calendar"], queryFn: academicApi.getAcademicCalendar, staleTime: STALE });
}

/**
 * Consolidated academic pulse for the AcademicHub home surface — the next
 * class, the next deadline, and current GPA in one read.
 */
export function useAcademicData() {
  const today = useTodaySchedule();
  const deadlines = useUpcomingDeadlines();
  const gpa = useGpa();
  const loading = today.isLoading || deadlines.isLoading || gpa.isLoading;
  const nextClass = (today.data || []).find((s) => s.status !== "done") || null;
  const nextDeadline = (deadlines.data || []).find((d) => d.dueInDays >= 0) || (deadlines.data || [])[0] || null;
  return {
    today: today.data || [],
    nextClass,
    nextDeadline,
    gpa: gpa.data || null,
    loading,
  };
}