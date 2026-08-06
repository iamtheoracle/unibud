import React, { useEffect, useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Field, Select, Empty, SectionTitle, inputCls } from "../ui";

export default function LecturerExams() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", course_code: "", type: "final", date: "", start_time: "", end_time: "", location: "", topics: "" });
  const [gen, setGen] = useState({ course: "", topics: "", loading: false });

  const load = async () => { setLoading(true); try { setList(await base44.entities.Exam.list()); setCourses(await base44.entities.Course.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.course_code || !form.date) { toast({ title: "Title, course and date required" }); return; }
    const c = courses.find((x) => x.code === form.course_code);
    try { await base44.entities.Exam.create({ title: form.title, course_code: form.course_code, course_title: c?.title || "", type: form.type, date: form.date, start_time: form.start_time, end_time: form.end_time, location: form.location, status: "upcoming", topics: form.topics ? form.topics.split(",").map((t) => t.trim()).filter(Boolean) : [] }); setForm({ title: "", course_code: "", type: "final", date: "", start_time: "", end_time: "", location: "", topics: "" }); setAdding(false); toast({ title: "Exam created" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.Exam.delete(id); load(); } catch {} };
  const generate = async () => {
    if (!gen.course) { toast({ title: "Select a course" }); return; }
    setGen((g) => ({ ...g, loading: true }));
    try { await base44.integrations.Core.InvokeLLM({ prompt: `Create a balanced final exam paper for ${gen.course}. Topics: ${gen.topics || "core syllabus"}. Include 5 short-answer and 2 essay questions with mark allocations.` }); await base44.entities.Exam.create({ title: `Generated Exam: ${gen.course}`, course_code: gen.course, type: "final", date: new Date().toISOString().slice(0, 10), status: "upcoming", topics: gen.topics ? gen.topics.split(",").map((t) => t.trim()) : [] }); toast({ title: "Exam draft generated" }); load(); }
    catch { toast({ title: "Generation failed" }); }
    finally { setGen((g) => ({ ...g, loading: false })); }
  };

  return (
    <div className="space-y-4 max-w-[820px]">
      <SectionTitle title="Exams" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <UDSInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div><Field label="Course"><select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
          <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["midterm", "final", "quiz", "practical", "oral"]} />
          <UDSInput label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <UDSInput label="Start" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <UDSInput label="End" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <UDSInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <UDSInput label="Topics (comma separated)" value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} />
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Create</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[13px] font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Generate Exam with Bud</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Field label="Course"><select value={gen.course} onChange={(e) => setGen({ ...gen, course: e.target.value })} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
          <UDSInput label="Topics" value={gen.topics} onChange={(e) => setGen({ ...gen, topics: e.target.value })} placeholder="comma separated" />
        </div>
        <UDSButton onClick={generate} disabled={gen.loading}>{gen.loading ? "Generating…" : "Generate exam draft"}</UDSButton>
      </div>
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No exams scheduled." /> :
        <div className="space-y-2">{list.map((e) => (
          <div key={e.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{e.title}</p><p className="text-[12px] text-muted-foreground capitalize">{e.type} · {e.course_code} · {e.date} · {e.status}</p></div>
            <button onClick={() => del(e.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}