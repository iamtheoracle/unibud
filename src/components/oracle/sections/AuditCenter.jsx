import React, { useEffect, useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, StatusPill, DataTable, SearchInput, Btn, LoadingState } from "@/components/oracle/oracle-ui";
import { ScrollText, Download } from "lucide-react";

const SEVERITIES = ["all", "info", "warning", "critical"];

export default function AuditCenter() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await base44.entities.AuditLog.list("-created_date", 200)); } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => rows.filter((r) => {
    const matchQ = (r.action + " " + (r.actor_name || "") + " " + (r.target_name || "") + " " + (r.details || "")).toLowerCase().includes(q.toLowerCase());
    const matchS = sev === "all" || r.severity === sev;
    return matchQ && matchS;
  }), [rows, q, sev]);

  const exportCsv = () => {
    const head = ["action", "actor_name", "actor_role", "target_type", "target_name", "severity", "details", "created_date"];
    const lines = [head.join(",")];
    filtered.forEach((r) => lines.push(head.map((h) => `"${String(r[h] || "").replace(/"/g, '""')}"`).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "oracle-audit.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${filtered.length} records` });
  };

  const columns = [
    { key: "action", label: "Action", render: (r) => <span className="font-medium">{r.action}</span> },
    { key: "actor_name", label: "Actor", render: (r) => <div><p className="font-medium">{r.actor_name}</p><p className="text-[10px] text-muted-foreground">{r.actor_role || ""}</p></div> },
    { key: "target", label: "Target", render: (r) => <span className="text-muted-foreground">{[r.target_type, r.target_name].filter(Boolean).join(" · ") || "—"}</span> },
    { key: "severity", label: "Severity", render: (r) => <StatusPill status={r.severity} /> },
    { key: "details", label: "Details", render: (r) => <span className="text-muted-foreground truncate max-w-[220px] block">{r.details || "—"}</span> },
    { key: "date", label: "Date", render: (r) => <span className="text-muted-foreground whitespace-nowrap">{r.created_date ? new Date(r.created_date).toLocaleString() : "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Audit Center" desc="Immutable system-wide audit log — user, admin, institution, payment, AI, security and configuration events."
        actions={<Btn variant="soft" onClick={exportCsv}><Download className="w-3.5 h-3.5" />Export CSV</Btn>} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search actions, actors, targets…" />
        <div className="flex items-center gap-1">
          {SEVERITIES.map((s) => (
            <button key={s} onClick={() => setSev(s)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium capitalize ${sev === s ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      <Panel title="Audit Trail" icon={ScrollText}>
        {loading ? <LoadingState /> : <DataTable columns={columns} rows={filtered} empty="No audit records match your filters" />}
      </Panel>
    </div>
  );
}