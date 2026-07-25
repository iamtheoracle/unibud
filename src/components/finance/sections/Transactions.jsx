import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { PaymentService, WalletService, money } from "@/lib/finance";
import { SectionHeader, SearchInput, Drawer, Btn, StatusPill, EmptyState, LoadingState, DataTable } from "@/components/management/management-ui";
import { ArrowLeftRight, Plus, CheckCircle2, CreditCard, XCircle, RotateCcw } from "lucide-react";

const TX_TYPES = ["deposit", "tuition_payment", "school_fee", "hostel_fee", "acceptance_fee", "examination_fee", "library_fee", "transfer", "adjustment"];

export default function Transactions({ institutionId }) {
  const { toast } = useToast();
  const [tx, setTx] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ type: "tuition_payment", amount: "", from_wallet_id: "", to_wallet_id: "", description: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [t, a, w] = await Promise.all([
        base44.entities.FinancialTransaction.filter({ institution_id: institutionId }, "-created_date", 300),
        base44.entities.PaymentAttempt.filter({ institution_id: institutionId }, "-created_date", 300),
        WalletService.list(institutionId),
      ]);
      setTx(t); setWallets(w); const map = {}; a.forEach((x) => { map[x.transaction_id] = x; }); setAttempts(map);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [institutionId]);

  const create = async () => {
    const amt = Number(form.amount); if (!amt || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    try {
      await PaymentService.create({ amount: amt, currency: "NGN", type: form.type, from_wallet_id: form.from_wallet_id, to_wallet_id: form.to_wallet_id, description: form.description, institution_id: institutionId });
      toast({ title: "Payment initiated" }); setCreating(false); setForm({ type: "tuition_payment", amount: "", from_wallet_id: "", to_wallet_id: "", description: "" }); load();
    } catch (e) { toast({ title: e.message || "Failed", variant: "destructive" }); }
  };
  const verify = async (t) => { try { await PaymentService.verify(attempts[t.id].id); toast({ title: "Verified" }); load(); } catch { toast({ title: "Verify failed", variant: "destructive" }); } };
  const capture = async (t) => { try { const r = await PaymentService.capture(attempts[t.id].id, institutionId); toast({ title: `Captured · receipt ${r.receipt_no}` }); load(); } catch (e) { toast({ title: e.message || "Capture failed", variant: "destructive" }); } };
  const cancel = async (t) => { try { await PaymentService.cancel(attempts[t.id].id); toast({ title: "Cancelled" }); load(); } catch { toast({ title: "Failed", variant: "destructive" }); } };
  const refund = async (t) => { try { await PaymentService.refund(t.id, { amount: t.amount, reason: "Operator refund", institution_id: institutionId }); toast({ title: "Refund requested" }); load(); } catch { toast({ title: "Failed", variant: "destructive" }); } };

  const filtered = tx.filter((t) => !query || JSON.stringify(t).toLowerCase().includes(query.toLowerCase()));
  const columns = [
    { key: "reference", label: "Reference", render: (r) => <span className="font-mono text-[12px]">{r.reference}</span> },
    { key: "type", label: "Type", render: (r) => <span className="capitalize text-muted-foreground">{r.type.replace("_", " ")}</span> },
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold">{money(r.amount, r.currency)}</span> },
    { key: "receipt_no", label: "Receipt", render: (r) => <span className="text-muted-foreground text-[12px]">{r.receipt_no || "—"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "__a", label: "", render: (r) => {
      const a = attempts[r.id];
      return (
        <div className="flex gap-1 justify-end">
          {r.status === "pending" && a && <Btn variant="ghost" size="icon" title="Verify" onClick={() => verify(r)}><CreditCard className="w-3.5 h-3.5" /></Btn>}
          {r.status === "pending" && a && <Btn variant="ghost" size="icon" title="Capture" onClick={() => capture(r)}><CheckCircle2 className="w-3.5 h-3.5 text-success" /></Btn>}
          {r.status === "pending" && a && <Btn variant="ghost" size="icon" title="Cancel" onClick={() => cancel(r)}><XCircle className="w-3.5 h-3.5 text-destructive" /></Btn>}
          {r.status === "completed" && <Btn variant="ghost" size="icon" title="Refund" onClick={() => refund(r)}><RotateCcw className="w-3.5 h-3.5" /></Btn>}
        </div>
      );
    } },
  ];

  return (
    <div>
      <SectionHeader title="Transactions" desc="Transaction engine — every transaction generates a receipt, ledger entry, audit record and timeline."
        actions={<><SearchInput value={query} onChange={setQuery} /><Btn variant="primary" onClick={() => setCreating(true)}><Plus className="w-3.5 h-3.5" />New Payment</Btn></>} />

      <div className="glass-card radius-lg p-3">
        {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState icon={ArrowLeftRight} message="No transactions yet. Initiate a payment to begin." /> : <DataTable columns={columns} rows={filtered} />}
      </div>

      <Drawer open={creating} onClose={() => setCreating(false)} title="New Payment"
        footer={<><Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn><Btn variant="primary" onClick={create}>Initiate</Btn></>}>
        <div className="space-y-3">
          <div><label className="text-[12px] font-semibold">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="oracle-input mt-1">{TX_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}</select></div>
          <div><label className="text-[12px] font-semibold">Amount (₦) *</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="oracle-input mt-1" placeholder="0.00" /></div>
          <div><label className="text-[12px] font-semibold">From Wallet (payer)</label><select value={form.from_wallet_id} onChange={(e) => setForm({ ...form, from_wallet_id: e.target.value })} className="oracle-input mt-1"><option value="">—</option>{wallets.map((w) => <option key={w.id} value={w.id}>{w.owner_name} ({money(w.balance, w.currency)})</option>)}</select></div>
          <div><label className="text-[12px] font-semibold">To Wallet (institution)</label><select value={form.to_wallet_id} onChange={(e) => setForm({ ...form, to_wallet_id: e.target.value })} className="oracle-input mt-1"><option value="">—</option>{wallets.map((w) => <option key={w.id} value={w.id}>{w.owner_name} ({money(w.balance, w.currency)})</option>)}</select></div>
          <div><label className="text-[12px] font-semibold">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="oracle-input mt-1" placeholder="e.g. 2025/2026 tuition" /></div>
        </div>
      </Drawer>
    </div>
  );
}