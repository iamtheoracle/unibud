import React from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, CreditCard, ArrowUpRight, ArrowDownLeft, Sparkles, ChevronRight } from "lucide-react";
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

const CAT_LABELS = {
  tuition_payment: "Tuition", school_fee: "Fees", transfer: "Transfers",
  refund: "Refunds", topup: "Top-ups", payment: "Payments", default: "Other",
};

/**
 * WalletHome — bank-style dashboard.
 * Premium dark banking: balance hero, quick actions, cards, spending
 * insight, and a bank-style transaction ledger. Solid panels (not glass)
 * for a grounded, institutional-but-modern feel.
 */
export default function WalletHome({ wallets, walletIds, transactions, cards, ctx }) {
  const [hidden, setHidden] = React.useState(false);
  const balance = wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0);
  const monthTx = (transactions || []).filter((t) => walletIds.includes(t.from_wallet_id) && isThisMonth(t.created_date));
  const spentThisMonth = monthTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const incomeThisMonth = (transactions || [])
    .filter((t) => walletIds.includes(t.to_wallet_id) && isThisMonth(t.created_date))
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const recent = (transactions || []).slice(0, 6);

  // Spending breakdown by type for the insight bar
  const byCat = monthTx.reduce((acc, t) => {
    const k = CAT_LABELS[t.type] || CAT_LABELS.default;
    acc[k] = (acc[k] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {});
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const totalSpent = cats.reduce((s, [, v]) => s + v, 0) || 1;

  const acctNo = (wallets[0]?.account_number || wallets[0]?.id || "----").toString();
  const masked = acctNo.length > 4 ? `•••• ${acctNo.slice(-4)}` : acctNo;

  const budMsg = ctx.tuitionDue
    ? "Your tuition payment is pending. Pay now to avoid late fees."
    : ctx.scholarshipReceived
    ? "A scholarship refund was credited to your wallet. Nice work!"
    : spentThisMonth > 0
    ? `You've spent ${naira(spentThisMonth)} this month. ${incomeThisMonth > spentThisMonth ? "You're within budget." : "Consider slowing down."}`
    : "Track your spending here. I'll flag when you're over budget.";

  return (
    <div className="flex flex-col gap-3.5">
      {/* Balance hero — bank-style */}
      <div className="rounded-2xl p-5 border border-border/40 relative overflow-hidden bg-card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Available balance</p>
          <button onClick={() => setHidden((h) => !h)} className="text-muted-foreground spring-tap">
            {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[34px] font-extrabold text-foreground tracking-tight">
          {hidden ? "₦ ••••••" : naira(balance)} <span className="text-[16px] font-semibold text-muted-foreground/60">NGN</span>
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-medium text-muted-foreground">{masked}</span>
          <span className="text-[10px] text-muted-foreground/50">· UNIBUD Bank</span>
        </div>
        <div className="flex gap-5 mt-3 pt-3 border-t border-border/20">
          <div>
            <p className="text-[14px] font-bold text-foreground flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />{naira(spentThisMonth)}</p>
            <p className="text-[10px] text-muted-foreground">Spent this month</p>
          </div>
          <div>
            <p className="text-[14px] font-bold text-foreground flex items-center gap-1"><ArrowDownLeft className="w-3.5 h-3.5 text-success" />{naira(incomeThisMonth)}</p>
            <p className="text-[10px] text-muted-foreground">Received</p>
          </div>
          <div>
            <p className="text-[14px] font-bold text-foreground">{ctx.tuitionDue ? "Due" : "Paid"}</p>
            <p className="text-[10px] text-muted-foreground">Tuition</p>
          </div>
        </div>
      </div>

      {/* Quick actions — reused module preserves modals */}
      <QuickActions />

      {/* Cards */}
      {cards && cards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Your cards</h3>
            <Link to="/wallet?tab=cards" className="text-[11px] font-semibold text-primary spring-tap">Manage</Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {cards.slice(0, 5).map((c, i) => (
              <div key={c.id || i} className="flex-shrink-0 w-[220px] rounded-2xl p-4 border border-border/40 relative overflow-hidden bg-gradient-to-br from-secondary to-card">
                <div className="flex items-center justify-between mb-6">
                  <CreditCard className="w-5 h-5 text-foreground" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{c.type || c.brand || "Virtual"}</span>
                </div>
                <p className="text-[13px] font-semibold text-foreground tracking-widest">•••• {(c.last4 || c.card_number || "----").toString().slice(-4)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">{c.bank || "UNIBUD"}</span>
                  <span className="text-[10px] text-muted-foreground">{c.expiry || ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending insight */}
      <div className="rounded-2xl p-4 border border-border/30 bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Spending insight</h3>
          <Link to="/wallet?tab=insights" className="text-[11px] font-semibold text-primary spring-tap">Details</Link>
        </div>
        {cats.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-2 text-center">No spending yet this month.</p>
        ) : (
          <>
            <div className="flex h-2 rounded-full overflow-hidden mb-3">
              {cats.map(([label, val], i) => (
                <div key={label} style={{ width: `${(val / totalSpent) * 100}%` }} className={i === 0 ? "bg-foreground" : i === 1 ? "bg-muted-foreground" : "bg-muted-foreground/40"} />
              ))}
            </div>
            <div className="space-y-1.5">
              {cats.slice(0, 4).map(([label, val]) => (
                <div key={label} className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{naira(val)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent activity — bank-style ledger */}
      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recent activity</h3>
          <Link to="/wallet?tab=activity" className="text-[11px] font-semibold text-primary spring-tap">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-4 text-center">No transactions yet.</p>
        ) : recent.map((t, i) => {
          const incoming = walletIds.includes(t.to_wallet_id);
          const sign = incoming ? "+" : "-";
          return (
            <div key={t.id || i} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/10 last:border-0">
              <div className="w-9 h-9 rounded-full bg-muted/40 grid place-items-center text-[14px] flex-shrink-0">{txIcon(t.type, t.description)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{t.description || (t.type || "").replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(t.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {(t.type || "").replace(/_/g, " ")}</p>
              </div>
              <div className="text-right">
                <p className={`text-[14px] font-bold tabular-nums ${incoming ? "text-success" : "text-foreground"}`}>{sign}{naira(t.amount)}</p>
                <p className="text-[9px] text-muted-foreground/60">{t.status || ""}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bud insight */}
      <Link to="/bud" className="rounded-2xl p-3.5 flex items-center gap-3 spring-tap bg-card border border-border/30">
        <div className="w-8 h-8 rounded-full grid place-items-center text-foreground flex-shrink-0 bg-foreground/10">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="flex-1 text-[12px] font-medium text-muted-foreground leading-snug">
          <span className="text-foreground font-semibold">Bud:</span> {budMsg}
        </p>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Link>
    </div>
  );
}