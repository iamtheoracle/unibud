import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Layers, Building, Users, GraduationCap, BookOpen,
  TrendingUp, FlaskConical, CalendarDays,
} from "lucide-react";
import { UniStatCard, UniCard, UniPageHeader, UniButton } from "@/components/uni-portal/UniPortalUI";

const EASE = [0.16, 1, 0.3, 1];

export default function FacultyDashboard({ user }) {
  const navigate = useNavigate();
  const { data: users } = useQuery({ queryKey: ["User", "faculty"], queryFn: () => base44.entities.User.list("-created_date", 200) });
  const { data: courses } = useQuery({ queryKey: ["Course", "faculty"], queryFn: () => base44.entities.Course.list("-created_date", 200) });

  const students = (users || []).filter((u) => u.role === "student");
  const lecturers = (users || []).filter((u) => u.role === "lecturer" || u.role === "course_coordinator");

  const modules = [
    { label: "Departments", icon: Layers, path: "/uni-portal/settings" },
    { label: "Faculty Staff", icon: GraduationCap, path: "/uni-portal/students", count: lecturers.length },
    { label: "Programmes", icon: BookOpen, path: "/uni-portal/courses", count: courses?.length || 0 },
    { label: "Students", icon: Users, path: "/uni-portal/students", count: students.length },
    { label: "Research Output", icon: FlaskConical, path: "/uni-portal/research" },
    { label: "Events", icon: CalendarDays, path: "/uni-portal/events" },
  ];

  return (
    <div>
      <UniPageHeader
        title={user?.faculty || "Faculty Dashboard"}
        subtitle="Manage faculty departments, staff, programmes, and analytics."
        action={<UniButton onClick={() => navigate("/uni-portal/analytics")}>View Analytics</UniButton>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UniStatCard icon={Layers} label="Departments" value={5} accent="purple" delay={0} onClick={() => navigate("/uni-portal/settings")} />
        <UniStatCard icon={Users} label="Students" value={students.length} accent="info" delay={0.05} onClick={() => navigate("/uni-portal/students")} />
        <UniStatCard icon={GraduationCap} label="Staff" value={lecturers.length} accent="primary" delay={0.1} />
        <UniStatCard icon={TrendingUp} label="Research" value="14 papers" accent="success" delay={0.15} onClick={() => navigate("/uni-portal/research")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UniCard title="Faculty Management" description="Quick access" delay={0.1} className="lg:col-span-2" padding={false}>
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

        <UniCard title="Bud Usage" description="Across faculty" delay={0.15}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-[16px] bg-primary/10 flex items-center justify-center">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[22px] font-heading font-extrabold text-foreground">1,840</p>
              <p className="text-[11px] text-muted-foreground">Bud interactions</p>
            </div>
          </div>
          <div className="space-y-2">
            {["Data Structures", "Algorithms", "Database Systems", "Networks"].map((c, i) => (
              <div key={c} className="flex items-center justify-between text-[12px]">
                <span className="text-foreground truncate">{c}</span>
                <span className="text-muted-foreground">{320 + i * 140}</span>
              </div>
            ))}
          </div>
        </UniCard>
      </div>
    </div>
  );
}