import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, ShoppingCart, Star,
  CheckCircle2, Clock, AlertCircle, TrendingUp, Coins,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const money = (n) => "₦" + (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const num = (n) => (n || 0).toLocaleString();

const TX_TYPES = ["deposit", "withdrawal", "tuition_payment", "school_fee", "hostel_fee", "acceptance_fee", "examination_fee", "library_fee", "refund", "transfer"];
const TX_STATUSES = ["pending", "completed", "failed", "cancelled"];

/**
 * FinancialIntelligence — Oracle's platform-wide financial analytics.
 * Aggregates wallet ledger flow, transaction throughput and marketplace
 * performance so platform admins can see collection health, refund trends
 * and merchant activity across UNIBUD.
 */
export default function FinancialIntelligence({ module }) {
  const { data: ledger } = useQuery({ queryKey: ["oracleLedger"], queryFn: () => base44.entities.WalletLedger.list("-created_date", 200) });
  const { data: txns } = useQuery({ queryKey: ["oracleTxns"], queryFn: () => base44.entities.FinancialTransaction.list("-created_date", 200) });
  const { data: listings } = useQuery({ queryKey: ["oracleMkt"], queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 200) });
  const { data: reviews } = useQuery({ queryKey: ["oracleMktReviews"], queryFn: () => base44.entities.MarketplaceReview.list("-created_date", 200) });

  const lg = ledger || [], tx = txns || [], ml = listings || [], rv = reviews || [];
  const loading = ledger === undefined && txns === undefined && listings === undefined && reviews === undefined;

  const stats = useMemo(() => {
    const credits = lg.filter((x) => x.type === "credit").reduce((a, x) => a + (x.amount || 0), 0);
    const debits = lg.filter((x) => x.type === "debit").reduce((a, x) => a + (x.amount || 0), 0);
    const completed = tx.filter((x) => x.status === "completed").length;
    const pending = tx.filter((x) => x.status === "pending").length;
    const failed = tx.filter((x) => x.status === "failed").length;
    const collected = tx.filter((x) => x.status === "completed").reduce((a, x) => a + (x.amount || 0), 0);
    const refunds = tx.filter((x) => x.type === "refund").reduce((a, x) => a + (x.amount || 0), 0);
    const activeMkt = ml.filter((x) => x.status === "active").length;
    const soldMkt = ml.filter((x) => x.status === "sold").length;
    const gmv = ml.filter((x) => x.status === "active" && !x.is_free).reduce((a, x) => a + (x.price || 0), 0);
    const avgRating = rv.length ? rv.reduce((a, x) => a + (x.rating || 0), 0) / rv.length : 0;
    return { credits, debits, completed, pending, failed, collected, refunds, activeMkt, soldMkt, gmv, avgRating };
  }, [lg, tx, ml, rv]);

  const byType = useMemo(() => TX_TYPES.map((t) => ({ label: t.replace(/_/g, " "), value: tx.filter((x) => x.type === t).length, amount: tx.filter((x) => x.type === t && x.status === "completed").reduce((a, x) => a + (x.amount || 0), 0) })).filter((t) => t.value > 0), [tx]);
  const byStatus = useMemo(() => TX_STATUSES.map((s) => ({ label: s, value: tx.filter((x) => x.status === s).length })), [tx]);
  const maxType = Math.max(1, ...byType.map((t) => t.value));
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.value));
  const successRate = tx.length ? Math.round((stats.completed / tx.length) * 100) : 0;

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[20px] glass-card shimmer" />)}</div>;

  const empty = lg.length === 0 && tx.length === 0 && ml.length === 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading font-extrabold text-[20px] text-foreground flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> {module?.label || "Financial Intelligence"}</h1>
        <p className="text-[12px] text-muted-foreground mt-1">{module?.desc || "Platform-wide financial analytics."}</p>
      </header>

      {empty ? (
        <div className="glass-card p-8 text-center">
          <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-[13px] font-semibold text-foreground">No financial activity yet</p>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px] mx-auto">Once wallets are funded, fees are collected and marketplace listings go live, revenue and collection KPIs will appear here.</p>
        </div>
      ) : (
        <>
          {/* Revenue KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Kpi icon={Coins} value={money(stats.collected)} label="Collected" color="text-success" />
            <Kpi icon={ArrowDownCircle} value={money(stats.credits)} label="Wallet credits" color="text-primary" />
            <Kpi icon={ArrowUpCircle} value={money(stats.debits)} label="Wallet debits" color="text-accent" />
            <Kpi icon={ShoppingCart} value={money(stats.gmv)} label="Marketplace GMV" color="text-warning" />
          </div>

          {/* Collection health */}
          <section className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-foreground">Collection health</p>
              <span className="text-[12px] font-bold text-success">{successRate}% success</span>
            </div>
            <div className="space-y-2.5">
              {byStatus.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-muted-foreground w-16 capitalize">{s.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.value / maxStatus) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.6, ease: EASE }} className={`h-full rounded-full ${s.label === "completed" ? "bg-success" : s.label === "pending" ? "bg-warning" : s.label === "failed" ? "bg-error" : "bg-muted-foreground"}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Transaction type breakdown */}
          {byType.length > 0 && (
            <section className="glass-card p-4">
              <p className="text-[12px] font-semibold text-foreground mb-3">Transaction types</p>
              <div className="space-y-2.5">
                {byType.map((t, i) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-muted-foreground w-24 capitalize truncate">{t.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(t.value / maxType) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6, ease: EASE }} className="h-full rounded-full bg-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{t.value}</span>
                    {t.amount > 0 && <span className="text-[10px] text-muted-foreground shrink-0">{money(t.amount)}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Marketplace + refund health */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Kpi icon={CheckCircle2} value={num(stats.activeMkt)} label="Active listings" color="text-success" small />
            <Kpi icon={TrendingUp} value={num(stats.soldMkt)} label="Sold items" color="text-primary" small />
            <Kpi icon={Star} value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"} label="Avg rating" color="text-gold" small />
            <Kpi icon={AlertCircle} value={money(stats.refunds)} label="Refunds" color="text-error" small />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Kpi icon={CheckCircle2} value={num(stats.completed)} label="Completed tx" color="text-success" small />
            <Kpi icon={Clock} value={num(stats.pending)} label="Pending tx" color="text-warning" small />
            <Kpi icon={AlertCircle} value={num(stats.failed)} label="Failed tx" color="text-error" small />
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, value, label, color, small }) {
  return (
    <div className="glass-card p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto`} />
      <p className={`font-heading font-extrabold tabular-nums text-foreground mt-1 ${small ? "text-[15px]" : "text-[18px]"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}