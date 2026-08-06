import React, { useEffect, useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Field, Select, Empty, SectionTitle, inputCls } from "../ui";

export default function LecturerAssignments() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", course_code: "", due_date: "", type: "assignment", priority: "medium" });
  const [gen, setGen] = useState({ topic: "", count: 5, loading: false });

  const load = async () => { setLoading(true); try { setList(await base44.entities.Assignment.list()); setCourses(await base44.entities.Course.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.course_code) { toast({ title: "Title and course required" }); return; }
    const c = courses.find((x) => x.code === form.course_code);
    try { await base44.entities.Assignment.create({ ...form, course_title: c?.title || "", status: "pending" }); setForm({ title: "", course_code: "", due_date: "", type: "assignment", priority: "medium" }); setAdding(false); toast({ title: "Assignment created" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.Assignment.delete(id); load(); } catch {} };
  const generate = async () => {
    if (!gen.topic) { toast({ title: "Enter a topic" }); return; }
    setGen((g) => ({ ...g, loading: true }));
    try { const res = await base44.integrations.Core.InvokeLLM({ prompt: `Generate ${gen.count} quiz questions (mix of MCQ and short answer) on: ${gen.topic}. Format as a numbered list with answers.` }); await base44.entities.Assignment.create({ title: `Quiz: ${gen.topic}`, course_code: "", course_title: "", type: "quiz", status: "pending", priority: "medium", description: typeof res === "string" ? res : JSON.stringify(res) }); toast({ title: "Quiz generated" }); load(); }
    catch { toast({ title: "Generation failed" }); }
    finally { setGen((g) => ({ ...g, loading: false })); }
  };

  return (
    <div className="space-y-4 max-w-[820px]">
      <SectionTitle title="Assignments" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <UDSInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div><Field label="Course"><select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
          <UDSInput label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["assignment", "quiz", "exam", "lab", "project"]} />
          <Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["low", "medium", "high"]} />
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Create</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[13px] font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Generate Quiz with Bud</p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
          <UDSInput label="Topic" value={gen.topic} onChange={(e) => setGen({ ...gen, topic: e.target.value })} placeholder="e.g. Data Structures" />
          <UDSInput label="Questions" type="number" value={gen.count} onChange={(e) => setGen({ ...gen, count: +e.target.value })} />
        </div>
        <UDSButton onClick={generate} disabled={gen.loading}>{gen.loading ? "Generating…" : "Generate quiz"}</UDSButton>
      </div>
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No assignments yet." /> :
        <div className="space-y-2">{list.map((a) => (
          <div key={a.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{a.title}</p><p className="text-[12px] text-muted-foreground capitalize">{a.type} · {a.course_code || "—"} · due {a.due_date || "—"} · {a.status}</p></div>
            <button onClick={() => del(a.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}