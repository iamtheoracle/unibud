import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Empty } from "../ui";

export default function LecturerClassLists() {
  const [recs, setRecs] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setRecs(await base44.entities.StudentRecord.list()); } catch {} finally { setLoading(false); } })(); }, []);
  const f = recs.filter((r) => !q || (r.full_name || "").toLowerCase().includes(q.toLowerCase()) || (r.matriculation_number || "").includes(q) || (r.department || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4 max-w-[820px]">
      <p className="text-[13px] text-muted-foreground">Student directory for your institution. Search to build class lists.</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, matric, department…" className="w-full h-12 pl-9 pr-4 rounded-2xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Students" value={f.length} />
      </div>
      {loading ? <p className="text-muted-foreground">Loading…</p> : f.length === 0 ? <Empty label="No students found." /> :
        <div className="space-y-2">{f.slice(0, 60).map((r) => (
          <div key={r.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 grid place-items-center text-[12px] font-bold text-primary">{(r.full_name || "?").slice(0, 1)}</div>
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{r.full_name || "—"}</p><p className="text-[12px] text-muted-foreground">{r.matriculation_number || "—"} · {r.department || "—"} · {r.level || "—"}</p></div>
          </div>
        ))}</div>}
    </div>
  );
}

const Stat = ({ label, value }) => <div className="glass-card radius-lg p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-[20px] font-heading font-bold">{value}</p></div>;