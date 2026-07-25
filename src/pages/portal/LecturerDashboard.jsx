import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { normalizeRole, canAccessPath } from "@/lib/portalConfig";
import {
  DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList,
} from "@/components/portal/PortalUI";
import { COMPANY_IDENTITY } from "@/lib/companyIdentity";
import {
  GraduationCap, ClipboardList, Video, PlayCircle, BookOpen, CalendarDays,
  FileText, UserCheck, FolderOpen, UsersRound, Megaphone, LineChart,
  MessageCircle, Bell,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const MODULES = [
  { label: "Courses", icon: BookOpen, path: "/portal/courses", group: "Teaching" },
  { label: "Today's Classes", icon: CalendarDays, path: "/portal/classes", group: "Teaching" },
  { label: "UNIBUD Live", icon: Video, path: "/portal/live", group: "Teaching" },
  { label: "Assignments", icon: ClipboardList, path: "/portal/assignments", group: "Teaching" },
  { label: "Quiz & Exam Center", icon: FileText, path: "/portal/quiz-center", group: "Teaching" },
  { label: "Attendance", icon: UserCheck, path: "/portal/attendance", group: "Teaching" },
  { label: "Grades", icon: GraduationCap, path: "/portal/grades", group: "Teaching" },
  { label: "Course Materials", icon: FolderOpen, path: "/portal/materials", group: "Teaching" },
  { label: "Recorded Lectures", icon: PlayCircle, path: "/portal/recordings", group: "Teaching" },
  { label: "Study Groups", icon: UsersRound, path: "/portal/study-groups", group: "Teaching" },
  { label: "Announcements", icon: Megaphone, path: "/portal/announcements", group: "Teaching" },
  { label: "Academic Analytics", icon: LineChart, path: "/portal/academic-analytics", group: "Insights" },
  { label: "Messages", icon: MessageCircle, path: "/messages", group: "Communication" },
  { label: "Notifications", icon: Bell, path: "/notifications", group: "Communication" },
];

export default function LecturerDashboard({ user }) {
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);

  const { data: courses } = useQuery({ queryKey: ["portalCourses"], queryFn: () => base44.entities.Course.list(), retry: false });
  const { data: assignments } = useQuery({ queryKey: ["portalAssignments"], queryFn: () => base44.entities.Assignment.list(), retry: false });
  const { data: liveClasses } = useQuery({ queryKey: ["portalLiveClasses"], queryFn: () => base44.entities.LiveClass.list(), retry: false });
  const { data: recordings } = useQuery({ queryKey: ["portalRecordings"], queryFn: () => base44.entities.LiveRecording.list(), retry: false });

  const myCourses = (courses || []).filter((c) => !c.lecturer || c.lecturer === user?.full_name);
  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending");
  const firstName = user?.full_name?.split(" ")[0] || "Lecturer";

  const groups = ["Teaching", "Insights", "Communication"]
    .map((g) => ({ group: g, items: MODULES.filter((m) => m.group === g && canAccessPath(role, m.path)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Lecturer Portal"
        subtitle={`Welcome back, ${firstName}. Manage your teaching, assessments, and students.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={BookOpen} value={myCourses.length} title="My Courses" accent="primary" delay={0} onClick={() => navigate("/portal/courses")} />
        <DashboardCard icon={Video} value={liveClasses?.length || 0} title="Live Classes" accent="info" delay={0.05} onClick={() => navigate("/portal/live")} />
        <DashboardCard icon={ClipboardList} value={pendingAssignments.length} title="Pending Assignments" accent="warning" delay={0.1} onClick={() => navigate("/portal/assignments")} />
        <DashboardCard icon={PlayCircle} value={recordings?.length || 0} title="Recordings" accent="success" delay={0.15} onClick={() => navigate("/portal/recordings")} />
      </div>

      {groups.map((g, gi) => (
        <SectionCard key={g.group} title={g.group} description="Quick access" delay={0.2 + gi * 0.05}>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {g.items.map((it, i) => (
              <motion.button
                key={it.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + gi * 0.05 + i * 0.03, ease: EASE }}
                onClick={() => navigate(it.path)}
                className="flex items-center gap-2.5 p-3.5 rounded-[16px] bg-muted/30 border border-border/20 hover:bg-muted/50 portal-card-hover text-left"
              >
                <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <it.icon className="w-[18px] h-[18px] text-primary" />
                </div>
                <span className="text-[12px] font-semibold text-foreground leading-tight">{it.label}</span>
              </motion.button>
            ))}
          </div>
        </SectionCard>
      ))}

      <SectionCard
        title="Pending Assignments"
        description="Awaiting submission"
        delay={0.4}
        action={<button onClick={() => navigate("/portal/assignments")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
      >
        <SmartList
          items={pendingAssignments.slice(0, 8)}
          emptyMessage="No pending assignments"
          onRowClick={() => navigate("/portal/assignments")}
          renderRow={(a) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{a.title || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.course_code || "—"} · Due {a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}</p>
              </div>
              <StatusPill status="open" label={a.status} />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard title="My Courses" description="Courses you are teaching" delay={0.45}>
        <div className="p-5 space-y-3">
          {myCourses.slice(0, 6).map((course, i) => (
            <motion.div
              key={course.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.04 }}
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

      <p className="text-center text-[10px] text-muted-foreground/50 pt-2">
        UNIBUD Lecturer Portal · {COMPANY_IDENTITY.companyName} · {COMPANY_IDENTITY.rcNumber}
      </p>
    </div>
  );
}