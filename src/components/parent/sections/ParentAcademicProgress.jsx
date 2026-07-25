import React from "react";
import { Empty } from "@/components/lecturer/ui";

export default function ParentAcademicProgress({ data }) {
  const avg = data.grades.length ? Math.round(data.grades.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / data.grades.length) : 0;
  return (
    <div className="space-y-4 max-w-[820px]">
      <div className="glass-card radius-lg p-4"><p className="text-[12px] uppercase tracking-wider text-muted-foreground">Overall average</p><p className="text-[28px] font-heading font-bold">{avg ? `${avg}%` : "—"}</p></div>
      <div>
        <p className="text-[14px] font-heading font-semibold mb-2">Courses</p>
        {(data.courses || []).length === 0 ? <Empty label="No course records." /> :
          <div className="space-y-2">{data.courses.map((c) => (
            <div key={c.id} className="glass-card radius-lg p-3"><p className="font-semibold text-[14px]">{c.title}</p><p className="text-[12px] text-muted-foreground">{c.code} · {c.grade || "no grade yet"} · {c.progress || 0}% complete</p></div>
          ))}</div>}
      </div>
      <div>
        <p className="text-[14px] font-heading font-semibold mb-2">Grades</p>
        {(data.grades || []).length === 0 ? <Empty label="No grades published yet." /> :
          <div className="space-y-2">{data.grades.map((g) => (
            <div key={g.id} className="glass-card radius-lg p-3 flex items-center gap-3"><div className="flex-1"><p className="font-semibold text-[14px] capitalize">{g.assessment_type}</p><p className="text-[12px] text-muted-foreground">{g.course_code} · {g.status}</p></div><span className="text-[16px] font-heading font-bold">{g.score}/{g.max_score}</span></div>
          ))}</div>}
      </div>
    </div>
  );
}