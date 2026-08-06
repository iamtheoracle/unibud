import React from "react";
import { Wallet as WalletIcon, PiggyBank, Building2, GraduationCap, Gift, Globe, Plus } from "lucide-react";
import { SectionCard, Pill, formatMoney, WalletEmpty, WCOLOR, AddButton } from "../WalletShared";

const TYPES = [
  { match: /saving/i, label: "Savings Account", icon: PiggyBank, color: "success" },
  { match: /campus/i, label: "Campus Wallet", icon: Building2, color: "information" },
  { match: /scholar/i, label: "Scholarship Wallet", icon: GraduationCap, color: "warning" },
  { match: /allowance/i, label: "Allowance Wallet", icon: Gift, color: "primary" },
  { match: /intern/i, label: "International Wallet", icon: Globe, color: "information" },
  { match: /student/i, label: "Student Wallet", icon: WalletIcon, color: "primary" },
];

export default function WalletAccounts({ wallets }) {
  return (
    <div className="space-y-3">
      <SectionCard title="Your Accounts">
        {wallets.length ? (
          wallets.map((w) => {
            const t = TYPES.find((x) => x.match.test(w.owner_name || "")) || TYPES[TYPES.length - 1];
            const c = WCOLOR[t.color];
            return (
              <div key={w.id} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
                <div className={`w-10 h-10 rounded-[14px] ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <t.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{w.owner_name || t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.label} · {w.currency}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-foreground">{formatMoney(w.balance)}</p>
                  <Pill label={w.status || "active"} tone={w.status === "active" ? "success" : "muted"} />
                </div>
              </div>
            );
          })
        ) : (
          <WalletEmpty icon={WalletIcon} title="No accounts yet" desc="Open a student wallet to start managing your money." />
        )}
      </SectionCard>
      <AddButton label={<><Plus className="w-4 h-4" /> Open new account</>} />
    </div>
  );
}