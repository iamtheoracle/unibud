import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, FileBarChart, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildReport } from "@/lib/academics/reportEngine";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ReportMetrics from "@/components/academics/report/ReportMetrics";
import ReportExportBar from "@/components/academics/report/ReportExportBar";
import BudReportActions from "@/components/academics/report/BudReportActions";
import ReportSection from "@/components/academics/report/ReportSection";
import GpaProgressChart from "@/components/academics/report/GpaProgressChart";
import StudyStreakTimeline from "@/components/academics/report/StudyStreakTimeline";
import WeeklyStudyChart from "@/components/academics/report/WeeklyStudyChart";
import AssignmentCompletionChart from "@/components/academics/report/AssignmentCompletionChart";
import SemesterPerformanceChart from "@/components/academics/report/SemesterPerformanceChart";
import MilestoneTimeline from "@/components/academics/report/MilestoneTimeline";

const EASE = [0.16, 1, 0.3, 1];

export default function SummaryReport() {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const reportRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const enabled = !!user;

  const gradesQ = useQuery({ queryKey: ["StudentGrade", "report"], queryFn: () => base44.entities.StudentGrade.list(), enabled });
  const assignmentsQ = useQuery({ queryKey: ["Assignment", "report"], queryFn: () => base44.entities.Assignment.list(), enabled });
  const attendanceQ = useQuery({ queryKey: ["AttendanceRecord", "report"], queryFn: () => base44.entities.AttendanceRecord.list(), enabled });
  const sessionsQ = useQuery({ queryKey: ["StudySession", "report"], queryFn: () => base44.entities.StudySession.list(), enabled });
  const studentGoalsQ = useQuery({ queryKey: ["StudentGoal", "report"], queryFn: () => base44.entities.StudentGoal.list(), enabled });
  const studyGoalsQ = useQuery({ queryKey: ["StudyGoal", "report"], queryFn: () => base44.entities.StudyGoal.list(), enabled });
  const coursesQ = useQuery({ queryKey: ["Course", "report"], queryFn: () => base44.entities.Course.list(), enabled });
  const timelineQ = useQuery({ queryKey: ["AcademicTimelineEntry", "report"], queryFn: () => base44.entities.AcademicTimelineEntry.list(), enabled });

  const anyLoading = [gradesQ, assignmentsQ, attendanceQ, sessionsQ, studentGoalsQ, studyGoalsQ, coursesQ, timelineQ].some((q) => q.isLoading);

  const report = useMemo(
    () =>
      buildReport({
        grades: gradesQ.data || [],
        assignments: assignmentsQ.data || [],
        attendance: attendanceQ.data || [],
        studySessions: sessionsQ.data || [],
        studentGoals: studentGoalsQ.data || [],
        studyGoals: studyGoalsQ.data || [],
        courses: coursesQ.data || [],
        timeline: timelineQ.data || [],
      }),
    [gradesQ.data, assignmentsQ.data, attendanceQ.data, sessionsQ.data, studentGoalsQ.data, studyGoalsQ.data, coursesQ.data, timelineQ.data]
  );

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
          </button>
          <div>
            <h1 className="font-heading font-extrabold text-[20px] text-foreground tracking-tight">Summary Report</h1>
            <p className="text-[11px] text-muted-foreground">Your semester, computed from real records</p>
          </div>
        </div>
        <ReportExportBar reportRef={reportRef} />
      </div>

      {anyLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : !report.hasData ? (
        <div className="rounded-[24px] p-8 glass-card text-center">
          <div className="w-14 h-14 rounded-[18px] bg-primary/8 flex items-center justify-center mx-auto mb-3">
            <FileBarChart className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[15px] font-semibold text-foreground">No academic data yet</p>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-[300px] mx-auto">
            Add grades, log a study session, or track an assignment — your report builds itself from real activity across Academics.
          </p>
        </div>
      ) : (
        <motion.div ref={reportRef} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}>
          <div className="mb-5">
            <BudReportActions report={report} />
          </div>

          <ReportSection title="Key metrics">
            <ReportMetrics report={report} />
          </ReportSection>

          <ReportSection title="GPA progression" subtitle="Your GPA across recorded semesters">
            <div className="rounded-[22px] p-4 glass-card">
              <GpaProgressChart data={report.semesterGpas} reduced={reduced} />
            </div>
          </ReportSection>

          <ReportSection title="Semester performance" subtitle="Course averages across all recorded grades">
            <div className="rounded-[22px] p-4 glass-card">
              <SemesterPerformanceChart courses={report.courseAverages} reduced={reduced} />
            </div>
          </ReportSection>

          <ReportSection title="Study streak" subtitle="Day-by-day streak from your study sessions">
            <div className="rounded-[22px] p-4 glass-card">
              <StudyStreakTimeline sessions={sessionsQ.data} reduced={reduced} />
            </div>
          </ReportSection>

          <ReportSection title="Weekly study activity" subtitle="Minutes studied over the last 7 days">
            <div className="rounded-[22px] p-4 glass-card">
              <WeeklyStudyChart sessions={sessionsQ.data} reduced={reduced} />
            </div>
          </ReportSection>

          <ReportSection title="Assignment completion" subtitle="Submitted vs remaining work">
            <div className="rounded-[22px] p-4 glass-card">
              <AssignmentCompletionChart report={report} reduced={reduced} />
            </div>
          </ReportSection>

          <ReportSection title="Academic milestones" subtitle="Your verified journey">
            <div className="rounded-[22px] p-4 glass-card">
              <MilestoneTimeline milestones={report.milestones} reduced={reduced} />
            </div>
          </ReportSection>

          {(report.strengths.length > 0 || report.needsImprovement.length > 0) && (
            <ReportSection title="Strengths & focus areas">
              <div className="space-y-3">
                {report.strengths.length > 0 && (
                  <div className="rounded-[18px] p-4 glass-card">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-[13px] font-semibold text-foreground">Strengths</span>
                    </div>
                    <div className="space-y-1.5">
                      {report.strengths.map((s) => (
                        <div key={s.course_code} className="flex justify-between text-[12px]">
                          <span className="text-foreground">{s.course_title}</span>
                          <span className="font-semibold text-success">{Math.round(s.average)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.needsImprovement.length > 0 && (
                  <div className="rounded-[18px] p-4 glass-card">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-[13px] font-semibold text-foreground">Needs improvement</span>
                    </div>
                    <div className="space-y-1.5">
                      {report.needsImprovement.map((s) => (
                        <div key={s.course_code} className="flex justify-between text-[12px]">
                          <span className="text-foreground">{s.course_title}</span>
                          <span className="font-semibold text-warning">{Math.round(s.average)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ReportSection>
          )}

          {report.upcomingDeadlines.length > 0 && (
            <ReportSection title="Upcoming deadlines">
              <div className="space-y-2">
                {report.upcomingDeadlines.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-[16px] glass-card">
                    <div className="w-8 h-8 rounded-[10px] bg-primary/8 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{d.title}</p>
                      <p className="text-[11px] text-muted-foreground">{d.course_code} · due {new Date(d.due_date).toLocaleDateString()}</p>
                    </div>
                    {d.priority === "high" && <span className="text-[10px] font-bold uppercase text-destructive">High</span>}
                  </div>
                ))}
              </div>
            </ReportSection>
          )}
        </motion.div>
      )}
    </div>
  );
}