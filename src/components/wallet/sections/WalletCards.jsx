import React, { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";
import { Pill, formatMoney, WalletEmpty } from "../WalletShared";

export default function WalletCards({ cards, wallets }) {
  const [busy, setBusy] = useState(null);
  const { toast } = useToast();

  const toggleFreeze = async (c) => {
    setBusy(c.id);
    try {
      const next = c.status === "frozen" ? "active" : "frozen";
      await base44.entities.Card.update(c.id, { status: next });
      toast({ title: next === "frozen" ? "Card frozen" : "Card unfrozen" });
      queryClientInstance.invalidateQueries({ queryKey: ["walletCards"] });
    } catch (e) {
      toast({ title: "Action failed", description: e.message });
    }
    setBusy(null);
  };

  return (
    <div className="space-y-3">
      {cards.length ? (
        cards.map((c) => {
          const wallet = wallets.find((w) => w.id === c.wallet_id);
          const frozen = c.status === "frozen";
          return (
            <div
              key={c.id}
              className="rounded-[24px] p-5 soft-shadow border border-white/10 relative overflow-hidden"
              style={{ background: frozen ? "linear-gradient(135deg,#475569,#334155)" : "linear-gradient(135deg, hsl(222 75% 17%), hsl(221 83% 40%))" }}
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5 blur-2xl" />
              <div className="flex items-center justify-between relative">
                <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{c.type || "virtual"} card</span>
                {frozen && <Pill label="Frozen" tone="info" />}
              </div>
              <p className="font-mono text-[15px] text-white tracking-widest mt-5 relative">{c.masked_number || "•••• •••• •••• 0000"}</p>
              <div className="flex items-end justify-between mt-3 relative">
                <div>
                  <p className="text-[9px] text-white/50">Linked to</p>
                  <p className="text-[12px] text-white font-medium">{wallet?.owner_name || "Student Wallet"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/50">Daily limit</p>
                  <p className="text-[12px] text-white font-medium">{formatMoney(c.daily_limit)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 relative">
                <button
                  onClick={() => toggleFreeze(c)}
                  disabled={busy === c.id}
                  className="flex-1 py-2 rounded-[12px] bg-white/15 text-white text-[11px] font-semibold spring-tap disabled:opacity-50"
                >
                  {frozen ? "Unfreeze" : "Freeze"}
                </button>
                <button className="flex-1 py-2 rounded-[12px] bg-white/10 text-white text-[11px] font-semibold spring-tap">Details</button>
              </div>
            </div>
          );
        })
      ) : (
        <WalletEmpty icon={CreditCard} title="No cards yet" desc="Request a virtual card to start spending from your wallet." />
      )}
      <button className="w-full p-3.5 rounded-[20px] bg-primary/8 border border-primary/15 flex items-center justify-center gap-2 spring-tap text-primary text-[13px] font-semibold">
        <Plus className="w-4 h-4" /> Request virtual card
      </button>
    </div>
  );
}