import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Video, ClipboardList, Users, GraduationCap, PlayCircle, CalendarDays, FolderOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";
import QuickActionsPanel from "@/components/portal/QuickActionsPanel";
import { useNavigate } from "react-router-dom";

export default function LecturerDashboard({ user }) {
  const navigate = useNavigate();

  const { data: courses } = useQuery({
    queryKey: ["portalCourses"],
    queryFn: () => base44.entities.Course.list(),
    retry: false,
  });

  const { data: assignments } = useQuery({
    queryKey: ["portalAssignments"],
    queryFn: () => base44.entities.Assignment.list(),
    retry: false,
  });

  const { data: liveClasses } = useQuery({
    queryKey: ["portalLiveClasses"],
    queryFn: () => base44.entities.LiveClass.list(),
    retry: false,
  });

  const { data: recordings } = useQuery({
    queryKey: ["portalRecordings"],
    queryFn: () => base44.entities.LiveRecording.list(),
    retry: false,
  });

  const myCourses = (courses || []).filter((c) => c.lecturer === user?.full_name || true);
  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Lecturer Portal"
        subtitle={`Welcome back, ${user?.full_name?.split(" ")[0] || "Lecturer"}. Manage your classes, assignments, and students.`}
      />

      <QuickActionsPanel user={user} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={GraduationCap} value={myCourses.length} title="My Courses" accent="primary" delay={0} onClick={() => navigate("/portal/courses")} />
        <DashboardCard icon={ClipboardList} value={pendingAssignments.length} title="Pending Assignments" subtitle="Awaiting submission" accent="warning" delay={0.05} onClick={() => navigate("/portal/assignments")} />
        <DashboardCard icon={Video} value={liveClasses?.length || 0} title="Live Classes" accent="info" delay={0.1} onClick={() => navigate("/portal/live")} />
        <DashboardCard icon={PlayCircle} value={recordings?.length || 0} title="Recorded Lectures" accent="success" delay={0.15} onClick={() => navigate("/portal/recordings")} />
      </div>

      <SectionCard title="Upcoming Assignments" description="Assignments with pending submissions" delay={0.2}
        action={<button onClick={() => navigate("/portal/assignments")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
      >
        <SmartList
          items={pendingAssignments.slice(0, 8)}
          emptyMessage="No pending assignments"
          onRowClick={() => navigate("/portal/assignments")}
          renderRow={(assignment) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{assignment.title || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {assignment.course_code || "—"} · Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "—"}
                </p>
              </div>
              <StatusPill status={assignment.status === "pending" ? "open" : assignment.status === "graded" ? "resolved" : "in_progress"} label={assignment.status} />
            </div>
          )}
        />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Actions" description="Common teaching tasks" delay={0.3}>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: "Start Live Class", icon: Video, path: "/portal/live" },
              { label: "Create Assignment", icon: ClipboardList, path: "/portal/assignments" },
              { label: "Take Attendance", icon: Users, path: "/portal/attendance" },
              { label: "View Schedule", icon: CalendarDays, path: "/portal/classes" },
              { label: "Course Materials", icon: FolderOpen, path: "/portal/materials" },
              { label: "Recordings", icon: PlayCircle, path: "/portal/recordings" },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-[20px] bg-muted/30 border border-border/20 hover:bg-muted/50 spring-tap transition-colors"
              >
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-foreground text-center">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="My Courses" description="Courses you are teaching" delay={0.35}>
          <div className="p-5 space-y-3">
            {myCourses.slice(0, 5).map((course, i) => (
              <motion.div
                key={course.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-[16px] bg-muted/30 border border-border/20"
              >
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{course.title}</p>
                  <p className="text-[11px] text-muted-foreground">{course.code} · {course.credits || 0} credits</p>
                </div>
                <StatusPill status={course.status === "active" ? "operational" : "info"} label={course.status} />
              </motion.div>
            ))}
            {myCourses.length === 0 && (
              <div className="text-center py-8">
                <GraduationCap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No courses assigned yet</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}