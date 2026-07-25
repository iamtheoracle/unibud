import React from "react";
import { BookOpen, ClipboardList, FileText, CalendarCheck, Clock, TrendingUp } from "lucide-react";
import PortalKPI from "@/components/institution/PortalKPI";

export default function ParentOverview({ data }) {
  const present = (data.attendance || []).filter((a) => a.status === "present").length;
  const attRate = data.attendance.length ? Math.round((present / data.attendance.length) * 100) : 0;
  const avg = data.grades.length ? Math.round(data.grades.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / data.grades.length) : 0;
  const upcoming = (data.assignments || []).filter((a) => a.status !== "submitted" && a.status !== "graded");

  return (
    <div className="space-y-4">
      <div className="glass-card radius-lg p-5">
        <p className="text-[15px] font-heading font-semibold">{data.student?.full_name || "Student"}</p>
        <p className="text-[13px] text-muted-foreground">{data.student?.email || "—"} · {data.profile?.department || "—"} · {data.profile?.level || "—"}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <PortalKPI label="Courses" value={(data.courses || []).length} icon={BookOpen} accent />
        <PortalKPI label="Assignments" value={upcoming.length} icon={ClipboardList} />
        <PortalKPI label="Upcoming Exams" value={(data.exams || []).length} icon={FileText} />
        <PortalKPI label="Attendance" value={`${attRate}%`} icon={CalendarCheck} />
        <PortalKPI label="Study Hours" value={Math.round((data.studyMinutes || 0) / 60)} icon={Clock} />
        <PortalKPI label="Avg Grade" value={avg ? `${avg}%` : "—"} icon={TrendingUp} />
      </div>
    </div>
  );
}