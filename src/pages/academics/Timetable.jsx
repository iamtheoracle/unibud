import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { TIMETABLE_MOCK_ENTRIES } from "@/lib/academic/mockShapes";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const qc = useQueryClient();
  const tq = useQuery({ queryKey: ["timetable"], queryFn: () => base44.entities.TimetableEntry.list() });
  const { data: entries } = useMockFallback(tq, TIMETABLE_MOCK_ENTRIES);
  const [view, setView] = useState("weekly");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.TimetableEntry.update(editing.id, v) : base44.entities.TimetableEntry.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timetable"] }); toast({ title: editing?.id ? "Class updated" : "Class added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.TimetableEntry.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["timetable"] }); toast({ title: "Class removed" }); } });

  const openNew = () => { setEditing({}); setForm({ course_code: "", course_title: "", day: "Monday", start_time: "08:00", end_time: "10:00", location: "", lecturer: "", type: "lecture", color: "#7FD8FF" }); };
  const openEdit = (e) => { setEditing(e); setForm({ ...e }); };
  const submit = () => { if (!form.course_code || !form.course_title || !form.start_time || !form.end_time) { toast({ title: "Fill required fields" }); return; } save.mutate(form); };
  const byDay = (d) => (entries || []).filter((e) => e.day === d).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <ScreenShell title="Timetable" back actions={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>}>
      <div className="flex gap-2 mb-4">
        {[["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"]].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className={`flex-1 py-2 rounded-2xl text-[12px] font-semibold spring-tap ${view === k ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {view === "daily" && <DayColumn title={today} items={byDay(today)} onEdit={openEdit} onDel={del.mutate} highlight />}
      {view === "weekly" && (
        <div className="space-y-4">
          {DAYS.map((d) => <DayColumn key={d} title={d} items={byDay(d)} onEdit={openEdit} onDel={del.mutate} highlight={d === today} />)}
        </div>
      )}
      {view === "monthly" && (
        <div className="glass-card p-5">
          <p className="text-[12px] text-muted-foreground mb-3">Your weekly schedule repeats every week. Each class is a recurring weekly slot.</p>
          <div className="space-y-3">
            {DAYS.map((d) => <DayColumn key={d} title={d} items={byDay(d)} onEdit={openEdit} onDel={del.mutate} compact />)}
          </div>
        </div>
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Class" : "Add Class"}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Course Code" value={form.course_code || ""} onChange={(e) => setForm({ ...form, course_code: e.target.value })} />
            <GlassInput label="Course Title" value={form.course_title || ""} onChange={(e) => setForm({ ...form, course_title: e.target.value })} />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Day</label>
            <select value={form.day || "Monday"} onChange={(e) => setForm({ ...form, day: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Start Time" type="time" value={form.start_time || ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <GlassInput label="End Time" type="time" value={form.end_time || ""} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <GlassInput label="Venue" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <GlassInput label="Lecturer" value={form.lecturer || ""} onChange={(e) => setForm({ ...form, lecturer: e.target.value })} />
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Type</label>
            <select value={form.type || "lecture"} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">
              {["lecture", "lab", "tutorial", "seminar"].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <label className="block text-[12px] font-semibold text-muted-foreground/90 ml-1">Color</label>
          <input type="color" value={form.color || "#7FD8FF"} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 rounded-xl bg-muted/50 border border-border" />
        </div>
        <button onClick={submit} disabled={save.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{save.isPending ? "Saving…" : "Save Class"}</button>
      </Sheet>
    </ScreenShell>
  );
}

function DayColumn({ title, items, onEdit, onDel, highlight, compact }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className={`text-[13px] font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{title}</h3>
        <span className="text-[10px] text-muted-foreground">{items.length} class{items.length !== 1 ? "es" : ""}</span>
      </div>
      {items.length === 0 ? <p className="text-[12px] text-muted-foreground/60 py-2">No classes</p> : (
        <div className="space-y-2">
          {items.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }} className="glass-card p-3 flex items-center gap-3">
              <span className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: e.color || "#7FD8FF" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{e.course_code} · {e.course_title}</p>
                <p className="text-[11px] text-muted-foreground">{e.start_time}–{e.end_time}{e.location ? ` · ${e.location}` : ""}{e.lecturer ? ` · ${e.lecturer}` : ""}</p>
              </div>
              {!e.__mock && (<>
              <button onClick={() => onEdit(e)} className="text-[11px] font-semibold text-primary spring-tap">Edit</button>
              <button onClick={() => onDel(e.id)} className="text-[11px] font-semibold text-destructive spring-tap">Delete</button>
              </>)}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}