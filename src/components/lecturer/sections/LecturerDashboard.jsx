import React, { useEffect, useState } from "react";
import { BookOpen, ClipboardList, FileText, Users, GraduationCap, FlaskConical } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PortalKPI from "@/components/institution/PortalKPI";

export default function LecturerDashboard({ user }) {
  const [s, setS] = useState({ courses: 0, assignments: 0, exams: 0, projects: 0, grades: 0, notes: 0 });

  useEffect(() => {
    (async () => {
      const cnt = async (e) => { try { return (await base44.entities[e].list()).length; } catch { return 0; } };
      setS({
        courses: await cnt("Course"), assignments: await cnt("Assignment"), exams: await cnt("Exam"),
        projects: await cnt("Project"), grades: await cnt("StudentGrade"), notes: await cnt("Note"),
      });
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="glass-card radius-lg p-5">
        <p className="text-[15px] font-heading font-semibold">Welcome, {user?.full_name || "Lecturer"}</p>
        <p className="text-[13px] text-muted-foreground">Your teaching workspace — courses, assessments, grades, research, and Bud assistance in one place.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <PortalKPI label="Courses" value={s.courses} icon={BookOpen} accent />
        <PortalKPI label="Assignments" value={s.assignments} icon={ClipboardList} />
        <PortalKPI label="Exams" value={s.exams} icon={FileText} />
        <PortalKPI label="Projects" value={s.projects} icon={Users} />
        <PortalKPI label="Grades" value={s.grades} icon={GraduationCap} />
        <PortalKPI label="Research" value="—" icon={FlaskConical} />
      </div>
    </div>
  );
}