import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, TrendingDown, Plus, Wallet } from "lucide-react";
import { formatCurrency, FINANCE_CATEGORIES, isOfficer } from "./orgConstants";
import EmptyState from "@/components/ui/EmptyState";

export default function OrgFinance({ club, user }) {
  const officer = isOfficer(club.members, user?.id);
  const [composing, setComposing] = useState(false);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["org-finance", club.id],
    queryFn: () => base44.entities.ClubFinance.filter({ club_id: club.id }, "-date", 50),
  });

  const income = (transactions || []).filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = (transactions || []).filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
  const balance = income - expenses;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-4 rounded-[20px] bg-gradient-to-br from-primary/10 to-accent/5 soft-shadow">
        <p className="text-[11px] text-muted-foreground mb-1">Current Balance</p>
        <p className="text-[28px] font-bold text-foreground display-number">{formatCurrency(balance, club.dues_currency)}</p>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-success" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground">Income</p>
              <p className="text-[12px] font-bold text-success">{formatCurrency(income, club.dues_currency)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-error/15 flex items-center justify-center"><TrendingDown className="w-3.5 h-3.5 text-error" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground">Expenses</p>
              <p className="text-[12px] font-bold text-error">{formatCurrency(expenses, club.dues_currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {officer && (
        <button onClick={() => setComposing(!composing)} className="w-full flex items-center justify-center gap-2 p-3 rounded-[16px] bg-primary/10 text-primary spring-tap">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">Record Transaction</span>
        </button>
      )}

      {composing && <TransactionComposer club={club} user={user} onClose={() => setComposing(false)} />}

      {/* Transactions */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-[16px] shimmer" />)}</div>
      ) : (transactions || []).length === 0 ? (
        <EmptyState icon={Wallet} title="No transactions yet" description="Income and expenses will be tracked here." />
      ) : (
        <div className="space-y-2">
          {(transactions || []).map((t) => {
            const cat = FINANCE_CATEGORIES[t.category] || FINANCE_CATEGORIES.misc;
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-[16px] bg-card soft-shadow">
                <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${t.type === "income" ? "bg-success/10" : "bg-error/10"}`}>
                  {t.type === "income" ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-error" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{t.description || cat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.date} · {cat.label} · {t.recorded_by_name}</p>
                </div>
                <p className={`text-[14px] font-bold ${t.type === "income" ? "text-success" : "text-error"}`}>
                  {t.type === "income" ? "+" : "−"}{formatCurrency(t.amount, t.currency)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TransactionComposer({ club, user, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("misc");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    await base44.entities.ClubFinance.create({
      club_id: club.id,
      club_name: club.name,
      type,
      amount: amt,
      currency: club.dues_currency || "NGN",
      category,
      description: desc.trim(),
      date,
      status: "approved",
      recorded_by_name: user.full_name,
      recorded_by_id: user.id,
      institution_id: club.institution_id,
    });
    qc.invalidateQueries({ queryKey: ["org-finance", club.id] });
    toast({ title: "Transaction recorded", description: `${formatCurrency(amt, club.dues_currency)} ${type}` });
    onClose();
  };

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow space-y-3">
      <p className="text-[13px] font-bold text-foreground">Record Transaction</p>
      <div className="flex gap-2">
        <button onClick={() => setType("income")} className={`flex-1 py-2.5 rounded-[12px] text-[12px] font-semibold spring-tap ${type === "income" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>Income</button>
        <button onClick={() => setType("expense")} className={`flex-1 py-2.5 rounded-[12px] text-[12px] font-semibold spring-tap ${type === "expense" ? "bg-error text-error-foreground" : "bg-muted text-muted-foreground"}`}>Expense</button>
      </div>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[14px] font-bold focus:outline-none focus:border-primary/40" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40">
        {Object.entries(FINANCE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Save</button>
      </div>
    </div>
  );
}