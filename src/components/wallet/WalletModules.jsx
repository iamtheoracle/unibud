import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, GraduationCap, ArrowLeftRight, Sparkles, QrCode } from "lucide-react";
import { SectionCard, Pill, formatMoney, WalletEmpty } from "./WalletShared";
import { useToast } from "@/components/ui/use-toast";
import FundWalletModal from "./FundWalletModal";
import PayFeesModal from "./PayFeesModal";
import TransferModal from "./TransferModal";
import QRPayModal from "./QRPayModal";

export function BalanceHero({ wallets }) {
  const available = wallets.reduce((s, w) => s + (w.available_balance || w.balance || 0), 0);
  const savings = wallets.filter((w) => /saving/i.test(w.owner_name || "")).reduce((s, w) => s + (w.balance || 0), 0);
  const scholarship = wallets.filter((w) => /scholar/i.test(w.owner_name || "")).reduce((s, w) => s + (w.balance || 0), 0);
  return (
    <div
      className="rounded-[28px] p-5 soft-shadow border border-white/10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(222 75% 17%), hsl(221 83% 34%))" }}
    >
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/5 blur-2xl" />
      <p className="text-[11px] text-white/60 font-medium relative">Available Balance</p>
      <p className="font-heading font-extrabold text-[32px] text-white tracking-tight mt-0.5 relative">{formatMoney(available)}</p>
      <div className="flex gap-6 mt-4 relative">
        <div>
          <p className="text-[10px] text-white/55 font-medium">Savings</p>
          <p className="font-heading font-bold text-[15px] text-white">{formatMoney(savings)}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/55 font-medium">Scholarship Funds</p>
          <p className="font-heading font-bold text-[15px] text-white">{formatMoney(scholarship)}</p>
        </div>
      </div>
    </div>
  );
}

export function QuickActions({ wallets, institutionId }) {
  const wallet = (wallets || [])[0];
  const [fundOpen, setFundOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const actions = [
    { icon: ArrowDownLeft, label: "Add Money", tone: "bg-success/10", color: "text-success", onClick: () => setFundOpen(true) },
    { icon: GraduationCap, label: "School Fees", tone: "bg-primary/10", color: "text-primary", onClick: () => setFeesOpen(true) },
    { icon: ArrowUpRight, label: "Transfer", tone: "bg-accent/10", color: "text-accent", onClick: () => setTransferOpen(true) },
    { icon: QrCode, label: "QR Pay", tone: "bg-warning/10", color: "text-warning", onClick: () => setQrOpen(true) },
  ];
  return (
    <SectionCard title="Quick Actions">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((a) => (
          <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-1.5 spring-tap">
            <div className={`w-12 h-12 rounded-[18px] ${a.tone} border border-border/40 flex items-center justify-center`}>
              <a.icon className={`w-5 h-5 ${a.color}`} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
      <FundWalletModal open={fundOpen} onClose={() => setFundOpen(false)} wallet={wallet} institutionId={institutionId} />
      <PayFeesModal open={feesOpen} onClose={() => setFeesOpen(false)} institutionId={institutionId} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} wallet={wallet} institutionId={institutionId} />
      <QRPayModal open={qrOpen} onClose={() => setQrOpen(false)} wallet={wallet} />
    </SectionCard>
  );
}

export function UpcomingPayments({ transactions }) {
  const pending = (transactions || []).filter((t) => t.status === "pending").slice(0, 4);
  if (!pending.length) return null;
  return (
    <SectionCard title="Upcoming Payments" action={<Pill label={`${pending.length} pending`} tone="warning" />}>
      <div>
        {pending.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
            <div>
              <p className="text-[12px] font-semibold text-foreground">{t.description || t.type}</p>
              <p className="text-[10px] text-muted-foreground">{t.reference || "Pending"}</p>
            </div>
            <span className="text-[13px] font-bold text-foreground">{formatMoney(t.amount)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function InsightsStrip({ transactions, walletIds }) {
  const now = new Date();
  const monthTx = (transactions || []).filter((t) => new Date(t.created_date).getMonth() === now.getMonth());
  const spent = monthTx.filter((t) => walletIds.includes(t.from_wallet_id)).reduce((s, t) => s + (t.amount || 0), 0);
  const received = monthTx.filter((t) => walletIds.includes(t.to_wallet_id)).reduce((s, t) => s + (t.amount || 0), 0);
  return (
    <SectionCard title="Financial Insights" action={<Pill label="Spark" tone="primary" />}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-muted/40 p-3">
          <p className="text-[10px] text-muted-foreground">Spent this month</p>
          <p className="font-heading font-bold text-[16px] text-foreground">{formatMoney(spent)}</p>
        </div>
        <div className="rounded-[16px] bg-muted/40 p-3">
          <p className="text-[10px] text-muted-foreground">Received</p>
          <p className="font-heading font-bold text-[16px] text-success">{formatMoney(received)}</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        {spent > 0
          ? `You've spent ${formatMoney(spent)} this month. Keep your budget on track.`
          : "Connect your wallets to see spending insights and trends."}
      </p>
    </SectionCard>
  );
}

export function RecentActivity({ transactions, walletIds }) {
  const recent = (transactions || []).slice(0, 5);
  if (!recent.length) {
    return (
      <SectionCard title="Recent Activity">
        <WalletEmpty icon={ArrowLeftRight} title="No activity yet" desc="Your transactions will appear here." />
      </SectionCard>
    );
  }
  return (
    <SectionCard title="Recent Activity" action={<span className="text-[11px] text-primary font-semibold">See all</span>}>
      <div>
        {recent.map((t) => {
          const credit = walletIds.includes(t.to_wallet_id) && !walletIds.includes(t.from_wallet_id);
          const debit = walletIds.includes(t.from_wallet_id);
          return (
            <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
              <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${credit ? "bg-success/10" : debit ? "bg-error/10" : "bg-muted"}`}>
                {credit ? <ArrowDownLeft className="w-4 h-4 text-success" /> : <ArrowUpRight className="w-4 h-4 text-error" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{t.description || t.type}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(t.created_date).toLocaleDateString()}</p>
              </div>
              <span className={`text-[13px] font-bold ${credit ? "text-success" : "text-foreground"}`}>
                {credit ? "+" : "-"}{formatMoney(t.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}