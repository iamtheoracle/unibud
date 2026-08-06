import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PortalKPI from "@/components/institution/PortalKPI";

export default function LecturerAnalytics() {
  const [s, setS] = useState({ courses: 0, assignments: 0, exams: 0, grades: 0, projects: 0, avg: 0 });

  useEffect(() => {
    (async () => {
      const cnt = async (e) => { try { return (await base44.entities[e].list()).length; } catch { return 0; } };
      const courses = await cnt("Course"), assignments = await cnt("Assignment"), exams = await cnt("Exam"), projects = await cnt("Project");
      let avg = 0;
      try { const g = await base44.entities.StudentGrade.list(); if (g.length) avg = (g.reduce((a, x) => a + (x.score / x.max_score) * 100, 0) / g.length).toFixed(1); } catch {}
      setS({ courses, assignments, exams, grades: await cnt("StudentGrade"), projects, avg });
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <PortalKPI label="Courses" value={s.courses} accent />
        <PortalKPI label="Assignments" value={s.assignments} />
        <PortalKPI label="Exams" value={s.exams} />
        <PortalKPI label="Grades" value={s.grades} />
        <PortalKPI label="Avg %" value={s.avg} />
        <PortalKPI label="Projects" value={s.projects} />
      </div>
      <div className="glass-card radius-lg p-5">
        <p className="text-[14px] font-heading font-semibold mb-1">Teaching insights</p>
        <p className="text-[13px] text-muted-foreground">Aggregate view across your courses, assessments, and student outcomes. Detailed cohort analytics arrive with results uploads.</p>
      </div>
    </div>
  );
}