import React from "react";
import { motion } from "framer-motion";
import { Bell, Sun } from "lucide-react";
import BudCharacter from "@/components/brand/BudCharacter";

const EASE = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/**
 * HomeHeader — greeting, current date, small weather chip, notification
 * bell, profile avatar, and a small Bud companion near the greeting.
 */
export default function HomeHeader({ user, notifications }) {
  const name = user?.full_name?.split(" ")[0] || "there";
  const unread = notifications?.length || 0;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(127,216,255,0.4), transparent 65%)", filter: "blur(8px)" }}
            />
            <div className="relative w-9 h-9 rounded-full glass-strong overflow-hidden ring-1 ring-primary/25">
              <BudCharacter animate={false} glow={false} className="w-full h-full" />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">{todayLabel()}</span>
        </div>
        <h1 className="font-heading font-bold text-[26px] tracking-tight text-foreground leading-[1.15]">
          {greeting()},<br />
          {name}
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-3 h-10 rounded-2xl glass">
          <Sun className="w-4 h-4 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">28°</span>
        </div>
        <button className="relative w-10 h-10 rounded-2xl glass flex items-center justify-center spring-tap">
          <Bell className="w-[18px] h-[18px] text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <button className="w-10 h-10 rounded-full glass-strong flex items-center justify-center ring-1 ring-primary/20 spring-tap">
          <span className="font-heading font-bold text-[15px] text-foreground">
            {(user?.full_name || "U").charAt(0).toUpperCase()}
          </span>
        </button>
      </div>
    </motion.header>
  );
}