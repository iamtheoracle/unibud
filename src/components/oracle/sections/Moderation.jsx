import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ShieldCheck } from "lucide-react";

const STATUSES = ["pending", "reviewing", "actioned", "dismissed"];

export default function Moderation() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setReports(await base44.entities.ContentReport.list("-created_date", 60)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => { try { await base44.entities.ContentReport.update(id, { status }); load(); } catch { toast({ title: "Update failed" }); } };

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Moderation</h1><p className="text-[13px] text-muted-foreground">Review and action reported content.</p></div>
      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : reports.length === 0 ? <p className="text-muted-foreground text-[13px]">No reports.</p> :
        <div className="space-y-2">{reports.map((r) => (
          <div key={r.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] capitalize">{r.content_type?.replace(/_/g, " ")} · {r.reason}</p><p className="text-[12px] text-muted-foreground truncate">{r.description || `Reported by ${r.reporter_name}`}</p></div>
            <Badge variant="secondary" className="capitalize">{r.status}</Badge>
            <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        ))}</div>}
    </div>
  );
}