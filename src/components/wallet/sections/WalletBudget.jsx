import React, { useState } from "react";
import { Utensils, Bus, Home, Music, BookOpen, ShoppingBag, Plug, Sparkles } from "lucide-react";
import { SectionCard, Pill, WCOLOR } from "../WalletShared";

const CATS = [
  { key: "food", label: "Food", icon: Utensils, color: "warning" },
  { key: "transport", label: "Transport", icon: Bus, color: "information" },
  { key: "accommodation", label: "Accommodation", icon: Home, color: "primary" },
  { key: "entertainment", label: "Entertainment", icon: Music, color: "error" },
  { key: "education", label: "Education", icon: BookOpen, color: "success" },
  { key: "shopping", label: "Shopping", icon: ShoppingBag, color: "information" },
  { key: "utilities", label: "Utilities", icon: Plug, color: "primary" },
];

const KEY = "wallet.budget";

export default function WalletBudget() {
  const [budgets, setBudgets] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } });
  const set = (k, v) => {
    const b = { ...budgets, [k]: Number(v) || 0 };
    setBudgets(b);
    try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {}
  };

  const totalLimit = CATS.reduce((s, c) => s + (budgets[c.key] || 0), 0);

  return (
    <div className="space-y-3">
      <SectionCard title="Monthly Budget" action={<Pill label="Spark insights" tone="primary" />}>
        <div className="space-y-3">
          {CATS.map((c) => {
            const limit = budgets[c.key] || 0;
            const col = WCOLOR[c.color];
            return (
              <div key={c.key} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-[12px] ${col.bg} flex items-center justify-center flex-shrink-0`}>
                  <c.icon className={`w-4 h-4 ${col.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-foreground">{c.label}</span>
                    <input
                      type="number"
                      value={limit || ""}
                      onChange={(e) => set(c.key, e.target.value)}
                      placeholder="₦0"
                      className="w-20 h-7 px-2 rounded-[10px] bg-muted/40 border border-border/40 text-[11px] text-right text-foreground"
                    />
                  </div>
                  <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                    <div className={`h-full ${col.bg}`} style={{ width: limit ? "0%" : "0%" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-border/30">
          <span className="text-[12px] font-medium text-muted-foreground">Total monthly budget</span>
          <span className="text-[13px] font-bold text-foreground">₦{totalLimit.toLocaleString()}</span>
        </div>
      </SectionCard>

      <div className="rounded-[20px] p-3.5 bg-primary/5 border border-primary/15 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">Set limits per category and Spark will track your spending automatically — with gentle, informative insights as you go.</p>
      </div>
    </div>
  );
}