import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Video, ClipboardList, Users, GraduationCap, PlayCircle, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, DataTable, StatusPill } from "@/components/portal/PortalUI";

export default function LecturerDashboard({ user }) {
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

  const assignmentColumns = [
    { key: "title", header: "Assignment", render: (row) => <span className="font-medium text-[13px]">{row.title}</span> },
    { key: "course_code", header: "Course", render: (row) => <span className="font-mono text-[12px] text-primary">{row.course_code}</span> },
    { key: "due_date", header: "Due Date", render: (row) => <span className="text-[12px] text-muted-foreground">{row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status === "pending" ? "open" : row.status === "graded" ? "resolved" : "in_progress"} label={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Lecturer Portal</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Welcome back, {user?.full_name?.split(" ")[0] || "Lecturer"}. Manage your classes, assignments, and students.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={GraduationCap} label="My Courses" value={myCourses.length} accent="primary" />
        <KpiCard icon={ClipboardList} label="Pending Assignments" value={pendingAssignments.length} sublabel="Awaiting submission" accent="warning" />
        <KpiCard icon={Video} label="Live Classes" value={liveClasses?.length || 0} accent="info" />
        <KpiCard icon={PlayCircle} label="Recorded Lectures" value={recordings?.length || 0} accent="success" />
      </div>

      <SectionCard title="Upcoming Assignments" description="Assignments with pending submissions" action={<a href="/portal/assignments" className="text-[12px] font-semibold text-primary hover:underline">View all</a>}>
        <DataTable columns={assignmentColumns} data={pendingAssignments.slice(0, 8)} emptyMessage="No pending assignments" />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Actions" description="Common teaching tasks">
          <div className="p-5 space-y-2">
            {[
              { label: "Start Live Class", icon: Video, path: "/portal/live" },
              { label: "Create Assignment", icon: ClipboardList, path: "/portal/assignments" },
              { label: "Take Attendance", icon: Users, path: "/portal/attendance" },
              { label: "View Schedule", icon: CalendarDays, path: "/portal/classes" },
            ].map((action) => (
              <a key={action.label} href={action.path} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors">
                <action.icon className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
              </a>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="My Courses" description="Courses you are teaching">
          <div className="p-5 space-y-2">
            {myCourses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{course.title}</p>
                  <p className="text-[11px] text-muted-foreground">{course.code} · {course.credits || 0} credits</p>
                </div>
                <StatusPill status={course.status === "active" ? "operational" : "info"} label={course.status} />
              </div>
            ))}
            {myCourses.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">No courses assigned yet</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}