import React from "react";
import { Link } from "react-router-dom";
import { QuickActions } from "@/components/wallet/WalletModules";

function naira(n) { return "₦" + (Number(n) || 0).toLocaleString(); }

function txIcon(type, description = "") {
  if (/tuition|fee/i.test(description) || type === "tuition_payment" || type === "school_fee") return "🎓";
  if (/scholar/i.test(description)) return "🏅";
  if (/ticket|event/i.test(description)) return "🎫";
  if (/book|textbook|market/i.test(description)) return "📚";
  if (type === "transfer") return "💸";
  if (type === "refund") return "🏅";
  return "💳";
}

function isThisMonth(d) {
  if (!d) return false;
  const x = new Date(d); const now = new Date();
  return x.getMonth() === now.getMonth() && x.getFullYear() === now.getFullYear();
}

const DIGITAL = [
  { icon: "🪪", label: "Student ID", to: "/me" },
  { icon: "🚪", label: "Campus Access", to: "/me" },
  { icon: "📚", label: "Library Card", to: "/knowledge" },
  { icon: "🎟️", label: "Event Tickets", to: "/events" },
  { icon: "🅿️", label: "Parking Pass", to: "/me" },
];

/**
 * WalletHome — redesigned prototype home: balance card with sub-row, quick
 * actions (reused module preserves fund/transfer/tuition modals), recent
 * activity, digital wallet, scholarships & funding, and a Bud insight.
 */
export default function WalletHome({ wallets, walletIds, transactions, cards, ctx }) {
  const balance = wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0);
  const spentThisMonth = (transactions || [])
    .filter((t) => walletIds.includes(t.from_wallet_id) && isThisMonth(t.created_date))
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const recent = (transactions || []).slice(0, 5);
  const scholarshipTx = (transactions || []).find((t) => /scholar/i.test(t.description || ""));

  const budMsg = ctx.tuitionDue
    ? "Your tuition payment is pending. Pay now to avoid late fees."
    : ctx.scholarshipReceived
    ? "A scholarship refund was credited to your wallet. Nice work!"
    : ctx.frequentTransfer
    ? "You've made several transfers this month. Want me to set up a recurring transfer?"
    : "Track your spending here. I'll flag when you're over budget.";

  return (
    <div className="flex flex-col gap-3.5">
      {/* Balance card */}
      <div className="rounded-2xl p-5 border border-border/40 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--glass-bg-strong)), hsl(var(--glass-bg)))" }}>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Available Balance</p>
        <p className="text-[34px] font-extrabold text-foreground mt-1 tracking-tight">
          {naira(balance)} <span className="text-[18px] font-semibold text-muted-foreground/60">NGN</span>
        </p>
        <div className="flex gap-5 mt-3">
          <div>
            <p className="text-[15px] font-bold text-foreground">{naira(spentThisMonth)}</p>
            <p className="text-[10px] text-muted-foreground">Spent this month</p>
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground">{scholarshipTx ? naira(scholarshipTx.amount) : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Scholarship</p>
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground">{ctx.tuitionDue ? "Due" : "Paid"}</p>
            <p className="text-[10px] text-muted-foreground">Tuition</p>
          </div>
        </div>
      </div>

      {/* Quick actions — reused module preserves modals */}
      <QuickActions />

      {/* Recent activity */}
      <div className="crystal-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recent Activity</h3>
          <Link to="/wallet?tab=activity" className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-3 text-center">No transactions yet.</p>
        ) : recent.map((t, i) => {
          const incoming = walletIds.includes(t.to_wallet_id);
          const sign = incoming ? "+" : "-";
          return (
            <div key={t.id || i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
              <div className="w-9 h-9 rounded-full bg-muted/40 grid place-items-center text-[15px] flex-shrink-0">{txIcon(t.type, t.description)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{t.description || (t.type || "").replace(/_/g, " ")}</p>
                <p className="text-[11px] text-muted-foreground">{(t.type || "").replace(/_/g, " ")}</p>
              </div>
              <div className="text-right">
                <p className={`text-[14px] font-bold ${incoming ? "text-success" : "text-foreground"}`}>{sign}{naira(t.amount)}</p>
                <p className="text-[9px] text-muted-foreground/60">{t.status || ""}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital wallet */}
      <div className="crystal-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">📱 Digital Wallet</h3>
          <Link to="/me" className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">Manage</Link>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {DIGITAL.map((d) => (
            <Link key={d.label} to={d.to} className="flex-shrink-0 w-20 text-center bg-muted/20 border border-border/20 rounded-2xl py-2.5 spring-tap">
              <div className="text-[26px]">{d.icon}</div>
              <p className="text-[9px] font-medium text-muted-foreground mt-1">{d.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Scholarships & funding */}
      <div className="crystal-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">🎓 Scholarships & Funding</h3>
          <Link to="/scholarships" className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">Apply</Link>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[13px] text-muted-foreground py-1 border-b border-border/20">
            <span>Merit Scholarship</span>
            <span className="text-success">{scholarshipTx ? `${naira(scholarshipTx.amount)} · Approved` : "— · Apply"}</span>
          </div>
          <div className="flex justify-between text-[13px] text-muted-foreground py-1 border-b border-border/20">
            <span>STEM Grant</span>
            <span className="text-warning">₦120,000 · Pending</span>
          </div>
          <div className="flex justify-between text-[13px] text-muted-foreground py-1">
            <span>Student Loan</span>
            <span className="text-muted-foreground/60">₦500,000 · Available</span>
          </div>
        </div>
      </div>

      {/* Bud AI */}
      <Link to="/bud" className="rounded-2xl p-3.5 flex items-center gap-3 spring-tap" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.10)" }}>
        <div className="w-8 h-8 rounded-full grid place-items-center text-[14px] text-primary-foreground flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}>✦</div>
        <p className="flex-1 text-[12px] font-medium text-muted-foreground leading-snug">
          <span className="text-foreground font-semibold">Bud AI:</span> {budMsg}
        </p>
        <span className="text-[11px] font-semibold text-foreground">View →</span>
      </Link>
    </div>
  );
}