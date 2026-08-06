import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Field, Select, Empty, SectionTitle, inputCls } from "../ui";

export default function LecturerGrades() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ course_code: "", student_name: "", student_identifier: "", assessment_type: "assignment", score: 0, max_score: 100, semester: "", date: new Date().toISOString().slice(0, 10), status: "draft" });

  const load = async () => { setLoading(true); try { setList(await base44.entities.StudentGrade.list()); setCourses(await base44.entities.Course.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.course_code || !form.student_name) { toast({ title: "Course and student required" }); return; }
    const c = courses.find((x) => x.code === form.course_code);
    try { await base44.entities.StudentGrade.create({ ...form, course_title: c?.title || "" }); setForm({ ...form, student_name: "", student_identifier: "", score: 0 }); setAdding(false); toast({ title: "Grade saved" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.StudentGrade.delete(id); load(); } catch {} };
  const avg = list.length ? (list.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / list.length).toFixed(1) : 0;

  return (
    <div className="space-y-4 max-w-[860px]">
      <div className="grid grid-cols-3 gap-3"><Stat label="Records" value={list.length} /><Stat label="Avg %" value={avg} /><Stat label="Published" value={list.filter((g) => g.status === "published").length} /></div>
      <SectionTitle title="Grades" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Field label="Course"><select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
          <UDSInput label="Student Name" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
          <UDSInput label="Matric / ID" value={form.student_identifier} onChange={(e) => setForm({ ...form, student_identifier: e.target.value })} />
          <Select label="Assessment" value={form.assessment_type} onChange={(v) => setForm({ ...form, assessment_type: v })} options={["assignment", "quiz", "test", "lab", "project", "midterm", "exam"]} />
          <UDSInput label="Score" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: +e.target.value })} />
          <UDSInput label="Max Score" type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: +e.target.value })} />
          <UDSInput label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["draft", "published"]} />
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Save grade</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No grades recorded." /> :
        <div className="space-y-2">{list.map((g) => (
          <div key={g.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{g.student_name} <span className="text-[12px] text-muted-foreground">({g.student_identifier || "—"})</span></p><p className="text-[12px] text-muted-foreground">{g.course_code} · {g.assessment_type} · {g.score}/{g.max_score} · {g.status}</p></div>
            <button onClick={() => del(g.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}

const Stat = ({ label, value }) => <div className="glass-card radius-lg p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-[20px] font-heading font-bold">{value}</p></div>;