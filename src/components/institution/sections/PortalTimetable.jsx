import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TYPES = ["lecture", "lab", "tutorial", "seminar", "practical", "event"];

export default function PortalTimetable({ institution }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", course_code: "", day: "Monday", start_time: "08:00", end_time: "10:00", room: "", lecturer: "", type: "lecture" });

  const load = async () => { setLoading(true); try { setEntries(await base44.entities.InstitutionTimetable.filter({ institution_id: institution.id })); } catch {} finally { setLoading(false); } };
  useEffect(() => { if (institution?.id) load(); }, [institution?.id]);

  const overlap = (a, b) => a.day === b.day && a.start_time < b.end_time && b.start_time < a.end_time;
  const isClash = (e) => entries.some((o) => o.id !== e.id && overlap(e, o) && (o.room === e.room || o.lecturer === e.lecturer));
  const clashes = entries.filter(isClash);

  const add = async () => {
    if (!form.title.trim()) { toast({ title: "Title required" }); return; }
    try {
      await base44.entities.InstitutionTimetable.create({ ...form, institution_id: institution.id });
      setForm({ title: "", course_code: "", day: "Monday", start_time: "08:00", end_time: "10:00", room: "", lecturer: "", type: "lecture" });
      load();
      toast({ title: "Session added" });
    } catch { toast({ title: "Add failed" }); }
  };
  const remove = async (id) => { try { await base44.entities.InstitutionTimetable.delete(id); load(); } catch {} };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /><h1 className="text-[20px] font-heading font-bold">Timetabling</h1></div>

      {clashes.length > 0 && (
        <div className="glass-card radius-lg p-4 border border-destructive/40 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div><p className="font-semibold text-[14px] text-destructive">{clashes.length} clash(es) detected</p><p className="text-[12px] text-muted-foreground">Same room or lecturer booked for overlapping times. Resolve the highlighted sessions below.</p></div>
        </div>
      )}

      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[13px] font-heading font-semibold">Add session</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lecture / Lab" /></div>
          <div><Label>Course code</Label><Input value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} /></div>
          <div><Label>Day</Label><Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
          <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          <div><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
          <div><Label>Lecturer</Label><Input value={form.lecturer} onChange={(e) => setForm({ ...form, lecturer: e.target.value })} /></div>
        </div>
        <Button onClick={add}><Plus className="w-4 h-4 mr-1" />Add session</Button>
      </div>

      <div>
        <p className="text-[13px] font-heading font-semibold mb-2">Sessions ({entries.length})</p>
        {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : entries.length === 0 ? <p className="text-muted-foreground text-[13px]">No sessions scheduled.</p> :
          <div className="space-y-2">{[...entries].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start_time.localeCompare(b.start_time)).map((e) => {
            const clash = isClash(e);
            return (
              <div key={e.id} className={`glass-card radius-lg p-3 flex items-center gap-3 ${clash ? "border-destructive/50" : ""}`}>
                <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{e.title} {e.course_code && <span className="text-muted-foreground font-normal">· {e.course_code}</span>}</p><p className="text-[12px] text-muted-foreground">{e.day} · {e.start_time}–{e.end_time} · {e.room || "no room"} · {e.lecturer || "—"}</p></div>
                {clash && <span className="text-[11px] font-semibold text-destructive flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />Clash</span>}
                <span className="text-[11px] capitalize text-muted-foreground">{e.type}</span>
                <button onClick={() => remove(e.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}</div>}
      </div>
    </div>
  );
}