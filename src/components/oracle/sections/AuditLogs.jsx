import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setLogs(await base44.entities.AuditLog.list("-created_date", 80)); } catch {} finally { setLoading(false); } })(); }, []);

  const sev = (s) => s === "critical" ? "destructive" : s === "warning" ? "secondary" : "outline";

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Audit Logs</h1><p className="text-[13px] text-muted-foreground">Immutable trail of platform actions.</p></div>
      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : logs.length === 0 ? <p className="text-muted-foreground text-[13px]">No audit entries.</p> :
        <div className="glass-card radius-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-muted-foreground"><tr><th className="text-left font-semibold px-4 py-2.5">Action</th><th className="text-left font-semibold px-4 py-2.5 hidden sm:table-cell">Actor</th><th className="text-left font-semibold px-4 py-2.5">Target</th><th className="text-left font-semibold px-4 py-2.5">Severity</th><th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">When</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border"><td className="px-4 py-2.5 font-medium">{l.action}</td><td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{l.actor_name}</td><td className="px-4 py-2.5 text-muted-foreground">{l.target_name || l.target_type || "—"}</td><td className="px-4 py-2.5"><Badge variant={sev(l.severity)}>{l.severity || "info"}</Badge></td><td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{l.created_date ? new Date(l.created_date).toLocaleString() : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>}
      {!loading && logs.length === 0 && <div className="flex items-center gap-2 text-muted-foreground"><ScrollText className="w-4 h-4" />Audit trail appears here as actions occur.</div>}
    </div>
  );
}