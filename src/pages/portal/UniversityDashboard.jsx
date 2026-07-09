import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, GraduationCap, Building, BookOpen, Layers, BarChart3, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";
import { useNavigate } from "react-router-dom";

export default function UniversityDashboard({ user }) {
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

  const myUni = user?.university || "University of Benin";
  const uniUsers = (users || []).filter((u) => u.university === myUni);
  const students = uniUsers.filter((u) => u.role === "student" || u.role === "user" || !u.role);
  const lecturers = uniUsers.filter((u) => u.role === "lecturer");

  return (
    <div className="space-y-6">
      <PortalPageHeader title={myUni} subtitle="University administration dashboard — manage faculties, departments, and students." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={Users} value={students.length} title="Students" accent="primary" delay={0} onClick={() => navigate("/portal/users")} />
        <DashboardCard icon={GraduationCap} value={lecturers.length} title="Lecturers" accent="info" delay={0.05} onClick={() => navigate("/portal/lecturers")} />
        <DashboardCard icon={BookOpen} value={courses?.length || 0} title="Courses" accent="success" delay={0.1} onClick={() => navigate("/portal/courses")} />
        <DashboardCard icon={Layers} value={assignments?.length || 0} title="Assignments" accent="warning" delay={0.15} />
      </div>

      <SectionCard title="Active Courses" description={`${courses?.length || 0} courses in the system`} delay={0.2}>
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
                <p className="text-[13px] font-semibold text-foreground truncate">{course.title}</p>
                <p className="text-[11px] text-muted-foreground">{course.code} · {course.lecturer || "Unassigned"}</p>
              </div>
              {course.credits && <span className="text-[11px] text-muted-foreground font-semibold">{course.credits} cr</span>}
              <StatusPill status={course.status === "active" ? "operational" : "info"} label={course.status || "active"} />
            </div>
          )}
        />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Actions" description="University management tasks" delay={0.3}>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: "Manage Faculties", icon: Building, path: "/portal/faculties" },
              { label: "Manage Departments", icon: Layers, path: "/portal/departments" },
              { label: "View All Students", icon: Users, path: "/portal/users" },
              { label: "Academic Calendar", icon: CalendarDays, path: "/portal/calendar" },
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

        <SectionCard title="Academic Overview" description="Key metrics" delay={0.35}>
          <div className="p-5 grid grid-cols-2 gap-4">
            {[
              { value: students.length, label: "Total Students", icon: Users, color: "text-primary" },
              { value: lecturers.length, label: "Total Lecturers", icon: GraduationCap, color: "text-info" },
              { value: courses?.length || 0, label: "Active Courses", icon: BookOpen, color: "text-success" },
              { value: assignments?.length || 0, label: "Assignments", icon: Layers, color: "text-warning" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="text-center p-5 rounded-[24px] bg-muted/30 border border-border/20"
              >
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-[24px] font-heading font-extrabold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}