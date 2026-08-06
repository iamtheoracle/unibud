import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, LoadingState } from "@/components/management/management-ui";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const safe = async (name) => { try { return (await base44.entities[name].list("-created_date", 500)) || []; } catch { return []; } };
const mkey = (d) => { if (!d) return null; const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; };
const last12 = () => { const out = []; const d = new Date(); d.setDate(1); for (let i = 11; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[m.getMonth()] }); } return out; };

export default function Analytics({ institutionId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [students, admissions, fees, attendance, grades] = await Promise.all([
        safe("StudentRecord"), safe("Admission"), safe("Fee"), safe("AttendanceRecord"), safe("StudentGrade"),
      ]);
      const months = last12();
      const enroll = months.map((m) => ({ ...m, students: students.filter((s) => mkey(s.created_date) === m.key).length }));
      const admit = months.map((m) => ({ ...m, admissions: admissions.filter((a) => mkey(a.created_date) === m.key).length }));
      const rev = months.map((m) => ({ ...m, revenue: fees.filter((f) => ["tuition", "fee"].includes(f.type) && f.status === "paid" && mkey(f.created_date) === m.key).reduce((s, f) => s + (Number(f.amount) || 0), 0) }));
      const att = months.map((m) => {
        const ms = attendance.filter((a) => mkey(a.created_date || a.date) === m.key);
        const pres = ms.filter((a) => a.present === true || a.status === "present").length;
        return { ...m, rate: ms.length ? Math.round((pres / ms.length) * 100) : 0 };
      });
      const perf = months.map((m) => {
        const ms = grades.filter((g) => mkey(g.created_date) === m.key);
        const vals = ms.map((g) => Number(g.score ?? g.grade ?? g.marks)).filter((v) => !isNaN(v));
        return { ...m, avg: vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0 };
      });
      setData({ enroll, admit, rev, att, perf });
    })();
  }, [institutionId]);

  if (!data) return <LoadingState />;

  const Chart = ({ title, data: d, dataKey, color, type = "area" }) => (
    <Panel title={title}>
      <ResponsiveContainer width="100%" height={220}>
        {type === "area" ? (
          <AreaChart data={d}><defs><linearGradient id={dataKey} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.4} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#${dataKey})`} strokeWidth={2} /></AreaChart>
        ) : type === "bar" ? (
          <BarChart data={d}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} /></BarChart>
        ) : (
          <LineChart data={d}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} /><Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} /><Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} /></LineChart>
        )}
      </ResponsiveContainer>
    </Panel>
  );

  return (
    <div>
      <SectionHeader title="Analytics" desc="Student success, enrollment, revenue, attendance and performance trends across the last 12 months." />
      <div className="grid lg:grid-cols-2 gap-4">
        <Chart title="Enrollment Trends" data={data.enroll} dataKey="students" color="hsl(var(--primary))" type="area" />
        <Chart title="Admission Trends" data={data.admit} dataKey="admissions" color="hsl(var(--information))" type="bar" />
        <Chart title="Revenue Trends" data={data.rev} dataKey="revenue" color="hsl(var(--success))" type="bar" />
        <Chart title="Attendance Trends" data={data.att} dataKey="rate" color="hsl(var(--warning))" type="line" />
        <Chart title="Student Success (Avg Score)" data={data.perf} dataKey="avg" color="hsl(var(--primary))" type="line" />
      </div>
    </div>
  );
}