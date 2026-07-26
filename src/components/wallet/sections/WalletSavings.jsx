import React, { useState } from "react";
import { PiggyBank, Plus, Sparkles } from "lucide-react";
import { SectionCard, formatMoney, WalletEmpty } from "../WalletShared";

const KEY = "wallet.savings.goals";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };

export default function WalletSavings() {
  const [goals, setGoals] = useState(load);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const save = (g) => { setGoals(g); try { localStorage.setItem(KEY, JSON.stringify(g)); } catch {} };
  const add = () => {
    if (!name || !target) return;
    save([...goals, { id: Date.now(), name, target: Number(target), saved: 0 }]);
    setName(""); setTarget("");
  };
  const fund = (id, amt) => save(goals.map((g) => (g.id === id ? { ...g, saved: g.saved + amt } : g)));

  return (
    <div className="space-y-3">
      <SectionCard title="Savings Goals">
        {goals.length ? (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100) || 0);
            return (
              <div key={g.id} className="py-3 border-b border-border/30 last:border-0">
                <div className="flex justify-between items-center">
                  <p className="text-[13px] font-semibold text-foreground">{g.name}</p>
                  <span className="text-[11px] text-muted-foreground">{formatMoney(g.saved)} / {formatMoney(g.target)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: pct + "%" }} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => fund(g.id, 1000)} className="px-3 py-1.5 rounded-full bg-success/10 text-success text-[11px] font-semibold spring-tap">+₦1,000</button>
                  <button onClick={() => fund(g.id, 5000)} className="px-3 py-1.5 rounded-full bg-success/10 text-success text-[11px] font-semibold spring-tap">+₦5,000</button>
                </div>
              </div>
            );
          })
        ) : (
          <WalletEmpty icon={PiggyBank} title="Start saving" desc="Create a goal — tuition, emergency, travel, books. Spark will suggest amounts based on your spending." />
        )}
      </SectionCard>

      <SectionCard title="New Goal">
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Goal name (e.g. Tuition)" className="w-full h-11 px-3.5 rounded-[14px] bg-muted/40 border border-border/40 text-[13px]" />
          <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" placeholder="Target amount" className="w-full h-11 px-3.5 rounded-[14px] bg-muted/40 border border-border/40 text-[13px]" />
          <button onClick={add} className="w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Add goal
          </button>
        </div>
      </SectionCard>

      <div className="rounded-[20px] p-3.5 bg-primary/5 border border-primary/15 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">Round-up savings and automatic savings are coming soon — Spark will help you save without thinking about it.</p>
      </div>
    </div>
  );
}