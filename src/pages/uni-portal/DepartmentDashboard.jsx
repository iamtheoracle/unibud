import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Users, GraduationCap, BookOpen, Layers, TrendingUp,
  ClipboardCheck, CalendarDays, FlaskConical,
} from "lucide-react";
import { UniStatCard, UniCard, UniPageHeader, UniButton } from "@/components/uni-portal/UniPortalUI";

const EASE = [0.16, 1, 0.3, 1];

export default function DepartmentDashboard({ user }) {
  const navigate = useNavigate();
  const { data: users } = useQuery({ queryKey: ["User", "dept"], queryFn: () => base44.entities.User.list("-created_date", 200) });
  const { data: courses } = useQuery({ queryKey: ["Course", "dept"], queryFn: () => base44.entities.Course.list("-created_date", 200) });

  const students = (users || []).filter((u) => u.role === "student");
  const lecturers = (users || []).filter((u) => u.role === "lecturer" || u.role === "course_coordinator");

  const modules = [
    { label: "Lecturers", icon: GraduationCap, path: "/uni-portal/students", count: lecturers.length },
    { label: "Courses", icon: BookOpen, path: "/uni-portal/courses", count: courses?.length || 0 },
    { label: "Students", icon: Users, path: "/uni-portal/students", count: students.length },
    { label: "Approvals", icon: ClipboardCheck, path: "/uni-portal/approvals" },
    { label: "Department Events", icon: CalendarDays, path: "/uni-portal/events" },
    { label: "Research", icon: FlaskConical, path: "/uni-portal/research" },
  ];

  return (
    <div>
      <UniPageHeader
        title={user?.department || "Department Dashboard"}
        subtitle="Manage your department's lecturers, courses, and students."
        action={<UniButton onClick={() => navigate("/uni-portal/approvals")}>View Approvals</UniButton>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UniStatCard icon={Users} label="Students" value={students.length} accent="info" delay={0} onClick={() => navigate("/uni-portal/students")} />
        <UniStatCard icon={GraduationCap} label="Lecturers" value={lecturers.length} accent="primary" delay={0.05} />
        <UniStatCard icon={BookOpen} label="Courses" value={courses?.length || 0} accent="success" delay={0.1} onClick={() => navigate("/uni-portal/courses")} />
        <UniStatCard icon={TrendingUp} label="Avg. GPA" value="3.4" trend={3} accent="warning" delay={0.15} onClick={() => navigate("/uni-portal/analytics")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UniCard title="Department Modules" description="Quick management access" delay={0.1} className="lg:col-span-2" padding={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {modules.map((m, i) => (
              <motion.button
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04, ease: EASE }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(m.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-[16px] bg-muted/30 hover:bg-muted/50 border border-border/30 spring-tap"
              >
                <div className="w-11 h-11 rounded-[14px] bg-primary/10 flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" strokeWidth={2.2} />
                </div>
                <p className="text-[12px] font-semibold text-foreground text-center">{m.label}</p>
                {m.count !== undefined && <p className="text-[10px] text-muted-foreground">{m.count}</p>}
              </motion.button>
            ))}
          </div>
        </UniCard>

        <UniCard title="Teaching Workload" description="This semester" delay={0.15}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-[16px] bg-success/10 flex items-center justify-center">
              <Layers className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-[22px] font-heading font-extrabold text-foreground">312h</p>
              <p className="text-[11px] text-muted-foreground">across {lecturers.length} lecturers</p>
            </div>
          </div>
          <div className="space-y-2">
            {lecturers.slice(0, 4).map((l, i) => (
              <div key={l.id || i} className="flex items-center justify-between text-[12px]">
                <span className="text-foreground truncate">{l.full_name || l.email}</span>
                <span className="text-muted-foreground">{20 + (i * 4) % 12}h</span>
              </div>
            ))}
            {lecturers.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-4">No lecturers yet.</p>}
          </div>
        </UniCard>
      </div>
    </div>
  );
}