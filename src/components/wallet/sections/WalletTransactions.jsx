import React, { useState } from "react";
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { SectionCard, formatMoney, WalletEmpty } from "../WalletShared";

const FILTERS = [
  { k: "all", label: "All" },
  { k: "credit", label: "Credit" },
  { k: "debit", label: "Debit" },
  { k: "pending", label: "Pending" },
];

export default function WalletTransactions({ transactions, walletIds }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = (transactions || []).filter((t) => {
    const credit = walletIds.includes(t.to_wallet_id) && !walletIds.includes(t.from_wallet_id);
    const debit = walletIds.includes(t.from_wallet_id);
    if (filter === "credit" && !credit) return false;
    if (filter === "debit" && !debit) return false;
    if (filter === "pending" && t.status !== "pending") return false;
    if (q && !`${t.description || ""} ${t.type} ${t.reference || ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search transactions"
          className="w-full h-11 pl-10 pr-4 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
              filter === f.k ? "bg-primary text-primary-foreground soft-shadow" : "bg-card text-muted-foreground border border-border/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <SectionCard title={`${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`}>
        {filtered.length ? (
          <div>
            {filtered.map((t) => {
              const credit = walletIds.includes(t.to_wallet_id) && !walletIds.includes(t.from_wallet_id);
              const debit = walletIds.includes(t.from_wallet_id);
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                  <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${credit ? "bg-success/10" : debit ? "bg-error/10" : "bg-muted"}`}>
                    {credit ? <ArrowDownLeft className="w-4 h-4 text-success" /> : <ArrowUpRight className="w-4 h-4 text-error" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">{t.description || t.type}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.created_date).toLocaleDateString()} · {t.status}</p>
                  </div>
                  <span className={`text-[13px] font-bold ${credit ? "text-success" : "text-foreground"}`}>
                    {credit ? "+" : debit ? "-" : ""}{formatMoney(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <WalletEmpty icon={Search} title="No transactions found" desc="Try a different search or filter." />
        )}
      </SectionCard>
    </div>
  );
}