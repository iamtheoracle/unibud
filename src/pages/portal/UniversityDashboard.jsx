import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, Building, BookOpen, Layers, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, DataTable, StatusPill } from "@/components/portal/PortalUI";

export default function UniversityDashboard({ user }) {
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

  const myUni = user?.university || "University of Benin";
  const uniUsers = (users || []).filter((u) => u.university === myUni);
  const students = uniUsers.filter((u) => u.role === "student" || u.role === "user" || !u.role);
  const lecturers = uniUsers.filter((u) => u.role === "lecturer");

  const courseColumns = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono font-semibold text-[12px] text-primary">{row.code}</span> },
    { key: "title", header: "Course", render: (row) => <span className="font-medium text-[13px]">{row.title}</span> },
    { key: "lecturer", header: "Lecturer", render: (row) => <span className="text-[12px] text-muted-foreground">{row.lecturer || "—"}</span> },
    { key: "credits", header: "Credits", render: (row) => <span className="text-[12px] text-muted-foreground">{row.credits || "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status === "active" ? "operational" : "info"} label={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">{myUni}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">University administration dashboard — manage faculties, departments, and students.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Students" value={students.length} accent="primary" />
        <KpiCard icon={GraduationCap} label="Lecturers" value={lecturers.length} accent="info" />
        <KpiCard icon={BookOpen} label="Courses" value={courses?.length || 0} accent="success" />
        <KpiCard icon={Layers} label="Assignments" value={assignments?.length || 0} accent="warning" />
      </div>

      <SectionCard title="Active Courses" description={`${courses?.length || 0} courses in the system`}>
        <DataTable columns={courseColumns} data={courses || []} emptyMessage="No courses found" />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Actions" description="University management tasks">
          <div className="p-5 space-y-2">
            {[
              { label: "Manage Faculties", icon: Building, path: "/portal/faculties" },
              { label: "Manage Departments", icon: Layers, path: "/portal/departments" },
              { label: "View All Students", icon: Users, path: "/portal/users" },
              { label: "Academic Calendar", icon: BarChart3, path: "/portal/calendar" },
            ].map((action) => (
              <a key={action.label} href={action.path} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors">
                <action.icon className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
              </a>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Academic Overview" description="Key metrics">
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="text-center bg-muted/30 rounded-xl p-4">
              <p className="text-[24px] font-heading font-extrabold text-primary">{students.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Total Students</p>
            </div>
            <div className="text-center bg-muted/30 rounded-xl p-4">
              <p className="text-[24px] font-heading font-extrabold text-success">{lecturers.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Total Lecturers</p>
            </div>
            <div className="text-center bg-muted/30 rounded-xl p-4">
              <p className="text-[24px] font-heading font-extrabold text-info">{courses?.length || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Active Courses</p>
            </div>
            <div className="text-center bg-muted/30 rounded-xl p-4">
              <p className="text-[24px] font-heading font-extrabold text-warning">{assignments?.length || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Assignments</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}