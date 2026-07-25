import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, CalendarCheck, ClipboardList, FolderKanban, GraduationCap, FileText, CalendarDays, MessageSquare, Clock, FlaskConical, Sparkles, BarChart3 } from "lucide-react";
import LecturerShell from "@/components/lecturer/LecturerShell";
import LecturerDashboard from "@/components/lecturer/sections/LecturerDashboard";
import LecturerCourses from "@/components/lecturer/sections/LecturerCourses";
import LecturerClassLists from "@/components/lecturer/sections/LecturerClassLists";
import LecturerAttendance from "@/components/lecturer/sections/LecturerAttendance";
import LecturerAssignments from "@/components/lecturer/sections/LecturerAssignments";
import LecturerProjects from "@/components/lecturer/sections/LecturerProjects";
import LecturerGrades from "@/components/lecturer/sections/LecturerGrades";
import LecturerExams from "@/components/lecturer/sections/LecturerExams";
import LecturerTimetable from "@/components/lecturer/sections/LecturerTimetable";
import LecturerMessages from "@/components/lecturer/sections/LecturerMessages";
import LecturerOfficeHours from "@/components/lecturer/sections/LecturerOfficeHours";
import LecturerResearch from "@/components/lecturer/sections/LecturerResearch";
import LecturerBud from "@/components/lecturer/sections/LecturerBud";
import LecturerAnalytics from "@/components/lecturer/sections/LecturerAnalytics";
import UDSEmptyState from "@/components/uds/UDSEmptyState";
import UDSButton from "@/components/uds/UDSButton";
import { base44 } from "@/api/base44Client";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "classlists", label: "Class Lists", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "grades", label: "Grades", icon: GraduationCap },
  { id: "exams", label: "Exams", icon: FileText },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "office", label: "Office Hours", icon: Clock },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "bud", label: "Bud Assistant", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const LECTURER_ROLES = ["lecturer", "admin", "dean", "hod", "university_admin", "institution_owner", "registrar"];

export default function LecturerPortal() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [instName, setInstName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.institution_id) { try { const inst = await base44.entities.Institution.get(me.institution_id); setInstName(inst?.short_name || inst?.name || ""); } catch {} }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const active = params.get("section") || "dashboard";
  const setActive = (id) => setParams({ section: id });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading portal…</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><UDSButton onClick={() => navigate("/login")}>Sign in</UDSButton></div>;

  const role = user.role || user.data?.role || "user";
  if (!LECTURER_ROLES.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[420px]">
          <UDSEmptyState title="Lecturers only" message="This portal is for lecturers and academic staff." action={<UDSButton variant="secondary" onClick={() => navigate("/home")}>Back to Campus</UDSButton>} />
        </div>
      </div>
    );
  }

  return (
    <LecturerShell user={user} instName={instName} active={active} onActive={setActive} sections={SECTIONS} onBack={() => navigate("/home")}>
      {active === "dashboard" && <LecturerDashboard user={user} />}
      {active === "courses" && <LecturerCourses user={user} />}
      {active === "classlists" && <LecturerClassLists />}
      {active === "attendance" && <LecturerAttendance />}
      {active === "assignments" && <LecturerAssignments />}
      {active === "projects" && <LecturerProjects />}
      {active === "grades" && <LecturerGrades />}
      {active === "exams" && <LecturerExams />}
      {active === "timetable" && <LecturerTimetable />}
      {active === "messages" && <LecturerMessages />}
      {active === "office" && <LecturerOfficeHours />}
      {active === "research" && <LecturerResearch user={user} />}
      {active === "bud" && <LecturerBud />}
      {active === "analytics" && <LecturerAnalytics />}
    </LecturerShell>
  );
}