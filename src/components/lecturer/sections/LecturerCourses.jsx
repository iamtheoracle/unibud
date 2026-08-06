import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Field, Empty, SectionTitle, inputCls, textareaCls } from "../ui";

export default function LecturerCourses({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", department: "", credits: 3, semester: "", schedule: "", location: "" });

  const load = async () => { setLoading(true); try { setList(await base44.entities.Course.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.code) { toast({ title: "Title and code required" }); return; }
    try { await base44.entities.Course.create({ ...form, lecturer: user?.full_name || "", status: "active" }); setForm({ title: "", code: "", department: "", credits: 3, semester: "", schedule: "", location: "" }); setAdding(false); toast({ title: "Course created" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.Course.delete(id); load(); } catch {} };

  return (
    <div className="space-y-4 max-w-[820px]">
      <SectionTitle title="My Courses" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <UDSInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <UDSInput label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <UDSInput label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <UDSInput label="Credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: +e.target.value })} />
          <UDSInput label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <UDSInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="md:col-span-2"><Field label="Schedule"><input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={inputCls} placeholder="Mon 10:00–11:30, Wed…" /></Field></div>
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Create course</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No courses yet. Create your first course." /> :
        <div className="space-y-2">{list.map((c) => (
          <div key={c.id} className="glass-card radius-lg p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{c.title}</p><p className="text-[12px] text-muted-foreground">{c.code} · {c.department || "—"} · {c.credits} credits · {c.schedule || "—"}</p></div>
            <button onClick={() => del(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
      <NotesUpload />
    </div>
  );
}

function NotesUpload() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [course, setCourse] = useState("");

  const load = async () => { try { setNotes(await base44.entities.Note.list()); setCourses(await base44.entities.Course.list()); } catch {} };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!title) { toast({ title: "Title required" }); return; }
    try { await base44.entities.Note.create({ title, content, course_code: course, note_type: "text" }); setTitle(""); setContent(""); setCourse(""); toast({ title: "Note uploaded" }); load(); }
    catch { toast({ title: "Failed" }); }
  };

  return (
    <div className="space-y-3">
      <SectionTitle title="Lecture Notes" />
      <div className="glass-card radius-lg p-4 space-y-3">
        <UDSInput label="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div><Field label="Course"><select value={course} onChange={(e) => setCourse(e.target.value)} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
        <div><Field label="Content"><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className={textareaCls} /></Field></div>
        <UDSButton onClick={upload}>Upload note</UDSButton>
      </div>
      {notes.length > 0 && <div className="space-y-2">{notes.map((n) => <div key={n.id} className="glass-card radius-lg p-3"><p className="font-semibold text-[14px]">{n.title}</p><p className="text-[12px] text-muted-foreground">{n.course_code || "—"}</p></div>)}</div>}
    </div>
  );
}