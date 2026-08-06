import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Field, Select, Empty, SectionTitle, inputCls } from "../ui";

export default function LecturerAttendance() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ course_code: "", date: new Date().toISOString().slice(0, 10), student: "", status: "present" });

  const load = async () => { setLoading(true); try { setList(await base44.entities.AttendanceRecord.list()); setCourses(await base44.entities.Course.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.course_code || !form.student) { toast({ title: "Course and student required" }); return; }
    const c = courses.find((x) => x.code === form.course_code);
    try { await base44.entities.AttendanceRecord.create({ course_code: form.course_code, course_title: c?.title || "", date: form.date, status: form.status, note: form.student }); setForm({ course_code: "", date: new Date().toISOString().slice(0, 10), student: "", status: "present" }); setAdding(false); toast({ title: "Attendance recorded" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.AttendanceRecord.delete(id); load(); } catch {} };
  const present = list.filter((a) => a.status === "present").length;

  return (
    <div className="space-y-4 max-w-[820px]">
      <div className="grid grid-cols-3 gap-3"><Stat label="Records" value={list.length} /><Stat label="Present" value={present} /><Stat label="Absent" value={list.length - present} /></div>
      <SectionTitle title="Attendance" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />Record</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Field label="Course"><select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
          <UDSInput label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <UDSInput label="Student Name / Matric" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["present", "absent", "excused"]} />
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Save</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No attendance records yet." /> :
        <div className="space-y-2">{list.map((a) => (
          <div key={a.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{a.note || "—"} <span className={`text-[11px] font-semibold ml-1 ${a.status === "present" ? "text-success" : a.status === "absent" ? "text-destructive" : "text-warning"}`}>{a.status}</span></p><p className="text-[12px] text-muted-foreground">{a.course_code} · {a.date}</p></div>
            <button onClick={() => del(a.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}

const Stat = ({ label, value }) => <div className="glass-card radius-lg p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-[20px] font-heading font-bold">{value}</p></div>;