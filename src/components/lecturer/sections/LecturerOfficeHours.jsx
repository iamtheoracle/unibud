import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Select, SectionTitle } from "../ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function LecturerOfficeHours() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day: "Monday", start: "10:00", end: "11:00", location: "Office" });

  useEffect(() => {
    (async () => {
      try { const me = await base44.auth.me(); setSlots(me.office_hours || me.data?.office_hours || []); } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const save = async (next) => {
    try { await base44.auth.updateMe({ office_hours: next }); setSlots(next); }
    catch { toast({ title: "Save failed" }); }
  };
  const add = () => { if (!form.start || !form.end) return; save([...slots, { ...form, id: Date.now().toString() }]); setForm({ day: "Monday", start: "10:00", end: "11:00", location: "Office" }); toast({ title: "Slot added" }); };
  const remove = (id) => save(slots.filter((s) => s.id !== id));

  return (
    <div className="space-y-4 max-w-[640px]">
      <p className="text-[13px] text-muted-foreground">Set weekly office hours so students know when to reach you.</p>
      <SectionTitle title="Office Hours" />
      <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select label="Day" value={form.day} onChange={(v) => setForm({ ...form, day: v })} options={DAYS} />
        <UDSInput label="Start" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
        <UDSInput label="End" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        <UDSInput label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div className="md:col-span-4"><UDSButton size="sm" onClick={add}><Plus className="w-4 h-4 mr-1" />Add slot</UDSButton></div>
      </div>
      {loading ? <p className="text-muted-foreground">Loading…</p> : slots.length === 0 ? <p className="text-muted-foreground text-[13px]">No slots set.</p> :
        <div className="space-y-2">{slots.map((s) => (
          <div key={s.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1"><p className="font-semibold text-[14px]">{s.day} · {s.start}–{s.end}</p><p className="text-[12px] text-muted-foreground">{s.location}</p></div>
            <button onClick={() => remove(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}