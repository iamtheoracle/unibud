import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { EXAM_MOCK_ENTRIES } from "@/lib/academic/mockShapes";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

function countdown(date) {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  const diff = d - new Date();
  if (diff < 0) return null;
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000) };
}

export default function Exams() {
  const qc = useQueryClient();
  const eq = useQuery({ queryKey: ["exams"], queryFn: () => base44.entities.Exam.list("date", 50) });
  const { data: exams } = useMockFallback(eq, EXAM_MOCK_ENTRIES);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [budText, setBudText] = useState({});
  const [budLoading, setBudLoading] = useState({});

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.Exam.update(editing.id, v) : base44.entities.Exam.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); toast({ title: editing?.id ? "Exam saved" : "Exam added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.Exam.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); toast({ title: "Exam deleted" }); } });

  const openNew = () => { setEditing({}); setForm({ title: "", course_code: "", course_title: "", type: "final", date: "", start_time: "", duration_minutes: "", location: "", seat_number: "", status: "upcoming", topics: [], revision_progress: 0, confidence: 3 }); };
  const openEdit = (e) => { setEditing(e); setForm({ ...e, topics: e.topics || [] }); };

  const budSchedule = async (ex) => {
    setBudLoading((b) => ({ ...b, [ex.id]: true }));
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `You are Bud. Create a concise, day-by-day revision schedule for a student preparing for "${ex.title}" (${ex.course_code})${ex.topics?.length ? ` covering: ${ex.topics.join(", ")}` : ""}. Exam is on ${ex.date}. Keep it encouraging and practical.` });
      setBudText((t) => ({ ...t, [ex.id]: typeof res === "string" ? res : res?.response || "Here's a plan to get you ready." }));
    } catch { setBudText((t) => ({ ...t, [ex.id]: "I'm here — try again in a moment." })); }
    finally { setBudLoading((b) => ({ ...b, [ex.id]: false })); }
  };

  return (
    <ScreenShell title="Exams" back actions={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>}>
      {!exams?.length ? <EmptyState message="No exams scheduled. Add an exam to start planning your revision." /> : (
        <div className="space-y-3">
          {exams.map((ex, i) => {
            const cd = countdown(ex.date);
            return (
              <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} className="glass-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-foreground truncate">{ex.title}</p>
                    <p className="text-[11px] text-muted-foreground">{ex.course_code}{ex.type ? ` · ${ex.type}` : ""}</p>
                  </div>
                  {cd ? <div className="text-right flex-shrink-0"><p className="font-heading font-bold text-[16px] text-primary">{cd.days}d</p><p className="text-[9px] text-muted-foreground">{cd.hours}h left</p></div> : <span className="text-[11px] text-muted-foreground capitalize flex-shrink-0">{ex.status}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{ex.date}{ex.start_time ? ` · ${ex.start_time}` : ""}{ex.duration_minutes ? ` · ${ex.duration_minutes}min` : ""}{ex.location ? ` · ${ex.location}` : ""}{ex.seat_number ? ` · Seat ${ex.seat_number}` : ""}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Revision progress</span><span>{Math.round(ex.revision_progress || 0)}%</span></div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${ex.revision_progress || 0}%` }} /></div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-muted-foreground">Confidence</span>
                  {[1, 2, 3, 4, 5].map((n) => <span key={n} className={`w-2.5 h-2.5 rounded-full ${n <= (ex.confidence || 3) ? "bg-primary" : "bg-muted"}`} />)}
                </div>
                <button onClick={() => budSchedule(ex)} disabled={budLoading[ex.id]} className="mt-3 text-[12px] font-semibold text-primary spring-tap">{budLoading[ex.id] ? "Bud is planning…" : "Ask Bud for a revision schedule"}</button>
                {budText[ex.id] && <p className="text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2 p-3 rounded-2xl bg-primary/8 border border-primary/15">{budText[ex.id]}</p>}
                <div className="flex gap-3 mt-3">
                  {!ex.__mock && (<>
                  <button onClick={() => openEdit(ex)} className="text-[12px] font-semibold text-primary spring-tap">Edit</button>
                  <button onClick={() => del.mutate(ex.id)} className="text-[12px] font-semibold text-destructive spring-tap ml-auto">Delete</button>
                  </>)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Exam" : "Add Exam"}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Type</label>
              <select value={form.type || "final"} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["midterm", "final", "quiz", "practical", "oral"].map((t) => <option key={t} value={t}>{t}</option>)}</select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Course Code" value={form.course_code || ""} onChange={(e) => setForm({ ...form, course_code: e.target.value })} />
            <GlassInput label="Course Title" value={form.course_title || ""} onChange={(e) => setForm({ ...form, course_title: e.target.value })} />
          </div>
          <GlassInput label="Date" type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Start Time" type="time" value={form.start_time || ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <GlassInput label="Duration (min)" type="number" value={form.duration_minutes || ""} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          </div>
          <GlassInput label="Venue" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <GlassInput label="Seat Number" value={form.seat_number || ""} onChange={(e) => setForm({ ...form, seat_number: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Revision %" type="number" value={form.revision_progress || 0} onChange={(e) => setForm({ ...form, revision_progress: Number(e.target.value) })} />
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Confidence</label>
              <select value={form.confidence || 3} onChange={(e) => setForm({ ...form, confidence: Number(e.target.value) })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select>
            </div>
          </div>
          <GlassInput label="Topics (comma separated)" value={(form.topics || []).join(", ")} onChange={(e) => setForm({ ...form, topics: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        </div>
        <button onClick={() => { if (!form.title || !form.course_code || !form.date) { toast({ title: "Title, course and date required" }); return; } save.mutate(form); }} disabled={save.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{save.isPending ? "Saving…" : "Save Exam"}</button>
      </Sheet>
    </ScreenShell>
  );
}