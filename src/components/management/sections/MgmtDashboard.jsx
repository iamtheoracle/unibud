import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, EmptyState, LoadingState } from "@/components/management/management-ui";
import { GraduationCap, Briefcase, BookOpen, UserPlus, Wallet, CheckSquare, FileCheck, Library, Home, Heart, Megaphone, CalendarDays } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const safe = async (name) => { try { return (await base44.entities[name].list("-created_date", 500)) || []; } catch { return []; } };
const mkey = (d) => { if (!d) return null; const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; };
const last6 = () => { const out = []; const d = new Date(); d.setDate(1); for (let i = 5; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[m.getMonth()] }); } return out; };
const money = (n) => "₦" + (n || 0).toLocaleString();

export default function MgmtDashboard({ institutionId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [students, staff, courses, admissions, fees, exams, attendance, library, ann, events, grades] = await Promise.all([
        safe("StudentRecord"), safe("Staff"), safe("Course"), safe("Admission"), safe("Fee"), safe("ExamPaper"),
        safe("AttendanceRecord"), safe("LibraryResource"), safe("StaffAnnouncement"), safe("CampusEvent"), safe("StudentGrade"),
      ]);
      const months = last6();
      const enrollTrend = months.map((m) => ({ ...m, students: students.filter((s) => mkey(s.created_date) === m.key).length }));
      const revTrend = months.map((m) => ({ ...m, revenue: fees.filter((f) => ["tuition", "fee"].includes(f.type) && f.status === "paid" && mkey(f.created_date) === m.key).reduce((s, f) => s + (Number(f.amount) || 0), 0) }));
      const attTrend = months.map((m) => {
        const ms = attendance.filter((a) => mkey(a.created_date || a.date) === m.key);
        const pres = ms.filter((a) => a.present === true || a.status === "present").length;
        return { ...m, rate: ms.length ? Math.round((pres / ms.length) * 100) : 0 };
      });
      const perfTrend = months.map((m) => {
        const ms = grades.filter((g) => mkey(g.created_date) === m.key);
        const vals = ms.map((g) => Number(g.score ?? g.grade ?? g.marks)).filter((v) => !isNaN(v));
        return { ...m, avg: vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0 };
      });
      const revenue = fees.filter((f) => ["tuition", "fee"].includes(f.type) && f.status === "paid").reduce((s, f) => s + (Number(f.amount) || 0), 0);
      const pendingFees = fees.filter((f) => f.status === "pending").length;
      const attRate = attendance.length ? Math.round(attendance.filter((a) => a.present === true || a.status === "present").length / attendance.length * 100) : 0;
      setData({
        stats: { students: students.length, staff: staff.length, courses: courses.length, admissions: admissions.length, pendingAdm: admissions.filter((a) => ["pending", "submitted"].includes(a.status)).length, revenue, pendingFees, attRate, exams: exams.filter((e) => e.status === "published").length, library: library.length },
        enrollTrend, revTrend, attTrend, perfTrend,
        ann: ann.slice(0, 5),
        events: events.filter((e) => e.start_date || e.date).sort((a, b) => new Date(a.start_date || a.date) - new Date(b.start_date || b.date)).slice(0, 5),
      });
    })();
  }, [institutionId]);

  if (!data) return <LoadingState />;
  const s = data.stats;

  return (
    <div>
      <SectionHeader title="Dashboard" desc="Institution overview — academic statistics, populations, finance, attendance, examinations, admissions, library, hostel, health, announcements and calendar." />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
        <StatCard icon={GraduationCap} label="Student Population" value={s.students} tone="primary" />
        <StatCard icon={Briefcase} label="Staff Population" value={s.staff} tone="info" />
        <StatCard icon={BookOpen} label="Courses" value={s.courses} tone="muted" />
        <StatCard icon={UserPlus} label="Admissions" value={s.admissions} tone="warn" sub={`${s.pendingAdm} pending review`} />
        <StatCard icon={Wallet} label="Revenue (paid)" value={money(s.revenue)} tone="success" sub={`${s.pendingFees} pending fees`} />
        <StatCard icon={CheckSquare} label="Attendance" value={`${s.attRate}%`} tone="info" />
        <StatCard icon={FileCheck} label="Published Exams" value={s.exams} tone="primary" />
        <StatCard icon={Library} label="Library Resources" value={s.library} tone="muted" />
        <StatCard icon={Home} label="Hostel Occupancy" value="—" tone="muted" />
        <StatCard icon={Heart} label="Health Centre" value="—" tone="muted" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Enrollment Trend" icon={GraduationCap}>
          <ResponsiveContainer width="100%" height={200}><AreaChart data={data.enrollTrend}><defs><linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Area type="monotone" dataKey="students" stroke="hsl(var(--primary))" fill="url(#ge)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
        </Panel>
        <Panel title="Revenue Trend" icon={Wallet}>
          <ResponsiveContainer width="100%" height={200}><BarChart data={data.revTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </Panel>
        <Panel title="Attendance Trend" icon={CheckSquare}>
          <ResponsiveContainer width="100%" height={200}><LineChart data={data.attTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Line type="monotone" dataKey="rate" stroke="hsl(var(--information))" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
        </Panel>
        <Panel title="Performance Trend" icon={FileCheck}>
          <ResponsiveContainer width="100%" height={200}><LineChart data={data.perfTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Line type="monotone" dataKey="avg" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Announcements" icon={Megaphone}>
          {data.ann.length === 0 ? <EmptyState icon={Megaphone} message="No announcements." /> : (
            <div className="space-y-2.5">{data.ann.map((a) => (
              <div key={a.id} className="flex gap-2.5"><div className="w-1 rounded-full bg-primary shrink-0" /><div className="min-w-0"><p className="text-[13px] font-medium truncate">{a.title || a.message}</p><p className="text-[11px] text-muted-foreground">{a.created_date ? new Date(a.created_date).toLocaleDateString() : ""}</p></div></div>
            ))}</div>
          )}
        </Panel>
        <Panel title="Institution Calendar" icon={CalendarDays}>
          {data.events.length === 0 ? <EmptyState icon={CalendarDays} message="No upcoming events." /> : (
            <div className="space-y-2.5">{data.events.map((e) => (
              <div key={e.id} className="flex gap-2.5"><div className="w-1 rounded-full bg-information shrink-0" /><div className="min-w-0"><p className="text-[13px] font-medium truncate">{e.title || e.name}</p><p className="text-[11px] text-muted-foreground">{(e.start_date || e.date) ? new Date(e.start_date || e.date).toLocaleDateString() : ""}</p></div></div>
            ))}</div>
          )}
        </Panel>
      </div>
    </div>
  );
}