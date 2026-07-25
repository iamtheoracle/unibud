import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import PortalKPI from "../PortalKPI";

const STATUS = ["submitted", "under_review", "offered", "accepted", "rejected", "waitlisted"];

export default function PortalAdmissions({ institution }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ applicant_name: "", applicant_email: "", programme: "" });

  const load = async () => {
    setLoading(true);
    try { setApps(await base44.entities.Admission.filter({ institution_id: institution.id })); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [institution]);

  const create = async () => {
    if (!form.applicant_name) { toast({ title: "Applicant name required" }); return; }
    try {
      await base44.entities.Admission.create({ ...form, institution_id: institution.id, status: "submitted", applied_date: new Date().toISOString().slice(0, 10) });
      setForm({ applicant_name: "", applicant_email: "", programme: "" });
      setAdding(false);
      toast({ title: "Application added" });
      load();
    } catch { toast({ title: "Failed to add" }); }
  };
  const setStatus = async (id, status) => {
    try { await base44.entities.Admission.update(id, { status, accepted_at: status === "accepted" ? new Date().toISOString() : undefined }); load(); } catch {}
  };

  const a = { total: apps.length, reviewing: apps.filter((x) => x.status === "under_review").length, offered: apps.filter((x) => x.status === "offered").length, accepted: apps.filter((x) => x.status === "accepted").length, verified: apps.filter((x) => x.documents_verified).length };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <PortalKPI label="Total" value={a.total} accent />
        <PortalKPI label="Under Review" value={a.reviewing} />
        <PortalKPI label="Offered" value={a.offered} />
        <PortalKPI label="Accepted" value={a.accepted} />
        <PortalKPI label="Docs Verified" value={a.verified} />
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-[15px] font-heading font-semibold">Applications</h3>
        <UDSButton size="sm" onClick={() => setAdding((v) => !v)}><Plus className="w-4 h-4 mr-1" />New</UDSButton>
      </div>

      {adding && (
        <div className="glass-card radius-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <UDSInput label="Applicant Name" value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} />
          <UDSInput label="Email" value={form.applicant_email} onChange={(e) => setForm({ ...form, applicant_email: e.target.value })} />
          <UDSInput label="Programme" value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} />
          <div className="md:col-span-3 flex gap-2">
            <UDSButton onClick={create}>Add application</UDSButton>
            <UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground text-[14px]">Loading…</p>
        : apps.length === 0 ? <div className="glass-card radius-lg p-8 text-center text-muted-foreground text-[14px]">No applications yet.</div>
        : <div className="space-y-2">
          {apps.map((x) => (
            <div key={x.id} className="glass-card radius-lg p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px]">{x.applicant_name}</p>
                <p className="text-[12px] text-muted-foreground truncate">{x.applicant_email} · {x.programme || "—"} · {x.applied_date}</p>
              </div>
              <select value={x.status} onChange={(e) => setStatus(x.id, e.target.value)} className="h-9 px-3 rounded-lg bg-muted/50 border border-border text-[13px] capitalize">
                {STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          ))}
        </div>}
    </div>
  );
}