import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { RefundService, money } from "@/lib/finance";
import { SectionHeader, Panel, StatusPill, EmptyState, LoadingState, Btn } from "@/components/management/management-ui";
import { RotateCcw, CheckCircle2, XCircle, Send } from "lucide-react";

export default function Refunds({ institutionId, user }) {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [txMap, setTxMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, t] = await Promise.all([RefundService.list(institutionId), base44.entities.FinancialTransaction.filter({ institution_id: institutionId }, "-created_date", 300)]);
      setRows(r); const m = {}; t.forEach((x) => { m[x.id] = x; }); setTxMap(m);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [institutionId]);

  const approve = async (r) => { try { await RefundService.approve(r.id, user?.full_name || "Finance"); toast({ title: "Approved" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } };
  const reject = async (r) => { try { await RefundService.reject(r.id, user?.full_name || "Finance"); toast({ title: "Rejected" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } };
  const disburse = async (r) => { try { await RefundService.disburse(r.id, institutionId); toast({ title: "Refund disbursed" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } };

  return (
    <div>
      <SectionHeader title="Refund Management" desc="Refund requests, approval workflow, history, status and audit trail." />
      <Panel>
        {loading ? <LoadingState /> : rows.length === 0 ? <EmptyState icon={RotateCcw} message="No refund requests yet." /> : (
          <div className="space-y-2">
            {rows.map((r) => {
              const tx = txMap[r.transaction_id];
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                  <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{tx ? `${tx.reference} · ${tx.type.replace("_", " ")}` : r.transaction_id}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.reason || "—"} · {money(r.amount)}</p>
                  </div>
                  <StatusPill status={r.status} />
                  <div className="flex gap-1">
                    {r.status === "pending" && <><Btn variant="soft" size="sm" onClick={() => approve(r)}><CheckCircle2 className="w-3.5 h-3.5 text-success" />Approve</Btn><Btn variant="soft" size="sm" onClick={() => reject(r)}><XCircle className="w-3.5 h-3.5 text-destructive" />Reject</Btn></>}
                    {r.status === "approved" && <Btn variant="primary" size="sm" onClick={() => disburse(r)}><Send className="w-3.5 h-3.5" />Disburse</Btn>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}