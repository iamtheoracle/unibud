import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { WALLET_TABS } from "@/components/wallet/walletNav";
import WalletHome from "@/components/wallet/sections/WalletHome";
import WalletAccounts from "@/components/wallet/sections/WalletAccounts";
import WalletCards from "@/components/wallet/sections/WalletCards";
import WalletTransactions from "@/components/wallet/sections/WalletTransactions";
import WalletSavings from "@/components/wallet/sections/WalletSavings";
import WalletLoans from "@/components/wallet/sections/WalletLoans";
import WalletBudget from "@/components/wallet/sections/WalletBudget";
import WalletInsights from "@/components/wallet/sections/WalletInsights";
import WalletSecurity from "@/components/wallet/sections/WalletSecurity";
import { useWalletAccess } from "@/lib/wallet/useWalletAccess";
import WalletActivation from "@/components/wallet/WalletActivation";

const SECTION = {
  home: WalletHome, accounts: WalletAccounts, cards: WalletCards,
  activity: WalletTransactions, savings: WalletSavings, loans: WalletLoans,
  budget: WalletBudget, insights: WalletInsights, security: WalletSecurity,
};

/**
 * Wallet — premium digital banking workspace inside the UNIBUD ecosystem.
 * Financial-first layout; Spark personalizes priority, Oracle secures everything.
 */
export default function Wallet() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  const { hasWallet, isLoading: accessLoading, user, wallets } = useWalletAccess();
  const walletIds = wallets.map((w) => w.id);

  const { data: txRaw } = useQuery({
    queryKey: ["walletTx"],
    queryFn: () => base44.entities.FinancialTransaction.list("-created_date", 60),
    enabled: walletIds.length > 0,
  });
  const transactions = (txRaw || []).filter((t) => walletIds.includes(t.from_wallet_id) || walletIds.includes(t.to_wallet_id));

  const { data: cardsRaw } = useQuery({
    queryKey: ["walletCards"],
    queryFn: () => base44.entities.Card.list(),
    enabled: walletIds.length > 0,
  });
  const cards = (cardsRaw || []).filter((c) => walletIds.includes(c.wallet_id));

  const ctx = {
    tuitionDue: transactions.some((t) => t.status === "pending" && (t.type === "tuition_payment" || t.type === "school_fee")),
    loanDue: false,
    scholarshipReceived: transactions.some((t) => t.type === "refund" && /scholar/i.test(t.description || "")),
    frequentTransfer: transactions.filter((t) => t.type === "transfer").length >= 3,
    savingsActive: wallets.some((w) => /saving/i.test(w.owner_name || "")),
  };

  if (accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }
  if (!hasWallet) {
    return <WalletActivation user={user} />;
  }

  const Active = SECTION[tab] || WalletHome;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Wallet</h1>
          <p className="text-[12px] text-muted-foreground">How can I manage my money today?</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-success" /> Oracle
        </div>
      </div>

      {/* Tab rail */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 py-3 border-b border-border/30">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {WALLET_TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
                  on ? "bg-primary text-primary-foreground soft-shadow" : "bg-card text-foreground/80 border border-border/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active section */}
      <div className="pt-4 max-w-[560px] mx-auto px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Active wallets={wallets} walletIds={walletIds} transactions={transactions} cards={cards} ctx={ctx} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}