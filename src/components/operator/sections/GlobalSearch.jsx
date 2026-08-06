import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, SearchInput, EmptyState } from "@/components/management/management-ui";
import { Search, GraduationCap, Briefcase, UserPlus, CheckSquare, FolderOpen, LifeBuoy } from "lucide-react";

const SOURCES = [
  { key: "StudentRecord", label: "Students", icon: GraduationCap, title: (r) => r.full_name || r.email || r.id, sub: (r) => `${r.matriculation_number || r.department || ""}` },
  { key: "Staff", label: "Staff", icon: Briefcase, title: (r) => r.name || r.id, sub: (r) => `${r.role || ""} · ${r.department || ""}` },
  { key: "Admission", label: "Applications", icon: UserPlus, title: (r) => r.applicant_name || r.id, sub: (r) => `${r.programme || ""} · ${r.status || ""}` },
  { key: "ManagementTask", label: "Tasks", icon: CheckSquare, title: (r) => r.title || r.id, sub: (r) => `${r.status || ""} · ${r.assignee || ""}` },
  { key: "InstitutionDocument", label: "Documents", icon: FolderOpen, title: (r) => r.title || r.id, sub: (r) => `${r.type || ""} · ${r.status || ""}` },
  { key: "SupportTicket", label: "Tickets", icon: LifeBuoy, title: (r) => r.subject || r.id, sub: (r) => `${r.status || ""} · ${r.priority || ""}` },
];

export default function GlobalSearch({ institutionId }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const run = async () => {
    if (!q.trim()) { setResults(null); return; }
    setSearching(true);
    const term = q.toLowerCase();
    const out = {};
    await Promise.all(SOURCES.map(async (s) => {
      try {
        const rows = s.key === "StudentRecord" || s.key === "SupportTicket"
          ? await base44.entities[s.key].list("-created_date", 200)
          : await base44.entities[s.key].filter({ institution_id: institutionId }, "-created_date", 200);
        out[s.key] = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(term)).slice(0, 6);
      } catch { out[s.key] = []; }
    }));
    setResults(out); setSearching(false);
  };

  const total = results ? Object.values(results).reduce((s, a) => s + a.length, 0) : 0;

  return (
    <div>
      <SectionHeader title="Global Search" desc="Search across students, staff, applications, tasks, documents and tickets."
        actions={<SearchInput value={q} onChange={setQ} placeholder="Search everything…" />} />
      <div className="mb-3"><button onClick={run} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Search</button></div>

      {searching ? <Panel><p className="text-[13px] text-muted-foreground text-center py-6">Searching…</p></Panel>
        : results && total === 0 ? <Panel><EmptyState icon={Search} message={`No results for "${q}".`} /></Panel>
        : results && (
          <div className="space-y-3">
            {SOURCES.filter((s) => (results[s.key] || []).length).map((s) => (
              <Panel key={s.key} title={`${s.label} (${results[s.key].length})`} icon={s.icon}>
                <div className="space-y-1.5">{results[s.key].map((r) => (
                  <div key={r.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30">
                    <s.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0"><p className="text-[13px] font-medium truncate">{s.title(r)}</p><p className="text-[11px] text-muted-foreground truncate">{s.sub(r)}</p></div>
                  </div>
                ))}</div>
              </Panel>
            ))}
          </div>
        )}
    </div>
  );
}