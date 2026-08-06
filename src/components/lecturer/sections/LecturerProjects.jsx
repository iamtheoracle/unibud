import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Select, Empty, SectionTitle, textareaCls } from "../ui";

export default function LecturerProjects() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", supervisor: "", deadline: "", status: "planning", notes: "" });

  const load = async () => { setLoading(true); try { setList(await base44.entities.Project.list()); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title) { toast({ title: "Title required" }); return; }
    try { await base44.entities.Project.create(form); setForm({ title: "", supervisor: "", deadline: "", status: "planning", notes: "" }); setAdding(false); toast({ title: "Project created" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.Project.delete(id); load(); } catch {} };

  return (
    <div className="space-y-4 max-w-[820px]">
      <SectionTitle title="Projects" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <UDSInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <UDSInput label="Supervisor" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} />
          <UDSInput label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["planning", "in_progress", "review", "completed"]} />
          <div className="md:col-span-2"><span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Notes</span><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={textareaCls} /></div>
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Create</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No projects yet." /> :
        <div className="space-y-2">{list.map((p) => (
          <div key={p.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{p.title}</p><p className="text-[12px] text-muted-foreground capitalize">{p.status} · {p.supervisor || "—"} · {p.deadline || "—"}</p></div>
            <button onClick={() => del(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}