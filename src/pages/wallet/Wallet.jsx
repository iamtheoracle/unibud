import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, Wallet as WalletIcon, Loader2 } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { pollTransactionStatus } from "@/lib/finance/cardPayment";
import { queryClientInstance } from "@/lib/query-client";

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

  const { toast } = useToast();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && SECTION[tabParam]) setTab(tabParam);
    const pay = params.get("payment");
    const txId = params.get("tx");
    if (pay === "success" && txId) {
      toast({ title: "Payment received", description: "Reconciling your balance…" });
      pollTransactionStatus(txId).then((r) => {
        if (r.status === "completed") {
          toast({ title: "Payment complete", description: "Your wallet has been credited." });
          queryClientInstance.invalidateQueries({ queryKey: ["walletWallets"] });
          queryClientInstance.invalidateQueries({ queryKey: ["walletTx"] });
        } else {
          toast({ title: "Payment processing", description: "We'll update your balance shortly." });
          queryClientInstance.invalidateQueries({ queryKey: ["walletTx"] });
        }
        window.history.replaceState({}, "", "/wallet");
      });
    } else if (pay === "cancelled" && txId) {
      toast({ title: "Payment cancelled", description: "No money was taken.", variant: "destructive" });
      base44.entities.FinancialTransaction.update(txId, { status: "cancelled" }).catch(() => {});
      window.history.replaceState({}, "", "/wallet");
    }
     
  }, []);

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
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      {/* Top bar */}
      <div className="flex justify-between items-center px-1 pt-4 pb-4">
        <h1 className="font-bold text-[28px] text-foreground tracking-tight">Wallet</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate("/notifications")} className="relative w-9 h-9 rounded-full grid place-items-center spring-tap hover:bg-muted/30 transition-colors">
            <Bell className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.7} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-foreground ring-2 ring-background" />
          </button>
          <button onClick={() => setTab("cards")} className="w-9 h-9 rounded-full grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="Cards">
            <WalletIcon className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {/* Tab rail */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {WALLET_TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap spring-tap transition-colors ${
                on ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Active section */}
      <div className="pt-4">
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