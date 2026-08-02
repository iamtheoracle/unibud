import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { NOTE_MOCK_ENTRIES } from "@/lib/academic/mockShapes2";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const TYPES = ["text", "voice", "image", "handwritten", "scanned"];

export default function Notes() {
  const qc = useQueryClient();
  const nq = useQuery({ queryKey: ["notes"], queryFn: () => base44.entities.Note.list("-created_date", 200) });
  const { data: notes } = useMockFallback(nq, NOTE_MOCK_ENTRIES);
  const { data: courses } = useQuery({ queryKey: ["noteCourses"], queryFn: () => base44.entities.Course.list() });
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.Note.update(editing.id, v) : base44.entities.Note.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); toast({ title: editing?.id ? "Note saved" : "Note added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.Note.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); toast({ title: "Note deleted" }); } });

  const filtered = (notes || []).filter((n) => (course === "all" || n.course_code === course) && (!q || (n.title + (n.content || "")).toLowerCase().includes(q.toLowerCase())));

  const openNew = () => { setEditing({}); setForm({ title: "", content: "", note_type: "text", course_code: "", file_url: "", tags: [] }); };
  const openEdit = (n) => { setEditing(n); setForm({ ...n }); };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); setForm((s) => ({ ...s, file_url })); toast({ title: "File uploaded" }); }
    catch { toast({ title: "Upload failed" }); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const submit = () => { if (!form.title) { toast({ title: "Title required" }); return; } save.mutate(form); };

  return (
    <ScreenShell title="Notes" back actions={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="w-full h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 mb-3" />
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        <button onClick={() => setCourse("all")} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${course === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>All</button>
        {(courses || []).map((c) => <button key={c.id} onClick={() => setCourse(c.code)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${course === c.code ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>{c.code}</button>)}
      </div>
      {!filtered.length ? <EmptyState message="No notes yet. Create a note to capture your ideas." /> : (
        <div className="space-y-3">
          {filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-medium text-foreground truncate">{n.title}</p>
                <span className="text-[10px] text-muted-foreground capitalize flex-shrink-0">{n.note_type}</span>
              </div>
              {n.course_code && <p className="text-[11px] text-muted-foreground mt-0.5">{n.course_code}</p>}
              {n.content && <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">{n.content}</p>}
              {n.file_url && <a href={n.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-primary mt-2 inline-block">Open attachment</a>}
              <div className="flex gap-3 mt-3">
                {!n.__mock && (<>
                <button onClick={() => openEdit(n)} className="text-[12px] font-semibold text-primary spring-tap">Edit</button>
                <button onClick={() => del.mutate(n.id)} className="text-[12px] font-semibold text-destructive spring-tap ml-auto">Delete</button>
                </>)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Note" : "New Note"}>
        <div className="space-y-3.5">
          <GlassInput label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Type</label>
              <select value={form.note_type || "text"} onChange={(e) => setForm({ ...form, note_type: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Course</label>
              <select value={form.course_code || ""} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60"><option value="">None</option>{(courses || []).map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}</select>
            </div>
          </div>
          {form.note_type === "text" ? (
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Content</label>
              <textarea value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="mt-1.5 w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" />
            </div>
          ) : (
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">File</label>
              <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
              <label className="mt-1.5 flex items-center gap-3 h-[48px] px-4 rounded-2xl glass cursor-pointer">
                <span className="text-[13px] text-muted-foreground flex-1">{form.file_url ? "File selected — tap to change" : uploading ? "Uploading…" : "Tap to upload"}</span>
              </label>
            </div>
          )}
        </div>
        <button onClick={submit} disabled={save.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{save.isPending ? "Saving…" : "Save Note"}</button>
      </Sheet>
    </ScreenShell>
  );
}