import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Building2, Users, GraduationCap, BookOpen, CalendarDays,
  Award, TrendingUp, Layers, Megaphone, FlaskConical,
} from "lucide-react";
import { UniStatCard, UniCard, UniPageHeader } from "@/components/uni-portal/UniPortalUI";

const EASE = [0.16, 1, 0.3, 1];

export default function UniversityAdminDashboard({ user }) {
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ["User", "uni-admin"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
  });
  const { data: courses } = useQuery({
    queryKey: ["Course", "uni-admin"],
    queryFn: () => base44.entities.Course.list("-created_date", 200),
  });
  const { data: announcements } = useQuery({
    queryKey: ["StaffAnnouncement", "uni-admin"],
    queryFn: () => base44.entities.StaffAnnouncement.list("-created_date", 20),
  });

  const students = (users || []).filter((u) => u.role === "student");
  const lecturers = (users || []).filter((u) => u.role === "lecturer" || u.role === "course_coordinator");

  const managementItems = [
    { label: "Students", icon: Users, path: "/uni-portal/students", count: students.length, accent: "info" },
    { label: "Lecturers", icon: GraduationCap, path: "/uni-portal/students", count: lecturers.length, accent: "primary" },
    { label: "Courses", icon: BookOpen, path: "/uni-portal/courses", count: courses?.length || 0, accent: "success" },
    { label: "Faculties & Departments", icon: Building2, path: "/uni-portal/settings", accent: "purple" },
    { label: "Academic Calendar", icon: CalendarDays, path: "/uni-portal/events", accent: "warning" },
    { label: "Announcements", icon: Megaphone, path: "/uni-portal/announcements", count: announcements?.length || 0, accent: "info" },
    { label: "Research Output", icon: FlaskConical, path: "/uni-portal/research", accent: "success" },
    { label: "Reports", icon: TrendingUp, path: "/uni-portal/reports", accent: "primary" },
  ];

  const accentClasses = {
    info: "bg-info/10 text-info",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    purple: "bg-purple/10 text-purple",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div>
      <UniPageHeader
        title={user?.university || "University Dashboard"}
        subtitle="University-wide overview and management."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UniStatCard icon={Users} label="Total Students" value={students.length} accent="info" delay={0} onClick={() => navigate("/uni-portal/students")} />
        <UniStatCard icon={GraduationCap} label="Lecturers" value={lecturers.length} accent="primary" delay={0.05} />
        <UniStatCard icon={BookOpen} label="Courses" value={courses?.length || 0} accent="success" delay={0.1} onClick={() => navigate("/uni-portal/courses")} />
        <UniStatCard icon={Award} label="Avg. Performance" value="72%" trend={4} accent="warning" delay={0.15} onClick={() => navigate("/uni-portal/analytics")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UniCard title="University Management" description="Quick access to all modules" delay={0.1} className="lg:col-span-2" padding={false}>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 p-4">
            {managementItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04, ease: EASE }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 p-4 rounded-[16px] bg-muted/30 hover:bg-muted/50 border border-border/30 spring-tap text-left"
              >
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 ${accentClasses[item.accent] || accentClasses.primary}`}>
                  <item.icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{item.label}</p>
                  {item.count !== undefined && <p className="text-[11px] text-muted-foreground">{item.count} records</p>}
                </div>
              </motion.button>
            ))}
          </div>
        </UniCard>

        <UniCard title="Recent Announcements" description="Latest university-wide" delay={0.15} padding={false}>
          <div className="divide-y divide-border/20 max-h-[340px] overflow-y-auto">
            {(announcements || []).slice(0, 6).map((a, i) => (
              <motion.div key={a.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-5 py-3.5 hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/uni-portal/announcements")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.audience?.replace("_", " ")}</span>
                  {a.priority === "urgent" && <span className="text-[10px] font-bold text-error">URGENT</span>}
                </div>
                <p className="text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.message}</p>
              </motion.div>
            ))}
            {(!announcements || announcements.length === 0) && <p className="p-6 text-[12px] text-muted-foreground text-center">No announcements yet.</p>}
          </div>
        </UniCard>

        <UniCard title="Faculty Distribution" description="Students per faculty" delay={0.2}>
          <div className="space-y-3">
            {[
              { name: "Science", count: 420, pct: 32 },
              { name: "Engineering", count: 380, pct: 29 },
              { name: "Arts", count: 260, pct: 20 },
              { name: "Business", count: 180, pct: 14 },
              { name: "Law", count: 70, pct: 5 },
            ].map((f, i) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-medium text-foreground">{f.name}</p>
                  <span className="text-[11px] text-muted-foreground">{f.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: EASE }} className="h-full rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </UniCard>

        <UniCard title="Teaching Workload" description="Lecturer hours this semester" delay={0.25}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center">
              <Layers className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-[24px] font-heading font-extrabold text-foreground">1,240h</p>
              <p className="text-[11px] text-muted-foreground">across {lecturers.length} lecturers</p>
              <p className="text-[11px] text-success font-semibold mt-0.5">Balanced load</p>
            </div>
          </div>
        </UniCard>
      </div>
    </div>
  );
}