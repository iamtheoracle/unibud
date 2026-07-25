import React from "react";
import { Wallet } from "lucide-react";

export default function ParentFees() {
  return (
    <div className="max-w-[640px]">
      <div className="glass-card radius-lg p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/60 grid place-items-center mx-auto mb-3"><Wallet className="w-6 h-6 text-muted-foreground" /></div>
        <p className="font-heading font-semibold text-[15px]">Fees tracking is not enabled</p>
        <p className="text-[13px] text-muted-foreground mt-1">Your institution can enable fee monitoring for parents. When enabled, balances and payment status appear here.</p>
      </div>
    </div>
  );
}