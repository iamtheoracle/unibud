import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

export default function Courses() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: courses } = useQuery({ queryKey: ["courses"], queryFn: () => base44.entities.Course.list() });
  const { data: attendance } = useQuery({ queryKey: ["attForCourses"], queryFn: () => base44.entities.AttendanceRecord.list() });
  const [q, setQ] = useState("");
  const [sem, setSem] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const semesters = useMemo(() => {
    const s = new Set((courses || []).map((c) => c.semester).filter(Boolean));
    return ["all", ...s];
  }, [courses]);

  const filtered = useMemo(() => {
    let list = courses || [];
    if (sem !== "all") list = list.filter((c) => c.semester === sem);
    if (q) list = list.filter((c) => (c.title + c.code + (c.lecturer || "")).toLowerCase().includes(q.toLowerCase()));
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [courses, sem, q]);

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.Course.update(editing.id, v) : base44.entities.Course.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); toast({ title: editing?.id ? "Course updated" : "Course added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.Course.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); toast({ title: "Course deleted" }); } });
  const pin = useMutation({ mutationFn: (c) => base44.entities.Course.update(c.id, { pinned: !c.pinned }), onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }) });
  const archive = useMutation({ mutationFn: (id) => base44.entities.Course.update(id, { status: "completed" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); toast({ title: "Course archived" }); } });

  const attFor = (code) => {
    const recs = (attendance || []).filter((a) => a.course_code === code);
    if (!recs.length) return null;
    const present = recs.filter((a) => a.status === "present" || a.status === "excused").length;
    return Math.round((present / recs.length) * 100);
  };

  const openNew = () => { setEditing({}); setForm({ code: "", title: "", lecturer: "", credits: "", semester: "", faculty: "", department: "", grade: "", color: "#7FD8FF" }); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); };
  const submit = () => { if (!form.code || !form.title) { toast({ title: "Code and title required" }); return; } save.mutate({ ...form, credits: Number(form.credits) || 0 }); };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="My Courses" action={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…" className="w-full h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 mb-3" />
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {semesters.map((s) => (
          <button key={s} onClick={() => setSem(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${sem === s ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{s === "all" ? "All" : s}</button>
        ))}
      </div>
      {!filtered.length ? <EmptyState message="No courses yet. Add your first course to get started." /> : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const att = attFor(c.code);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} className="glass-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color || "#7FD8FF" }} />
                      <p className="text-[14px] font-semibold text-foreground truncate">{c.title}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.code}{c.lecturer ? ` · ${c.lecturer}` : ""}</p>
                  </div>
                  <button onClick={() => pin.mutate(c)} className={`text-[11px] font-semibold spring-tap flex-shrink-0 ${c.pinned ? "text-primary" : "text-muted-foreground"}`}>{c.pinned ? "Pinned" : "Pin"}</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <Mini label="Credits" value={c.credits || "—"} />
                  <Mini label="Grade" value={c.grade || "—"} />
                  <Mini label="Attendance" value={att != null ? `${att}%` : "—"} />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Assignment progress</span><span>{Math.round(c.progress || 0)}%</span></div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${c.progress || 0}%` }} /></div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{[c.faculty, c.department, c.semester].filter(Boolean).join(" · ")}</p>
                <div className="flex gap-3 mt-3">
                  <button onClick={() => navigate(`/course/${c.id}`)} className="text-[12px] font-semibold text-primary spring-tap">Space</button>
                  <button onClick={() => openEdit(c)} className="text-[12px] font-semibold text-primary spring-tap">Edit</button>
                  {c.status !== "completed" && <button onClick={() => archive.mutate(c.id)} className="text-[12px] font-semibold text-muted-foreground spring-tap">Archive</button>}
                  <button onClick={() => del.mutate(c.id)} className="text-[12px] font-semibold text-destructive spring-tap ml-auto">Delete</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Course" : "Add Course"}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Course Code" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CSC 101" />
            <GlassInput label="Credits" type="number" value={form.credits || ""} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
          </div>
          <GlassInput label="Course Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Introduction to Computing" />
          <GlassInput label="Lecturer" value={form.lecturer || ""} onChange={(e) => setForm({ ...form, lecturer: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Semester" value={form.semester || ""} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="First Semester" />
            <GlassInput label="Grade" value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Faculty" value={form.faculty || ""} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
            <GlassInput label="Department" value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <label className="block text-[12px] font-semibold text-muted-foreground/90 ml-1">Color</label>
          <input type="color" value={form.color || "#7FD8FF"} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 rounded-xl bg-muted/50 border border-border" />
        </div>
        <button onClick={submit} disabled={save.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{save.isPending ? "Saving…" : "Save Course"}</button>
      </Sheet>
    </div>
  );
}

function Mini({ label, value }) {
  return (<div className="p-2 rounded-xl bg-muted/40"><p className="font-heading font-bold text-[14px] text-foreground">{value}</p><p className="text-[9px] text-muted-foreground">{label}</p></div>);
}