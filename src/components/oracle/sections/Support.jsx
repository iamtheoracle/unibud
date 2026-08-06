import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const STATUSES = ["open", "in_progress", "resolved", "escalated"];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setTickets(await base44.entities.SupportTicket.list("-created_date", 80)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => { try { await base44.entities.SupportTicket.update(id, { status }); load(); } catch { toast({ title: "Update failed" }); } };

  const prio = (p) => p === "urgent" ? "destructive" : p === "high" ? "secondary" : "outline";

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Support</h1><p className="text-[13px] text-muted-foreground">{tickets.length} support tickets.</p></div>
      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : tickets.length === 0 ? <p className="text-muted-foreground text-[13px]">No tickets.</p> :
        <div className="space-y-2">{tickets.map((t) => (
          <div key={t.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{t.subject}</p><p className="text-[12px] text-muted-foreground capitalize">{t.category} · {t.student_name || "Anonymous"} · {t.created_date ? new Date(t.created_date).toLocaleDateString() : ""}</p></div>
            <Badge variant={prio(t.priority)} className="capitalize">{t.priority}</Badge>
            <Select value={t.status} onValueChange={(v) => setStatus(t.id, v)}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent></Select>
          </div>
        ))}</div>}
    </div>
  );
}