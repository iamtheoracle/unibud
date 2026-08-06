import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PortalRecords({ institution }) {
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setRecords(await base44.entities.StudentRecord.filter({ university: institution.name })); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [institution]);

  const filtered = records.filter((r) => !q || (r.full_name || "").toLowerCase().includes(q.toLowerCase()) || (r.matriculation_number || "").includes(q));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…"
            className="w-full h-12 pl-9 pr-4 rounded-2xl bg-muted/40 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60" />
        </div>
        {loading ? <p className="text-muted-foreground text-[14px]">Loading…</p>
          : filtered.length === 0 ? <p className="text-muted-foreground text-[13px]">No records.</p>
          : <div className="space-y-2 max-h-[72vh] overflow-y-auto no-scrollbar">
            {filtered.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)} className={`w-full text-left glass-card radius-lg p-3 spring-tap ${selected?.id === r.id ? "border-primary/40" : ""}`}>
                <p className="font-semibold text-[14px]">{r.full_name || "—"}</p>
                <p className="text-[12px] text-muted-foreground">{r.matriculation_number || "no matric"} · {r.level || "—"} · {r.department || "—"}</p>
              </button>
            ))}
          </div>}
      </div>
      <div>
        {selected ? <RecordDetail r={selected} /> : <div className="glass-card radius-lg p-10 text-center text-muted-foreground text-[14px] h-full flex items-center justify-center min-h-[300px]">Select a student to view records.</div>}
      </div>
    </div>
  );
}

function RecordDetail({ r }) {
  const rows = [
    ["Status", r.status], ["Matriculation", r.matriculation_number], ["Faculty", r.faculty],
    ["Department", r.department], ["Level", r.level], ["Enrollment Year", r.enrollment_year],
    ["Expected Graduation", r.expected_graduation], ["Verified", r.is_verified ? "Yes" : "No"],
    ["Last Active", r.last_active_at ? r.last_active_at.slice(0, 10) : "—"],
  ];
  return (
    <div className="space-y-4">
      <div className="glass-card radius-lg p-5">
        <h3 className="text-[17px] font-heading font-semibold">{r.full_name}</h3>
        <p className="text-[13px] text-muted-foreground">{r.email}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {rows.map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              <p className="text-[14px] font-medium">{String(v ?? "—")}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {["Registration", "Results", "Transcript", "Attendance", "Discipline", "Documents", "Graduation"].map((s) => (
          <div key={s} className="glass-card radius-lg p-4">
            <p className="text-[13px] font-semibold">{s}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Managed within the academic modules.</p>
          </div>
        ))}
      </div>
    </div>
  );
}