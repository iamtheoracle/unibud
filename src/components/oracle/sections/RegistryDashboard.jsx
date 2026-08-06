import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, GraduationCap, CalendarCheck, FileText, ClipboardCheck, Sparkles, Server,
  MessageSquare, Building2, Cpu,
} from "lucide-react";
import { SectionHeader, LoadingState } from "@/components/oracle/oracle-ui";
import RegistryFilters from "@/components/oracle/registry/RegistryFilters";
import PlatformHealth from "@/components/oracle/registry/PlatformHealth";
import MetricSection from "@/components/oracle/registry/MetricSection";
import MetricTile from "@/components/oracle/registry/MetricTile";
import LiveActivityFeed from "@/components/oracle/registry/LiveActivityFeed";
import { useRegistryMetrics } from "@/lib/oracle/useRegistryMetrics";

const EASE = [0.16, 1, 0.3, 1];

export default function RegistryDashboard() {
  const [filters, setFilters] = useState({});
  const { data, isLoading, isFetching } = useRegistryMetrics(filters);
  const metrics = data?.metrics;
  const health = data?.health;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Live Registry Dashboard"
        desc="Mission-control overview of platform health — every metric flows live from the registry."
        actions={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass text-[11px] font-semibold text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${isFetching ? "bg-warning animate-pulse" : "bg-success live-pulse"}`} />
            {isFetching ? "Syncing registry…" : "Live · 30s"}
          </span>
        }
      />

      <RegistryFilters filters={filters} onChange={setFilters} />

      {isLoading || !metrics ? (
        <LoadingState label="Reading live registry…" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-4">
          <PlatformHealth health={health} loading={isLoading} />

          <div className="grid xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <MetricSection title="Students" icon={Users} accent="primary" count={7}>
                <MetricTile icon={Users} label="Total Registered" value={metrics.students.totalRegisteredStudents} tone="primary" />
                <MetricTile icon={Users} label="Active Today" value={metrics.students.activeToday} tone="success" />
                <MetricTile icon={Users} label="Active This Week" value={metrics.students.activeThisWeek} tone="info" />
                <MetricTile icon={Users} label="Online Now" value={metrics.students.onlineNow} tone="success" critical={false} />
                <MetricTile icon={Users} label="New Today" value={metrics.students.newRegistrationsToday} tone="info" />
                <MetricTile icon={Users} label="Verified" value={metrics.students.verifiedStudents} tone="success" />
                <MetricTile icon={Users} label="Suspended" value={metrics.students.suspendedStudents} tone="danger" critical={metrics.students.suspendedStudents > 0} />
              </MetricSection>

              <MetricSection title="Academics" icon={GraduationCap} accent="info" count={6}>
                <MetricTile icon={GraduationCap} label="Total Courses" value={metrics.academics.totalCourses} tone="primary" />
                <MetricTile icon={GraduationCap} label="Active Courses" value={metrics.academics.activeCourses} tone="success" />
                <MetricTile icon={GraduationCap} label="Course Registrations" value={metrics.academics.courseRegistrations} tone="info" />
                <MetricTile icon={GraduationCap} label="Students Enrolled" value={metrics.academics.studentsCurrentlyEnrolled} tone="primary" />
                <MetricTile icon={GraduationCap} label="Avg Course Load" value={metrics.academics.averageCourseLoad} suffix="courses" tone="info" />
                <MetricTile icon={GraduationCap} label="No Enrollment" value={metrics.academics.coursesWithNoEnrollment} tone="warn" critical={metrics.academics.coursesWithNoEnrollment > 0} />
              </MetricSection>

              <MetricSection title="Attendance" icon={CalendarCheck} accent="success" count={4}>
                <MetricTile icon={CalendarCheck} label="Attendance Today" value={metrics.attendance.attendanceToday} tone="primary" />
                <MetricTile icon={CalendarCheck} label="Check-ins Today" value={metrics.attendance.checkInsToday} tone="success" />
                <MetricTile icon={CalendarCheck} label="Live Classes" value={metrics.attendance.liveClasses} tone="info" critical={false} />
                <MetricTile icon={CalendarCheck} label="Attendance Rate" value={metrics.attendance.attendanceRate} suffix="%" tone={metrics.attendance.attendanceRate >= 75 ? "success" : metrics.attendance.attendanceRate > 0 ? "warn" : "danger"} critical={metrics.attendance.attendanceRate > 0 && metrics.attendance.attendanceRate < 50} />
              </MetricSection>

              <MetricSection title="Assignments" icon={FileText} accent="warn" count={5}>
                <MetricTile icon={FileText} label="Total" value={metrics.assignments.totalAssignments} tone="primary" />
                <MetricTile icon={FileText} label="Submitted Today" value={metrics.assignments.submittedToday} tone="success" />
                <MetricTile icon={FileText} label="Pending" value={metrics.assignments.pending} tone="info" />
                <MetricTile icon={FileText} label="Late" value={metrics.assignments.late} tone="warn" critical={metrics.assignments.late > 0} />
                <MetricTile icon={FileText} label="Overdue" value={metrics.assignments.overdue} tone="danger" critical={metrics.assignments.overdue > 0} />
              </MetricSection>

              <MetricSection title="Examinations" icon={ClipboardCheck} accent="primary" count={3}>
                <MetricTile icon={ClipboardCheck} label="Upcoming" value={metrics.examinations.upcomingExams} tone="info" />
                <MetricTile icon={ClipboardCheck} label="Active" value={metrics.examinations.activeExams} tone="success" critical={false} />
                <MetricTile icon={ClipboardCheck} label="Completed" value={metrics.examinations.completedExams} tone="primary" />
              </MetricSection>

              <MetricSection title="Bud" icon={Sparkles} accent="gold" count={4}>
                <MetricTile icon={Sparkles} label="Active Conversations" value={metrics.budAi.activeConversations} tone="primary" />
                <MetricTile icon={Sparkles} label="Questions Today" value={metrics.budAi.questionsToday} tone="info" />
                <MetricTile icon={Sparkles} label="AI Sessions Running" value={metrics.budAi.aiSessionsRunning} tone="success" />
                <MetricTile icon={Sparkles} label="Avg Response" value={metrics.budAi.averageResponseTime} suffix="ms" tone={metrics.budAi.averageResponseTime > 3000 ? "danger" : metrics.budAi.averageResponseTime > 1000 ? "warn" : "success"} critical={metrics.budAi.averageResponseTime > 3000} />
              </MetricSection>
            </div>

            <div className="space-y-4">
              <LiveActivityFeed filters={filters} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricSection title="Platform" icon={Server} accent="info" count={6}>
              <MetricTile icon={Server} label="Active Sessions" value={metrics.platform.activeSessions} tone="success" />
              <MetricTile icon={Server} label="Online Users" value={metrics.platform.onlineUsers} tone="success" />
              <MetricTile icon={Server} label="New Accounts Today" value={metrics.platform.newAccountsToday} tone="info" />
              <MetricTile icon={Server} label="Daily Logins" value={metrics.platform.dailyLogins} tone="primary" />
              <MetricTile icon={Server} label="Weekly Active" value={metrics.platform.weeklyActiveUsers} tone="info" />
              <MetricTile icon={Server} label="Monthly Active" value={metrics.platform.monthlyActiveUsers} tone="primary" />
            </MetricSection>

            <MetricSection title="Community" icon={MessageSquare} accent="success" count={4}>
              <MetricTile icon={MessageSquare} label="Posts Today" value={metrics.community.postsToday} tone="primary" />
              <MetricTile icon={MessageSquare} label="Messages Today" value={metrics.community.messagesToday} tone="info" />
              <MetricTile icon={MessageSquare} label="Active Communities" value={metrics.community.activeCommunities} tone="success" />
              <MetricTile icon={MessageSquare} label="Active Clubs" value={metrics.community.activeClubs} tone="info" />
            </MetricSection>

            <MetricSection title="Institutions" icon={Building2} accent="warn" count={5}>
              <MetricTile icon={Building2} label="Universities" value={metrics.institutions.universities} tone="primary" />
              <MetricTile icon={Building2} label="Faculties" value={metrics.institutions.faculties} tone="info" />
              <MetricTile icon={Building2} label="Departments" value={metrics.institutions.departments} tone="info" />
              <MetricTile icon={Building2} label="Lecturers" value={metrics.institutions.lecturers} tone="primary" />
              <MetricTile icon={Building2} label="Staff" value={metrics.institutions.staff} tone="primary" />
            </MetricSection>

            <MetricSection title="System" icon={Cpu} accent="danger" count={7}>
              <MetricTile icon={Cpu} label="Active Notifications" value={metrics.system.activeNotifications} tone="info" />
              <MetricTile icon={Cpu} label="Background Jobs" value={metrics.system.backgroundJobs} tone="primary" />
              <MetricTile icon={Cpu} label="Queue Size" value={metrics.system.queueSize} tone="warn" critical={metrics.system.queueSize > 50} />
              <MetricTile icon={Cpu} label="Failed Jobs" value={metrics.system.failedJobs} tone="danger" critical={metrics.system.failedJobs > 0} />
              <MetricTile icon={Cpu} label="API Requests" value={metrics.system.apiRequests} tone="info" sub={metrics.system.failedApi > 0 ? `${metrics.system.failedApi} failed` : "all ok"} />
              <MetricTile icon={Cpu} label="Storage Usage" value={metrics.system.storageUsage} suffix="files" tone="primary" />
            </MetricSection>
          </div>
        </motion.div>
      )}
    </div>
  );
}