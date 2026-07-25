import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Select, Empty, SectionTitle, textareaCls } from "../ui";

export default function LecturerResearch({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", abstract: "", type: "project", category: "other", status: "active", paper_url: "" });

  const load = async () => { setLoading(true); try { const all = await base44.entities.ResearchProject.list(); setList(all.filter((r) => r.author_id === user?.id || r.author_name === user?.full_name)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!form.title) { toast({ title: "Title required" }); return; }
    try { await base44.entities.ResearchProject.create({ ...form, author_name: user?.full_name || "Lecturer", author_id: user?.id, author_role: "lecturer" }); setForm({ title: "", abstract: "", type: "project", category: "other", status: "active", paper_url: "" }); setAdding(false); toast({ title: "Research added" }); load(); }
    catch { toast({ title: "Failed" }); }
  };
  const del = async (id) => { try { await base44.entities.ResearchProject.delete(id); load(); } catch {} };

  return (
    <div className="space-y-4 max-w-[820px]">
      <SectionTitle title="Research" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>} />
      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <UDSInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["research_group", "publication", "project", "collaboration", "laboratory", "funding", "event", "competition", "thesis", "dissertation"]} />
          <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={["computer_science", "engineering", "medicine", "sciences", "social_sciences", "humanities", "business", "law", "education", "agriculture", "environmental", "interdisciplinary", "other"]} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["planning", "active", "published", "completed", "on_hold"]} />
          <UDSInput label="Paper URL" value={form.paper_url} onChange={(e) => setForm({ ...form, paper_url: e.target.value })} />
          <div className="md:col-span-2"><span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Abstract</span><textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} rows={3} className={textareaCls} /></div>
          <div className="md:col-span-2 flex gap-2"><UDSButton onClick={create}>Create</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No research projects yet." /> :
        <div className="space-y-2">{list.map((r) => (
          <div key={r.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{r.title}</p><p className="text-[12px] text-muted-foreground capitalize">{r.type} · {r.category} · {r.status}</p></div>
            {r.paper_url && <a href={r.paper_url} target="_blank" rel="noreferrer" className="text-[12px] text-primary font-semibold">Paper</a>}
            <button onClick={() => del(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}