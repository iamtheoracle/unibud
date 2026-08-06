import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, Send,
  Coffee, ShoppingBag, Receipt,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const QUICK_ACTIONS = [
  { id: "topup", icon: Plus, label: "Top Up", color: "hsl(var(--primary))" },
  { id: "send", icon: Send, label: "Send", color: "hsl(var(--chocolate))" },
  { id: "receive", icon: ArrowDownLeft, label: "Receive", color: "hsl(var(--chocolate-light))" },
  { id: "pay", icon: Receipt, label: "Pay", color: "hsl(var(--primary))" },
];

const TRANSACTION_ICONS = {
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  payment: Coffee,
  purchase: ShoppingBag,
  transfer: Send,
};

/**
 * WalletScreen — production-ready campus wallet.
 * Connects to Wallet and WalletLedger entities.
 * Supports loading, empty, error, offline states with pull-to-refresh.
 *
 * Props:
 *  - onAction: (actionId) => void
 *  - onTransactionPress: (transaction) => void
 */
export default function WalletScreen({ onAction, onTransactionPress }) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [showBalance, setShowBalance] = useState(true);

  // Fetch wallet
  const {
    data: wallet,
    isLoading: walletLoading,
    isError: walletError,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => base44.entities.Wallet.list("-created_date", 1),
    enabled: isOnline,
  });

  // Fetch transactions
  const {
    data: transactions,
    isLoading: txLoading,
    isError: txError,
    refetch: refetchTx,
  } = useQuery({
    queryKey: ["wallet", "ledger"],
    queryFn: () => base44.entities.WalletLedger.list("-created_date", 20),
    enabled: isOnline,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["wallet"] });
  }, [queryClient]);

  const handleRetry = useCallback(() => {
    refetchWallet();
    refetchTx();
  }, [refetchWallet, refetchTx]);

  const allLoading = walletLoading && txLoading;
  const anyError = (walletError || txError) && !allLoading;
  const state = !isOnline ? "offline" : allLoading ? "loading" : anyError ? "error" : "ready";

  const walletData = wallet?.[0];
  const balance = walletData?.balance || 0;
  const currency = walletData?.currency || "₦";
  const txList = transactions || [];

  return (
    <ProductionState
      state={state}
      onRetry={handleRetry}
      onRefresh={handleRefresh}
      skeleton={<WalletSkeleton />}
      error="We couldn't load your wallet. Please try again."
    >
      <div className="px-4 py-5 space-y-5 max-w-[600px] mx-auto pb-24">
        {/* Wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[24px] overflow-hidden bg-chocolate p-4 aspect-[1.6/1] flex flex-col justify-between"
        >
          {/* Subtle shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                Available Balance
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[24px] font-bold text-white tabular-nums">
                  {showBalance ? formatMoney(balance, currency) : "••••••"}
                </span>
                <button onClick={() => setShowBalance(!showBalance)} className="active:scale-90 transition-transform">
                  {showBalance ? (
                    <Eye className="w-4 h-4 text-white/50" strokeWidth={2} />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white/50" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">UNIBUD</span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[13px] text-white/80 font-mono tracking-wider">
              {showBalance ? `•••• •••• •••• ${walletData?.last_four || "4242"}` : "•••• •••• •••• ••••"}
            </p>
          </div>

          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-[8px] text-white/50 uppercase tracking-wider">Card Holder</p>
              <p className="text-[11px] text-white font-bold uppercase tracking-wide">
                {walletData?.holder_name || "Student"}
              </p>
            </div>
            <div>
              <p className="text-[8px] text-white/50 uppercase tracking-wider">Expires</p>
              <p className="text-[11px] text-white font-bold">{walletData?.expiry || "12/28"}</p>
            </div>
            <div className="w-8 h-6 rounded-md bg-gradient-to-br from-yellow-200/80 to-yellow-600/60" />
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => onAction?.(action.id)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] bg-card shadow-sm"
              >
                <div
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                  style={{ background: `${action.color}15` }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: action.color }} />
                </div>
                <span className="text-[9px] font-bold text-foreground">{action.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">Recent Transactions</h3>
            <button className="text-[11px] font-bold text-primary active:scale-95 transition-transform">
              See all
            </button>
          </div>

          {txList.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 rounded-[16px] bg-card shadow-sm">
              <Receipt className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
              <p className="text-[12px] text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {txList.map((tx, i) => (
                <TransactionRow
                  key={tx.id || i}
                  transaction={tx}
                  currency={currency}
                  onPress={() => onTransactionPress?.(tx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProductionState>
  );
}

function TransactionRow({ transaction, currency, onPress }) {
  const type = transaction.type || transaction.transaction_type || "debit";
  const Icon = TRANSACTION_ICONS[type] || Receipt;
  const isCredit = type === "credit";
  const amount = transaction.amount || 0;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div
        className={`w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
          isCredit ? "bg-success/10" : "bg-primary/10"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${isCredit ? "text-success" : "text-primary"}`}
          strokeWidth={2.2}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">
          {transaction.description || transaction.title || transaction.merchant || "Transaction"}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDate(transaction.created_date || transaction.date)}
        </p>
      </div>
      <span className={`text-[13px] font-bold tabular-nums ${isCredit ? "text-success" : "text-foreground"}`}>
        {isCredit ? "+" : "-"}
        {formatMoney(amount, currency)}
      </span>
    </motion.button>
  );
}

function formatMoney(amount, currency = "₦") {
  return `${currency}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function WalletSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-[24px] bg-card shadow-sm aspect-[1.6/1] animate-pulse" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}