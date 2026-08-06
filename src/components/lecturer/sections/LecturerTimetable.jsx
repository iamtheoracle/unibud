import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Field, Select, Empty, SectionTitle, inputCls } from "../ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function LecturerTimetable() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ course_code: "", day: "Monday", start_time: "", end_time: "", location: "", type: "lecture" });

  const load = async () => { setLoading(true); try { setList(await base44.entities.TimetableEntry.list()); setCourses(await base44.entities.Course.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.course_code || !form.start_time || !form.end_time) { toast({ title: "Course and times required" }); return; }
    const c = courses.find((x) => x.code === form.course_code);
    try { await base44.entities.TimetableEntry.create({ ...form, course_title: c?.title || "" }); setForm({ course_code: "", day: "Monday", start_time: "", end_time: "", location: "", type: "lecture" }); setAdding(false); toast({ title: "Entry added" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.TimetableEntry.delete(id); load(); } catch {} };

  return (
    <div className="space-y-4 max-w-[820px]">
      <SectionTitle title="Timetable" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Field label="Course"><select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputCls}><option value="">—</option>{courses.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></Field></div>
          <Select label="Day" value={form.day} onChange={(v) => setForm({ ...form, day: v })} options={DAYS} />
          <UDSInput label="Start" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <UDSInput label="End" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <UDSInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["lecture", "lab", "tutorial", "seminar"]} />
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Add</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No timetable entries." /> :
        <div className="space-y-3">{DAYS.map((d) => { const items = list.filter((t) => t.day === d); if (!items.length) return null; return (
          <div key={d}><p className="text-[12px] font-semibold text-muted-foreground mb-1.5">{d}</p>
            <div className="space-y-2">{items.map((t) => (
              <div key={t.id} className="glass-card radius-lg p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{t.course_code} · {t.course_title}</p><p className="text-[12px] text-muted-foreground capitalize">{t.type} · {t.start_time}–{t.end_time} · {t.location || "—"}</p></div>
                <button onClick={() => del(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}</div>
          </div>); })}</div>}
    </div>
  );
}