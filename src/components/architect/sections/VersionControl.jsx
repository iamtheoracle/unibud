import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { listAllConfigs, rollbackConfig } from "@/lib/architect/configStore";
import { SectionHeader, Panel, StatusPill, Btn, LoadingState, EmptyState, DataTable } from "@/components/architect/architect-ui";
import { History, RotateCcw } from "lucide-react";

export default function VersionControl() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([listAllConfigs(), base44.entities.AuditLog.list("-created_date", 80).catch(() => [])]);
      setConfigs(c); setHistory(a.filter((x) => x.target_type === "architect"));
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const rollback = async (c) => { try { await rollbackConfig(c.id); toast({ title: "Rolled back to draft" }); load(); } catch { toast({ title: "Rollback failed", variant: "destructive" }); } };

  const cols = [
    { key: "name", label: "Configuration", render: (r) => <div><p className="font-medium truncate">{r.name}</p><p className="text-[10px] text-muted-foreground capitalize">{r.type}</p></div> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "version", label: "Version", render: (r) => <span className="font-mono">v{r.version || 1}</span> },
    { key: "updated", label: "Updated", render: (r) => <span className="text-muted-foreground whitespace-nowrap">{r.updated_date ? new Date(r.updated_date).toLocaleString() : "—"}</span> },
    { key: "actions", label: "", render: (r) => r.status === "published" ? <Btn variant="soft" onClick={() => rollback(r)}><RotateCcw className="w-3 h-3" />Rollback</Btn> : <span className="text-[11px] text-muted-foreground">draft</span> },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Version Control" desc="Draft, published, previous versions, rollback and change history — every change is versioned and reversible." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Configurations" icon={History} className="lg:col-span-2">
          {loading ? <LoadingState /> : <DataTable columns={cols} rows={configs} empty="No configurations yet" />}
        </Panel>
        <Panel title="Change History" icon={History}>
          {history.length === 0 ? <EmptyState icon={History} message="No change history yet." /> : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar">
              {history.map((h) => (
                <div key={h.id} className="flex gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${h.severity === "warning" ? "bg-warning" : h.severity === "critical" ? "bg-destructive" : "bg-primary"}`} />
                  <div className="min-w-0"><p className="text-[12px] font-medium truncate">{h.action}</p><p className="text-[10px] text-muted-foreground truncate">{h.target_name} · {h.created_date ? new Date(h.created_date).toLocaleString() : ""}</p></div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}