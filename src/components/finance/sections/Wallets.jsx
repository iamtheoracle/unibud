import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { WalletService, money } from "@/lib/finance";
import { SectionHeader, SearchInput, Drawer, Btn, StatusPill, EmptyState, LoadingState, DataTable } from "@/components/management/management-ui";
import { Wallet as WalletIcon, Plus, ArrowDownToLine, ArrowUpFromLine, Snowflake, BookOpen } from "lucide-react";

const TYPES = ["student", "institution", "staff", "department", "scholarship"];

export default function Wallets({ institutionId }) {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [op, setOp] = useState(null); // {mode:'credit'|'debit'|'create'|'ledger', wallet}
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [ledger, setLedger] = useState([]);

  const load = async () => { setLoading(true); try { setRows(await WalletService.list(institutionId)); } catch {} setLoading(false); };
  useEffect(() => { load(); }, [institutionId]);

  const openLedger = async (w) => { setLedger([]); setOp({ mode: "ledger", wallet: w }); try { setLedger(await WalletService.ledger(w.id)); } catch {} };
  const submit = async () => {
    const amt = Number(amount); if (!amt || amt <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    try {
      if (op.mode === "credit") await WalletService.credit(op.wallet.id, amt, { description: desc || "Credit", institution_id: institutionId });
      if (op.mode === "debit") await WalletService.debit(op.wallet.id, amt, { description: desc || "Debit", institution_id: institutionId });
      if (op.mode === "create") await WalletService.create({ owner_type: op.wallet.owner_type, owner_name: op.wallet.owner_name, currency: "NGN", institution_id: institutionId });
      toast({ title: op.mode === "create" ? "Wallet created" : `${op.mode} ✓` }); setOp(null); setAmount(""); setDesc(""); load();
    } catch (e) { toast({ title: e.message || "Failed", variant: "destructive" }); }
  };
  const toggleFreeze = async (w) => { try { if (w.status === "frozen") await WalletService.unfreeze(w.id); else await WalletService.freeze(w.id); toast({ title: w.status === "frozen" ? "Unfrozen" : "Frozen" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } };

  const filtered = rows.filter((w) => !query || JSON.stringify(w).toLowerCase().includes(query.toLowerCase()));
  const columns = [
    { key: "owner_name", label: "Owner", render: (r) => <span className="font-medium">{r.owner_name}</span> },
    { key: "owner_type", label: "Type", render: (r) => <span className="capitalize text-muted-foreground">{r.owner_type}</span> },
    { key: "balance", label: "Balance", render: (r) => <span className="font-semibold">{money(r.balance, r.currency)}</span> },
    { key: "available_balance", label: "Available", render: (r) => <span className="text-muted-foreground">{money(r.available_balance, r.currency)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "__a", label: "", render: (r) => (
      <div className="flex gap-1 justify-end">
        <Btn variant="ghost" size="icon" title="Credit" onClick={() => setOp({ mode: "credit", wallet: r })}><ArrowDownToLine className="w-3.5 h-3.5 text-success" /></Btn>
        <Btn variant="ghost" size="icon" title="Debit" onClick={() => setOp({ mode: "debit", wallet: r })}><ArrowUpFromLine className="w-3.5 h-3.5 text-destructive" /></Btn>
        <Btn variant="ghost" size="icon" title="Ledger" onClick={() => openLedger(r)}><BookOpen className="w-3.5 h-3.5" /></Btn>
        <Btn variant="ghost" size="icon" title="Freeze/Unfreeze" onClick={() => toggleFreeze(r)}><Snowflake className="w-3.5 h-3.5" /></Btn>
      </div>
    ) },
  ];

  return (
    <div>
      <SectionHeader title="Wallets" desc="Student, institution, staff, department and scholarship wallets — balances, ledger and status."
        actions={<><SearchInput value={query} onChange={setQuery} /><Btn variant="primary" onClick={() => setOp({ mode: "create", wallet: { owner_type: "student", owner_name: "" } })}><Plus className="w-3.5 h-3.5" />New Wallet</Btn></>} />

      <div className="glass-card radius-lg p-3">
        {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState icon={WalletIcon} message="No wallets yet. Create one to start ledgering." /> : <DataTable columns={columns} rows={filtered} />}
      </div>

      <Drawer open={!!op} onClose={() => setOp(null)} title={op?.mode === "create" ? "New Wallet" : op?.mode === "ledger" ? "Ledger" : op?.mode === "credit" ? "Credit Wallet" : "Debit Wallet"}
        footer={op?.mode !== "ledger" ? <><Btn variant="ghost" onClick={() => setOp(null)}>Cancel</Btn><Btn variant="primary" onClick={submit}>{op?.mode === "create" ? "Create" : "Confirm"}</Btn></> : undefined}>
        {op?.mode === "create" && (
          <div className="space-y-3">
            <div><label className="text-[12px] font-semibold">Owner Type</label><select value={op.wallet.owner_type} onChange={(e) => setOp({ ...op, wallet: { ...op.wallet, owner_type: e.target.value } })} className="oracle-input mt-1">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="text-[12px] font-semibold">Owner Name *</label><input value={op.wallet.owner_name} onChange={(e) => setOp({ ...op, wallet: { ...op.wallet, owner_name: e.target.value } })} className="oracle-input mt-1" placeholder="Name / reference" /></div>
          </div>
        )}
        {(op?.mode === "credit" || op?.mode === "debit") && (
          <div className="space-y-3">
            <div className="text-[13px] text-muted-foreground">{op.wallet.owner_name} · balance {money(op.wallet.balance, op.wallet.currency)}</div>
            <div><label className="text-[12px] font-semibold">Amount (₦) *</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="oracle-input mt-1" placeholder="0.00" /></div>
            <div><label className="text-[12px] font-semibold">Description</label><input value={desc} onChange={(e) => setDesc(e.target.value)} className="oracle-input mt-1" placeholder="Reason / reference" /></div>
          </div>
        )}
        {op?.mode === "ledger" && (
          ledger.length === 0 ? <EmptyState icon={BookOpen} message="No ledger entries yet." /> : (
            <div className="space-y-2">{ledger.map((l) => (
              <div key={l.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${l.type === "credit" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{l.type}</span>
                <div className="min-w-0 flex-1"><p className="text-[12px] font-medium truncate">{l.description || l.reference}</p><p className="text-[10px] text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : ""} · bal {money(l.balance_after)}</p></div>
                <span className={`text-[13px] font-semibold ${l.type === "credit" ? "text-success" : "text-destructive"}`}>{l.type === "credit" ? "+" : "-"}{money(l.amount)}</span>
              </div>
            ))}</div>
          )
        )}
      </Drawer>
    </div>
  );
}