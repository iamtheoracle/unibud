import React from "react";
import { TrendingUp, TrendingDown, Calendar, Award, Sparkles } from "lucide-react";
import { SectionCard, formatMoney, WalletEmpty } from "../WalletShared";

export default function WalletInsights({ transactions, walletIds }) {
  const tx = transactions || [];
  const now = new Date();
  const monthTx = tx.filter((t) => new Date(t.created_date).getMonth() === now.getMonth());
  const spent = monthTx.filter((t) => walletIds.includes(t.from_wallet_id)).reduce((s, t) => s + (t.amount || 0), 0);
  const received = monthTx.filter((t) => walletIds.includes(t.to_wallet_id)).reduce((s, t) => s + (t.amount || 0), 0);
  const pending = tx.filter((t) => t.status === "pending").length;

  const insights = [
    { icon: TrendingDown, label: "Spent this month", value: formatMoney(spent), tone: "text-foreground" },
    { icon: TrendingUp, label: "Received this month", value: formatMoney(received), tone: "text-success" },
    { icon: Calendar, label: "Pending payments", value: pending, tone: "text-warning" },
    { icon: Award, label: "Net this month", value: formatMoney(received - spent), tone: received - spent >= 0 ? "text-success" : "text-error" },
  ];

  if (!tx.length) {
    return <WalletEmpty icon={Sparkles} title="Insights warming up" desc="Connect your wallets and Spark will generate concise, actionable financial summaries." />;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {insights.map((i) => (
          <SectionCard key={i.label}>
            <i.icon className={`w-5 h-5 ${i.tone} mb-2`} />
            <p className="text-[10px] text-muted-foreground">{i.label}</p>
            <p className={`font-heading font-bold text-[17px] ${i.tone}`}>{i.value}</p>
          </SectionCard>
        ))}
      </div>
      <SectionCard title="Spark Summary" action={<Sparkles className="w-4 h-4 text-primary" />}>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {spent > 0
            ? `You've spent ${formatMoney(spent)} and received ${formatMoney(received)} this month. ${
                received - spent >= 0 ? "You're net positive — nice work." : "You're spending more than you received — keep an eye on it."
              }`
            : "No spending recorded this month yet. Your insights will appear here as you transact."}
        </p>
      </SectionCard>
    </div>
  );
}