import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PaymentProvider, CardService, KYCService, WalletService } from "@/lib/finance";
import { SectionHeader, Panel, StatusPill, EmptyState, LoadingState, Btn } from "@/components/management/management-ui";
import { Settings, CreditCard, ShieldCheck, Snowflake, RefreshCw, Plus } from "lucide-react";

export default function FinanceSettings({ institutionId }) {
  const { toast } = useToast();
  const [cards, setCards] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [vForm, setVForm] = useState({ owner_name: "", owner_type: "student" });

  const load = async () => {
    setLoading(true);
    try {
      const [c, k] = await Promise.all([CardService.list(institutionId), KYCService.list(institutionId)]);
      setCards(c); setKyc(k);
      try { setWallets(await WalletService.list(institutionId)); } catch {}
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [institutionId]);

  const issue = async () => {
    const w = wallets[0]; if (!w) { toast({ title: "Create a wallet first", variant: "destructive" }); return; }
    try { await CardService.issue({ wallet_id: w.id, institution_id: institutionId }); toast({ title: "Card issued" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); }
  };
  const freezeCard = async (id) => { try { await CardService.freeze(id); toast({ title: "Frozen" }); load(); } catch {} };
  const unfreezeCard = async (id) => { try { await CardService.unfreeze(id); toast({ title: "Unfrozen" }); load(); } catch {} };
  const replaceCard = async (id) => { try { await CardService.replace(id); toast({ title: "Card replaced" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } };
  const verifyKYC = async () => {
    if (!vForm.owner_name) { toast({ title: "Enter owner name", variant: "destructive" }); return; }
    setVerifying(true);
    try { await KYCService.verifyIdentity({ ...vForm, institution_id: institutionId }); toast({ title: "KYC verified" }); setVForm({ owner_name: "", owner_type: "student" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); }
    setVerifying(false);
  };
  const activate = (key) => { PaymentProvider.set(key); toast({ title: "Provider set (mock active)" }); };

  const providers = PaymentProvider.list();

  return (
    <div>
      <SectionHeader title="Financial Platform" desc="Payment provider interfaces, virtual cards and KYC compliance — no live APIs connected. Every provider is replaceable without changing business logic." />

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Payment Providers" icon={Settings}>
          <p className="text-[11px] text-muted-foreground mb-3">Future providers: OnePipe, Strowallet, Dojah, 9PSB, Flutterwave, Paystack, Kora.</p>
          <div className="space-y-2">
            {providers.map((p) => (
              <div key={p.key} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                <div className="w-9 h-9 rounded-lg bg-primary/15 grid place-items-center shrink-0"><Settings className="w-4 h-4 text-primary" /></div>
                <div className="min-w-0 flex-1"><p className="text-[13px] font-medium">{p.label}</p><p className="text-[11px] text-muted-foreground truncate">{p.description}</p></div>
                {p.active ? <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">ACTIVE</span> : <Btn variant="soft" size="sm" onClick={() => activate(p.key)}>Activate</Btn>}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="KYC Compliance" icon={ShieldCheck}>
          <div className="flex gap-2 mb-3">
            <select value={vForm.owner_type} onChange={(e) => setVForm({ ...vForm, owner_type: e.target.value })} className="oracle-input w-[120px]"><option value="student">Student</option><option value="staff">Staff</option><option value="institution">Institution</option></select>
            <input value={vForm.owner_name} onChange={(e) => setVForm({ ...vForm, owner_name: e.target.value })} className="oracle-input flex-1" placeholder="Owner name" />
            <Btn variant="primary" onClick={verifyKYC} disabled={verifying}><ShieldCheck className="w-3.5 h-3.5" />Verify</Btn>
          </div>
          {kyc.length === 0 ? <EmptyState icon={ShieldCheck} message="No KYC records yet." /> : (
            <div className="space-y-1.5">{kyc.slice(0, 8).map((k) => (
              <div key={k.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20"><ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="text-[12px] font-medium truncate">{k.owner_name}</p><p className="text-[10px] text-muted-foreground capitalize">{k.owner_type} · {k.level}</p></div><StatusPill status={k.status} /></div>
            ))}</div>
          )}
        </Panel>
      </div>

      <Panel title="Virtual Cards" icon={CreditCard} actions={<Btn variant="primary" size="sm" onClick={issue}><Plus className="w-3.5 h-3.5" />Issue Card</Btn>}>
        {loading ? <LoadingState /> : cards.length === 0 ? <EmptyState icon={CreditCard} message="No virtual cards issued yet." /> : (
          <div className="space-y-2">{cards.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-[13px] font-mono font-medium">{c.masked_number}</p><p className="text-[11px] text-muted-foreground">Daily ₦{c.daily_limit?.toLocaleString()} · Monthly ₦{c.monthly_limit?.toLocaleString()}</p></div>
              <StatusPill status={c.status} />
              <div className="flex gap-1">
                {c.status === "active" ? <Btn variant="ghost" size="icon" title="Freeze" onClick={() => freezeCard(c.id)}><Snowflake className="w-3.5 h-3.5" /></Btn> : <Btn variant="ghost" size="icon" title="Unfreeze" onClick={() => unfreezeCard(c.id)}><Snowflake className="w-3.5 h-3.5 text-success" /></Btn>}
                <Btn variant="ghost" size="icon" title="Replace" onClick={() => replaceCard(c.id)}><RefreshCw className="w-3.5 h-3.5" /></Btn>
              </div>
            </div>
          ))}</div>
        )}
      </Panel>
    </div>
  );
}