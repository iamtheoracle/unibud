import React, { useState } from "react";
import { Sparkles, Settings2 } from "lucide-react";
import { useWalletBoard, adaptivePriority } from "@/lib/wallet/walletPrefs";
import { BalanceHero, QuickActions, UpcomingPayments, InsightsStrip, RecentActivity } from "@/components/wallet/WalletModules";
import WalletCustomize from "@/components/wallet/WalletCustomize";

const LABELS = {
  balance: "Balance", quickActions: "Quick Actions", upcoming: "Upcoming Payments",
  insights: "Insights", recent: "Recent Activity",
};

export default function WalletHome({ wallets, walletIds, transactions, ctx }) {
  const board = useWalletBoard();
  const adaptive = adaptivePriority(ctx);
  const [customize, setCustomize] = useState(false);

  const modules = {
    balance: <BalanceHero wallets={wallets} />,
    quickActions: <QuickActions />,
    upcoming: <UpcomingPayments transactions={transactions} />,
    insights: <InsightsStrip transactions={transactions} walletIds={walletIds} />,
    recent: <RecentActivity transactions={transactions} walletIds={walletIds} />,
  };

  return (
    <div className="space-y-4">
      {adaptive.highlight && (
        <div className="rounded-[20px] p-3.5 bg-primary/8 border border-primary/15 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-[12px] text-foreground font-medium">{adaptive.highlight}</p>
        </div>
      )}
      <div className="flex justify-end -mt-1">
        <button onClick={() => setCustomize(true)} className="text-[11px] font-semibold text-primary flex items-center gap-1 spring-tap">
          <Settings2 className="w-3.5 h-3.5" /> Customize board
        </button>
      </div>
      {board.visible.map((k) => <div key={k}>{modules[k]}</div>)}
      <WalletCustomize open={customize} onClose={() => setCustomize(false)} board={board} labels={LABELS} />
    </div>
  );
}