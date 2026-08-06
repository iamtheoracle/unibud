import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, Layers, BarChart3, GraduationCap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";
import QuickActionsPanel from "@/components/portal/QuickActionsPanel";
import { getRoleName } from "@/lib/portalConfig";
import { useNavigate } from "react-router-dom";

export default function GenericPortalDashboard({ user, role }) {
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

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

  return (
    <div className="space-y-6">
      <PortalPageHeader title={`${getRoleName(role)} Dashboard`} subtitle="Manage your academic unit — courses, lecturers, and students." />

      <QuickActionsPanel user={user} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={Users} value={users?.length || 0} title="Total Users" accent="primary" delay={0} onClick={() => navigate("/portal/users")} />
        <DashboardCard icon={BookOpen} value={courses?.length || 0} title="Courses" accent="success" delay={0.05} onClick={() => navigate("/portal/courses")} />
        <DashboardCard icon={Layers} value={assignments?.length || 0} title="Assignments" accent="warning" delay={0.1} onClick={() => navigate("/portal/assignments")} />
        <DashboardCard icon={BarChart3} value="View" title="Reports" subtitle="Analytics & exports" accent="info" delay={0.15} onClick={() => navigate("/portal/reports")} />
      </div>

      <SectionCard title="Courses" description="All courses in the system" delay={0.2}>
        <SmartList
          items={(courses || []).slice(0, 10)}
          emptyMessage="No courses found"
          onRowClick={() => navigate("/portal/courses")}
          renderRow={(course) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{course.title || "Untitled Course"}</p>
                <p className="text-[11px] text-muted-foreground">{course.code} · {course.lecturer || "Unassigned"}</p>
              </div>
              {course.credits && <span className="text-[11px] text-muted-foreground font-semibold">{course.credits} cr</span>}
              <StatusPill status={course.status === "active" ? "operational" : "info"} label={course.status || "active"} />
            </div>
          )}
        />
      </SectionCard>

      <div className="grid lg:grid-cols-3 gap-4">
        <DashboardCard icon={Users} value={users?.length || 0} title="Total Users" accent="primary" delay={0.3} onClick={() => navigate("/portal/users")} />
        <DashboardCard icon={GraduationCap} value={(courses || []).filter(c => c.lecturer).length} title="Assigned Lecturers" accent="info" delay={0.35} />
        <DashboardCard icon={Layers} value={assignments?.length || 0} title="Total Assignments" accent="warning" delay={0.4} />
      </div>
    </div>
  );
}