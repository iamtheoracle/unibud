import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { money, sum } from "@/lib/finance";
import { SectionHeader, Panel, StatCard, LoadingState, StatusPill } from "@/components/management/management-ui";
import { Wallet, TrendingUp, CalendarClock, Clock, XCircle, RotateCcw, Receipt, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FEE_TX = ["tuition_payment", "school_fee", "hostel_fee", "acceptance_fee", "examination_fee", "library_fee"];
const safe = async (name, instId) => { try { return (await base44.entities[name].filter({ institution_id: instId }, "-created_date", 500)) || []; } catch { try { return (await base44.entities[name].list("-created_date", 500)) || []; } catch { return []; } } };
const mkey = (d) => { if (!d) return null; const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; };
const last6 = () => { const out = []; const d = new Date(); d.setDate(1); for (let i = 5; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[m.getMonth()] }); } return out; };
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function FinanceDashboard({ institutionId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [wallets, tx, refunds, fees] = await Promise.all([safe("Wallet", institutionId), safe("FinancialTransaction", institutionId), safe("RefundRequest", institutionId), safe("Fee", institutionId)]);
      const completed = tx.filter((t) => t.status === "completed");
      const totalRevenue = sum(completed.filter((t) => FEE_TX.includes(t.type)), (t) => t.amount);
      const dailyRevenue = sum(completed.filter((t) => FEE_TX.includes(t.type) && t.updated_date && t.updated_date.slice(0, 10) === todayStr()), (t) => t.amount);
      const pending = tx.filter((t) => t.status === "pending");
      const failed = tx.filter((t) => t.status === "failed");
      const refundPending = refunds.filter((r) => r.status === "pending");
      const walletBalances = sum(wallets, (w) => w.balance);
      const outstanding = sum(fees.filter((f) => ["pending", "overdue"].includes(f.status)), (f) => f.amount);
      const months = last6();
      const trend = months.map((m) => ({ ...m, revenue: sum(completed.filter((t) => FEE_TX.includes(t.type) && mkey(t.updated_date) === m.key), (t) => t.amount) }));
      const byType = ["student", "institution", "staff", "department", "scholarship"].map((k) => ({ key: k, label: k, balance: sum(wallets.filter((w) => w.owner_type === k), (w) => w.balance) }));
      setData({ totalRevenue, dailyRevenue, pending: pending.length, pendingAmt: sum(pending), failed: failed.length, refundPending: refundPending.length, walletBalances, outstanding, trend, byType, recent: completed.slice(0, 6) });
    })();
  }, [institutionId]);

  if (!data) return <LoadingState />;

  return (
    <div>
      <SectionHeader title="Financial Dashboard" desc="Revenue, payments, refunds, wallet balances, outstanding fees and trends across your institution." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={money(data.totalRevenue)} tone="success" />
        <StatCard icon={CalendarClock} label="Daily Revenue" value={money(data.dailyRevenue)} tone="primary" />
        <StatCard icon={Clock} label="Pending Payments" value={data.pending} tone="warn" sub={money(data.pendingAmt)} />
        <StatCard icon={XCircle} label="Failed Payments" value={data.failed} tone="danger" />
        <StatCard icon={RotateCcw} label="Refund Requests" value={data.refundPending} tone="warn" />
        <StatCard icon={Wallet} label="Wallet Balances" value={money(data.walletBalances)} tone="info" />
        <StatCard icon={AlertTriangle} label="Outstanding Fees" value={money(data.outstanding)} tone="danger" />
        <StatCard icon={Receipt} label="Tx Today" value={data.recent.length} tone="muted" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Revenue Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.trend}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Wallet Balances by Type" icon={Wallet}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="balance" fill="hsl(var(--information))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Recent Completed Transactions" icon={Receipt}>
        {data.recent.length === 0 ? <p className="text-[13px] text-muted-foreground py-6 text-center">No completed transactions yet.</p> : (
          <div className="space-y-2">{data.recent.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5"><Receipt className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><div className="min-w-0 flex-1"><p className="text-[13px] font-medium truncate">{t.reference} · {t.type.replace("_", " ")}</p><p className="text-[11px] text-muted-foreground truncate">{t.description || "—"}</p></div><span className="text-[13px] font-semibold">{money(t.amount, t.currency)}</span><StatusPill status={t.status} /></div>
          ))}</div>
        )}
      </Panel>
    </div>
  );
}