import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SecurityActivity({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try { setLogs(await base44.entities.AuditLog.filter({ actor_id: user.id }, "-created_date", 60)); } catch {}
      finally { setLoading(false); }
    })();
  }, [user?.id]);

  const sev = (s) => s === "critical" ? "destructive" : s === "warning" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /><h2 className="text-[18px] font-heading font-bold">Activity & Audit Log</h2></div>
      <p className="text-[13px] text-muted-foreground">An immutable record of your account actions — logins, security changes, and administrative events.</p>

      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : logs.length === 0 ? <p className="text-muted-foreground text-[13px]">No activity recorded.</p> :
        <div className="space-y-2">{logs.map((l) => (
          <div key={l.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate capitalize">{(l.action || "event").replace(/_/g, " ")}</p><p className="text-[12px] text-muted-foreground truncate">{l.details || l.target_name || "—"}{l.actor_role ? ` · ${l.actor_role}` : ""}</p></div>
            <Badge variant={sev(l.severity)} className="capitalize">{l.severity || "info"}</Badge>
            <span className="text-[11px] text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleDateString() : "—"}</span>
          </div>
        ))}</div>}
    </div>
  );
}