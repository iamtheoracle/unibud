import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, StatusPill, DataTable, SearchInput, Btn, LoadingState } from "@/components/oracle/oracle-ui";
import { Building2, Plus, Power, Archive, Pencil, X } from "lucide-react";

const TYPES = ["university", "private_university", "polytechnic", "college_of_education", "technical_college", "online_academy", "other"];

export default function InstitutionRegistry() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await base44.entities.Institution.list("-created_date", 200)); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => (r.name || "").toLowerCase().includes(q.toLowerCase()) || (r.short_name || "").toLowerCase().includes(q.toLowerCase()));

  const setStatus = async (r, status) => {
    try { await base44.entities.Institution.update(r.id, { status }); toast({ title: `Institution ${status}` }); load(); }
    catch { toast({ title: "Action failed", variant: "destructive" }); }
  };

  const columns = [
    { key: "name", label: "Institution", render: (r) => (
      <div className="min-w-0"><p className="font-medium truncate">{r.name}</p><p className="text-[10px] text-muted-foreground truncate">{r.short_name} · {r.type?.replace(/_/g, " ")}</p></div>
    ) },
    { key: "country", label: "Location", render: (r) => <span className="text-muted-foreground">{[r.city, r.country].filter(Boolean).join(", ") || "—"}</span> },
    { key: "verification_status", label: "Verification", render: (r) => <StatusPill status={r.verification_status} /> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "students", label: "Students", render: (r) => r.estimated_student_count || "—" },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        {r.status === "suspended"
          ? <Btn variant="soft" onClick={() => setStatus(r, "active")}><Power className="w-3 h-3" />Activate</Btn>
          : <Btn variant="soft" onClick={() => setStatus(r, "suspended")}><Power className="w-3 h-3" />Suspend</Btn>}
        <Btn variant="ghost" onClick={() => toast({ title: "Archive queued" })}><Archive className="w-3 h-3" /></Btn>
        <Btn variant="ghost" onClick={() => toast({ title: "Editor opening…", description: "Branding, calendar & feature toggles" })}><Pencil className="w-3 h-3" /></Btn>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Institution Registry" desc="Onboard, verify, suspend and manage every institution on UNIBUD."
        actions={<Btn onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />Create Institution</Btn>} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search institutions…" />
        <p className="text-[11px] text-muted-foreground">{filtered.length} of {rows.length}</p>
      </div>

      <Panel title="All Institutions" icon={Building2}>
        {loading ? <LoadingState /> : <DataTable columns={columns} rows={filtered} empty="No institutions found" />}
      </Panel>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", short_name: "", type: "university", country: "", city: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name) return toast({ title: "Name is required", variant: "destructive" });
    setSaving(true);
    try {
      await base44.entities.Institution.create({ ...form, verification_status: "awaiting_verification", status: "active" });
      toast({ title: "Institution created" });
      onCreated();
    } catch { toast({ title: "Create failed", variant: "destructive" }); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-[440px] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-[16px]">Create Institution</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Official name *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="oracle-input" /></Field>
          <Field label="Short name"><input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} className="oracle-input" /></Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="oracle-input">
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="oracle-input" /></Field>
            <Field label="Country"><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="oracle-input" /></Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="soft" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={saving}>{saving ? "Saving…" : "Create"}</Btn>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="text-[11px] font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}