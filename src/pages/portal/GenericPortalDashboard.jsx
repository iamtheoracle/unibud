import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, Layers, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, DataTable, StatusPill } from "@/components/portal/PortalUI";
import { getRoleName } from "@/lib/portalConfig";

export default function GenericPortalDashboard({ user, role }) {
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

  const courseColumns = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono font-semibold text-[12px] text-primary">{row.code}</span> },
    { key: "title", header: "Course", render: (row) => <span className="font-medium text-[13px]">{row.title}</span> },
    { key: "lecturer", header: "Lecturer", render: (row) => <span className="text-[12px] text-muted-foreground">{row.lecturer || "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status === "active" ? "operational" : "info"} label={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">{getRoleName(role)} Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Manage your academic unit — courses, lecturers, and students.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Users" value={users?.length || 0} accent="primary" />
        <KpiCard icon={BookOpen} label="Courses" value={courses?.length || 0} accent="success" />
        <KpiCard icon={Layers} label="Assignments" value={assignments?.length || 0} accent="warning" />
        <KpiCard icon={BarChart3} label="Reports" value="View" sublabel="Analytics & exports" accent="info" />
      </div>

      <SectionCard title="Courses" description="All courses in the system">
        <DataTable columns={courseColumns} data={courses || []} emptyMessage="No courses found" />
      </SectionCard>
    </div>
  );
}