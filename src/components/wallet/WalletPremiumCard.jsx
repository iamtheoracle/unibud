import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, ArrowDownLeft, Plus, Send, Coffee, Zap,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

const QUICK_ACTIONS = [
  { id: "topup", icon: Plus, label: "Top Up", color: "hsl(var(--primary))" },
  { id: "send", icon: Send, label: "Send", color: "hsl(var(--chocolate))" },
  { id: "receive", icon: ArrowDownLeft, label: "Receive", color: "hsl(var(--chocolate-light))" },
  { id: "pay", icon: Coffee, label: "Pay", color: "hsl(var(--primary))" },
];

/**
 * WalletPremiumCard — Revolut-style virtual card with balance,
 * quick actions, and premium chocolate gradient.
 *
 * Props:
 *  - balance: number
 *  - currency: string
 *  - cardNumber: string (masked)
 *  - cardHolder: string
 *  - expiry: string
 *  - onAction: (actionId) => void
 */
export default function WalletPremiumCard({
  balance = 0,
  currency = "₦",
  cardNumber = "•••• •••• •••• 4242",
  cardHolder = "STUDENT",
  expiry = "12/28",
  onAction,
}) {
  const [showBalance, setShowBalance] = useState(true);

  const formatBalance = (val) => {
    if (!showBalance) return "••••••";
    return `${currency}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-3">
      {/* Virtual Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        whileTap={{ scale: 0.98 }}
        className="relative rounded-[24px] overflow-hidden gradient-chocolate p-4 aspect-[1.6/1] flex flex-col justify-between"
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          className="absolute inset-y-0 w-1/3"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Available Balance</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[24px] font-bold text-white tabular-nums">{formatBalance(balance)}</span>
              <button onClick={() => setShowBalance(!showBalance)} className="spring-tap">
                {showBalance ? (
                  <Eye className="w-4 h-4 text-white/50" strokeWidth={2} />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/50" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card number */}
        <div className="relative z-10">
          <p className="text-[14px] text-white/80 font-mono tracking-wider">{cardNumber}</p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between relative z-10">
          <div>
            <p className="text-[8px] text-white/50 uppercase tracking-wider">Card Holder</p>
            <p className="text-[11px] text-white font-bold uppercase tracking-wide">{cardHolder}</p>
          </div>
          <div>
            <p className="text-[8px] text-white/50 uppercase tracking-wider">Expires</p>
            <p className="text-[11px] text-white font-bold">{expiry}</p>
          </div>
          {/* Chip */}
          <div className="w-8 h-6 rounded-md bg-gradient-to-br from-yellow-200/80 to-yellow-600/60" />
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.3, ease: EASE }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onAction?.(action.id)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] glass spring-tap"
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

      {/* Recent transactions preview */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent</span>
          <button className="text-[10px] font-bold text-primary spring-tap">See all</button>
        </div>
        <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] glass">
          <div className="w-8 h-8 rounded-[10px] bg-success/10 flex items-center justify-center">
            <ArrowDownLeft className="w-3.5 h-3.5 text-success" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground">Wallet Top Up</p>
            <p className="text-[9px] text-muted-foreground">Today, 2:30 PM</p>
          </div>
          <span className="text-[12px] font-bold text-success">+{currency}5,000</span>
        </div>
        <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] glass">
          <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Coffee className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground">Campus Café</p>
            <p className="text-[9px] text-muted-foreground">Today, 11:15 AM</p>
          </div>
          <span className="text-[12px] font-bold text-foreground">-{currency}850</span>
        </div>
      </div>
    </div>
  );
}